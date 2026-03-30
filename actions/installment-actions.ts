"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { togglePaid } from "@/actions/expense-actions";
import type {
  InstallmentPurchaseDTO,
  InstallmentPaymentDTO,
  InstallmentProgressOverviewDTO,
} from "@/lib/types";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

const createInstallmentSchema = z.object({
  expenseId: z.string().uuid(),
  productName: z.string().min(1).max(200),
  totalPrice: z.coerce.number().positive(),
  totalInstallments: z.coerce.number().int().min(1).max(360),
  installmentAmount: z.coerce.number().positive(),
  startYear: z.coerce.number().int(),
  startMonth: z.coerce.number().int().min(1).max(12),
  notes: z.string().max(500).optional().nullable(),
  markPreviousAsPaid: z.boolean().optional().default(false),
});

export async function createInstallmentPurchase(input: unknown): Promise<InstallmentPurchaseDTO> {
  const userId = await requireUserId();
  const data = createInstallmentSchema.parse(input);

  // Verify the expense belongs to this user
  const expense = await prisma.expense.findFirst({
    where: { id: data.expenseId, userId, deletedAt: null },
  });
  if (!expense) throw new Error("Expense not found");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  let paidCount = 0;

  const purchase = await prisma.$transaction(async (tx) => {
    const created = await tx.installmentPurchase.create({
      data: {
        expenseId: data.expenseId,
        productName: data.productName,
        totalPrice: data.totalPrice,
        totalInstallments: data.totalInstallments,
        installmentAmount: data.installmentAmount,
        startYear: data.startYear,
        startMonth: data.startMonth,
        notes: data.notes,
      },
    });

    // Pre-generate all InstallmentPayment rows
    const payments = [];
    let y = data.startYear;
    let m = data.startMonth;
    for (let i = 1; i <= data.totalInstallments; i++) {
      const isPrevious =
        data.markPreviousAsPaid &&
        (y < currentYear || (y === currentYear && m < currentMonth));

      if (isPrevious) {
        paidCount += 1;
      }

      payments.push({
        installmentPurchaseId: created.id,
        installmentNumber: i,
        year: y,
        month: m,
        amount: data.installmentAmount,
        isPaid: isPrevious,
        paidAt: isPrevious ? now : null,
      });

      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    await tx.installmentPayment.createMany({ data: payments });

    return created;
  });

  revalidatePath("/expenses");
  revalidatePath("/monthly");
  revalidatePath(`/expenses/${data.expenseId}/installments`);

  return {
    id: purchase.id,
    expenseId: purchase.expenseId,
    productName: purchase.productName,
    totalPrice: Number(purchase.totalPrice),
    totalInstallments: purchase.totalInstallments,
    installmentAmount: Number(purchase.installmentAmount),
    startYear: purchase.startYear,
    startMonth: purchase.startMonth,
    notes: purchase.notes,
    paidCount,
    pendingCount: data.totalInstallments - paidCount,
    createdAt: purchase.createdAt,
  };
}

export async function listInstallmentPurchases(expenseId: string): Promise<InstallmentPurchaseDTO[]> {
  const userId = await requireUserId();

  // Verify expense ownership
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, userId, deletedAt: null },
  });
  if (!expense) throw new Error("Expense not found");

  const purchases = await prisma.installmentPurchase.findMany({
    where: { expenseId },
    include: {
      payments: {
        select: { isPaid: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return purchases.map((p) => {
    const paidCount = p.payments.filter((pay) => pay.isPaid).length;
    const pendingCount = p.payments.filter((pay) => !pay.isPaid).length;
    return {
      id: p.id,
      expenseId: p.expenseId,
      productName: p.productName,
      totalPrice: Number(p.totalPrice),
      totalInstallments: p.totalInstallments,
      installmentAmount: Number(p.installmentAmount),
      startYear: p.startYear,
      startMonth: p.startMonth,
      notes: p.notes,
      paidCount,
      pendingCount,
      createdAt: p.createdAt,
    };
  });
}

export async function deleteInstallmentPurchase(id: string): Promise<void> {
  const userId = await requireUserId();

  // Verify ownership via expense
  const purchase = await prisma.installmentPurchase.findFirst({
    where: { id },
    include: { expense: { select: { userId: true } } },
  });
  if (!purchase || purchase.expense.userId !== userId) {
    throw new Error("Installment purchase not found");
  }

  await prisma.installmentPurchase.delete({ where: { id } });

  revalidatePath("/expenses");
  revalidatePath("/monthly");
  revalidatePath(`/expenses/${purchase.expenseId}/installments`);
}

export async function getPendingInstallmentsForMonth(
  expenseId: string,
  year: number,
  month: number
): Promise<InstallmentPaymentDTO[]> {
  const userId = await requireUserId();

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, userId, deletedAt: null },
  });
  if (!expense) throw new Error("Expense not found");

  const payments = await prisma.installmentPayment.findMany({
    where: {
      year,
      month,
      isPaid: false,
      installmentPurchase: { expenseId },
    },
    include: {
      installmentPurchase: {
        select: { productName: true, totalInstallments: true },
      },
    },
    orderBy: [
      { installmentPurchase: { productName: "asc" } },
      { installmentNumber: "asc" },
    ],
  });

  return payments.map((p) => ({
    id: p.id,
    installmentPurchaseId: p.installmentPurchaseId,
    installmentNumber: p.installmentNumber,
    year: p.year,
    month: p.month,
    amount: Number(p.amount),
    isPaid: p.isPaid,
    paidAt: p.paidAt,
    productName: p.installmentPurchase.productName,
    totalInstallments: p.installmentPurchase.totalInstallments,
  }));
}

export async function markInstallmentsPaid(
  payments: Array<{ paymentId: string; amount: number }>,
  expenseId: string,
  year: number,
  month: number,
  additionalAmount?: number
): Promise<void> {
  const userId = await requireUserId();

  if (payments.length === 0 && (!additionalAmount || additionalAmount <= 0)) {
    throw new Error("No installment payments were provided");
  }

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, userId, deletedAt: null },
  });
  if (!expense) throw new Error("Expense not found");

  const now = new Date();

  if (payments.length === 0) {
    const existingOccurrence = await prisma.expenseOccurrence.findUnique({
      where: {
        expenseId_year_month: {
          expenseId,
          year,
          month,
        },
      },
      select: { id: true, isPaid: true },
    });

    if (existingOccurrence?.isPaid) {
      await prisma.expenseOccurrence.update({
        where: { id: existingOccurrence.id },
        data: {
          isPaid: true,
          paidAt: now,
          amount: additionalAmount,
        },
      });
    } else {
      await togglePaid(expenseId, year, month, additionalAmount);
    }

    revalidatePath("/monthly");
    revalidatePath("/dashboard");
    revalidatePath(`/expenses/${expenseId}/installments`);
    return;
  }

  const normalizedPayments = payments.map((payment) => {
    if (!payment.paymentId) {
      throw new Error("Invalid installment payment id");
    }

    if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
      throw new Error("Installment amount must be greater than 0");
    }

    return {
      paymentId: payment.paymentId,
      amount: Number(payment.amount),
    };
  });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.installmentPayment.findMany({
      where: {
        id: { in: normalizedPayments.map((p) => p.paymentId) },
      },
      include: {
        installmentPurchase: {
          select: { expenseId: true },
        },
      },
    });

    if (existing.length !== normalizedPayments.length) {
      throw new Error("Some installment payments could not be found");
    }

    const invalidPayment = existing.find(
      (payment) =>
        payment.installmentPurchase.expenseId !== expenseId ||
        payment.year !== year ||
        payment.month !== month ||
        payment.isPaid
    );

    if (invalidPayment) {
      throw new Error("One or more installments are invalid or already paid");
    }

    for (const payment of normalizedPayments) {
      const updated = await tx.installmentPayment.updateMany({
        where: {
          id: payment.paymentId,
          isPaid: false,
        },
        data: {
          isPaid: true,
          paidAt: now,
          amount: payment.amount,
        },
      });

      if (updated.count !== 1) {
        throw new Error("Failed to mark installment payment as paid");
      }
    }
  });

  // Calculate total and mark the parent expense occurrence as paid
  const total =
    normalizedPayments.reduce((sum, p) => sum + p.amount, 0) +
    (additionalAmount ?? 0);

  const existingOccurrence = await prisma.expenseOccurrence.findUnique({
    where: {
      expenseId_year_month: {
        expenseId,
        year,
        month,
      },
    },
    select: { id: true, isPaid: true },
  });

  if (existingOccurrence?.isPaid) {
    await prisma.expenseOccurrence.update({
      where: { id: existingOccurrence.id },
      data: {
        isPaid: true,
        paidAt: now,
        amount: total,
      },
    });
  } else {
    await togglePaid(expenseId, year, month, total);
  }

  revalidatePath("/monthly");
  revalidatePath("/dashboard");
  revalidatePath(`/expenses/${expenseId}/installments`);
}

export async function getInstallmentProgressOverview(
  year?: number,
  month?: number,
): Promise<InstallmentProgressOverviewDTO> {
  const userId = await requireUserId();
  const now = new Date();
  const selectedYear = year ?? now.getFullYear();
  const selectedMonth = month ?? now.getMonth() + 1;

  const purchases = await prisma.installmentPurchase.findMany({
    where: {
      expense: {
        userId,
        deletedAt: null,
        active: true,
      },
    },
    include: {
      expense: {
        select: {
          id: true,
          name: true,
        },
      },
      payments: {
        select: {
          installmentNumber: true,
          year: true,
          month: true,
          amount: true,
          isPaid: true,
        },
        orderBy: {
          installmentNumber: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const items = purchases.map((purchase) => {
    const paidCount = purchase.payments.filter((payment) => payment.isPaid).length;
    const pendingPayments = purchase.payments.filter((payment) => !payment.isPaid);
    const pendingCount = pendingPayments.length;
    const progressPercentage =
      purchase.totalInstallments > 0
        ? (paidCount / purchase.totalInstallments) * 100
        : 0;

    const dueThisMonthAmount = pendingPayments
      .filter(
        (payment) =>
          payment.year === selectedYear && payment.month === selectedMonth,
      )
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const remainingAmount = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    const nextPayment = pendingPayments[0];

    return {
      purchaseId: purchase.id,
      expenseId: purchase.expense.id,
      expenseName: purchase.expense.name,
      productName: purchase.productName,
      totalInstallments: purchase.totalInstallments,
      paidCount,
      pendingCount,
      progressPercentage,
      remainingAmount,
      dueThisMonthAmount,
      nextInstallmentNumber: nextPayment?.installmentNumber,
      nextInstallmentYear: nextPayment?.year,
      nextInstallmentMonth: nextPayment?.month,
      isCompleted: pendingCount === 0,
    };
  });

  const totalProducts = items.length;
  const completedProducts = items.filter((item) => item.isCompleted).length;
  const activeProducts = totalProducts - completedProducts;
  const totalPendingAmount = items.reduce(
    (sum, item) => sum + item.remainingAmount,
    0,
  );
  const dueThisMonthAmount = items.reduce(
    (sum, item) => sum + item.dueThisMonthAmount,
    0,
  );

  const orderedItems = [...items].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    if (b.dueThisMonthAmount !== a.dueThisMonthAmount) {
      return b.dueThisMonthAmount - a.dueThisMonthAmount;
    }
    return a.productName.localeCompare(b.productName);
  });

  return {
    year: selectedYear,
    month: selectedMonth,
    totalProducts,
    completedProducts,
    activeProducts,
    totalPendingAmount,
    dueThisMonthAmount,
    items: orderedItems,
  };
}
