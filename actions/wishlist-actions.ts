"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasMaterialFinancingShortfall } from "@/lib/wishlist-financing";
import type {
  WishlistItemDTO,
  WishlistPriority,
  WishlistStatus,
  WishlistSummaryDTO,
} from "@/lib/types";

const wishlistInputSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
    cashPrice: z.coerce.number().positive("El precio debe ser mayor a 0"),
    totalInstallments: z.coerce.number().int().min(1).max(360),
    installmentAmount: z.coerce
      .number()
      .positive("El importe de la cuota debe ser mayor a 0"),
    subcategoryId: z.string().uuid(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    url: z
      .union([z.string().trim().url("Ingresá una URL válida").max(2048), z.literal("")])
      .optional()
      .nullable(),
  })
  .superRefine((data, context) => {
    if (
      hasMaterialFinancingShortfall(
        data.cashPrice,
        data.totalInstallments,
        data.installmentAmount,
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentAmount"],
        message: "El total financiado no puede ser menor al precio de contado",
      });
    }
  });

const wishlistStatusSchema = z.enum(["PLANNED", "COMPLETED", "DISCARDED"]);

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

async function requireOwnedSubcategory(userId: string, subcategoryId: string) {
  const subcategory = await prisma.subcategory.findFirst({
    where: {
      id: subcategoryId,
      category: { userId },
    },
    select: { id: true },
  });

  if (!subcategory) {
    throw new Error("La subcategoría seleccionada no existe");
  }
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function getMonthlyFinancialContext(userId: string, year: number, month: number) {
  const [salary, categories, expenses] = await Promise.all([
    prisma.salary.findUnique({
      where: { userId_year_month: { userId, year, month } },
      select: { amount: true },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { id: true, budgetPercentage: true },
    }),
    prisma.expense.findMany({
      where: {
        userId,
        active: true,
        deletedAt: null,
        occurrences: { some: { year, month, isSkipped: false } },
      },
      select: {
        categoryId: true,
        estimatedAmount: true,
        occurrences: {
          where: { year, month, isSkipped: false },
          select: { isPaid: true, amount: true },
          take: 1,
        },
        installmentPurchases: {
          select: {
            payments: {
              where: { year, month },
              select: { amount: true },
            },
          },
        },
      },
    }),
  ]);

  const monthlyIncome = salary ? Number(salary.amount) : null;
  const committedByCategory = new Map<string, number>();

  for (const expense of expenses) {
    const occurrence = expense.occurrences[0];
    const installmentTotal = expense.installmentPurchases
      .flatMap((purchase) => purchase.payments)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const committedAmount =
      installmentTotal > 0
        ? installmentTotal
        : occurrence?.isPaid && occurrence.amount !== null
          ? Number(occurrence.amount)
          : Number(expense.estimatedAmount);

    committedByCategory.set(
      expense.categoryId,
      (committedByCategory.get(expense.categoryId) ?? 0) + committedAmount,
    );
  }

  const monthlyCommittedAmount = [...committedByCategory.values()].reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const categoryBudgets = new Map(
    categories.map((category) => [
      category.id,
      monthlyIncome !== null && category.budgetPercentage !== null
        ? (monthlyIncome * Number(category.budgetPercentage)) / 100
        : null,
    ]),
  );

  return {
    monthlyIncome,
    monthlyCommittedAmount,
    committedByCategory,
    categoryBudgets,
  };
}

export async function listWishlistItems(): Promise<{
  items: WishlistItemDTO[];
  summary: WishlistSummaryDTO;
}> {
  const userId = await requireUserId();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [items, financialContext] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        subcategory: {
          include: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    }),
    getMonthlyFinancialContext(userId, year, month),
  ]);

  const mappedItems = items.map((item): WishlistItemDTO => {
    const cashPrice = Number(item.cashPrice);
    const installmentAmount = Number(item.installmentAmount);
    const financedTotal = roundMoney(installmentAmount * item.totalInstallments);
    const interestAmount = roundMoney(Math.max(0, financedTotal - cashPrice));
    const interestPercentage =
      cashPrice > 0 ? roundMoney((interestAmount / cashPrice) * 100) : 0;
    const categoryCommittedAmount = roundMoney(
      financialContext.committedByCategory.get(item.subcategory.category.id) ?? 0,
    );
    const categoryBudgetAmount =
      financialContext.categoryBudgets.get(item.subcategory.category.id) ?? null;
    const categoryAvailableAmount =
      categoryBudgetAmount === null
        ? null
        : roundMoney(categoryBudgetAmount - categoryCommittedAmount);
    const monthlyAvailableAmount =
      financialContext.monthlyIncome === null
        ? null
        : roundMoney(
            financialContext.monthlyIncome - financialContext.monthlyCommittedAmount,
          );

    let affordabilityStatus: WishlistItemDTO["affordabilityStatus"];
    let affordabilityReason: string;

    if (financialContext.monthlyIncome === null) {
      affordabilityStatus = "INSUFFICIENT_DATA";
      affordabilityReason = "Falta cargar el salario del mes actual.";
    } else if (categoryBudgetAmount === null || categoryBudgetAmount <= 0) {
      affordabilityStatus = "INSUFFICIENT_DATA";
      affordabilityReason = "La categoría no tiene presupuesto asignado.";
    } else if (
      installmentAmount <= categoryAvailableAmount! &&
      installmentAmount <= monthlyAvailableAmount!
    ) {
      affordabilityStatus = "AFFORDABLE";
      affordabilityReason =
        "La primera cuota entra en el saldo de la categoría y del mes.";
    } else {
      affordabilityStatus = "NOT_AFFORDABLE";
      affordabilityReason =
        installmentAmount > categoryAvailableAmount!
          ? "La primera cuota supera el saldo disponible de la categoría."
          : "La primera cuota supera el saldo mensual disponible.";
    }

    return {
      id: item.id,
      name: item.name,
      cashPrice,
      totalInstallments: item.totalInstallments,
      installmentAmount,
      financedTotal,
      interestAmount,
      interestPercentage,
      status: item.status,
      priority: item.priority,
      url: item.url,
      subcategoryId: item.subcategoryId,
      subcategoryName: item.subcategory.name,
      categoryId: item.subcategory.category.id,
      categoryName: item.subcategory.category.name,
      categoryBudgetAmount:
        categoryBudgetAmount === null ? null : roundMoney(categoryBudgetAmount),
      categoryCommittedAmount,
      categoryAvailableAmount,
      monthlyIncome: financialContext.monthlyIncome,
      monthlyCommittedAmount: roundMoney(financialContext.monthlyCommittedAmount),
      monthlyAvailableAmount,
      balanceAfterPurchase:
        categoryAvailableAmount === null
          ? null
          : roundMoney(categoryAvailableAmount - installmentAmount),
      affordabilityStatus,
      affordabilityReason,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return {
    items: mappedItems,
    summary: {
      planned: mappedItems.filter((item) => item.status === "PLANNED").length,
      completed: mappedItems.filter((item) => item.status === "COMPLETED").length,
      discarded: mappedItems.filter((item) => item.status === "DISCARDED").length,
      plannedFinancedTotal: roundMoney(
        mappedItems
          .filter((item) => item.status === "PLANNED")
          .reduce((sum, item) => sum + item.financedTotal, 0),
      ),
    },
  };
}

export async function listWishlistSubcategories() {
  const userId = await requireUserId();

  return prisma.subcategory.findMany({
    where: { category: { userId } },
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: { select: { name: true } },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
}

export async function createWishlistItem(input: unknown) {
  const userId = await requireUserId();
  const data = wishlistInputSchema.parse(input);
  await requireOwnedSubcategory(userId, data.subcategoryId);

  await prisma.wishlistItem.create({
    data: {
      ...data,
      url: data.url || null,
      userId,
    },
  });

  revalidatePath("/wishlist");
}

export async function updateWishlistItem(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = wishlistInputSchema.parse(input);
  await requireOwnedSubcategory(userId, data.subcategoryId);

  const result = await prisma.wishlistItem.updateMany({
    where: { id, userId },
    data: {
      ...data,
      url: data.url || null,
    },
  });

  if (result.count !== 1) throw new Error("El artículo no existe");
  revalidatePath("/wishlist");
}

export async function updateWishlistItemStatus(id: string, status: WishlistStatus) {
  const userId = await requireUserId();
  const parsedStatus = wishlistStatusSchema.parse(status);
  const result = await prisma.wishlistItem.updateMany({
    where: { id, userId },
    data: { status: parsedStatus },
  });

  if (result.count !== 1) throw new Error("El artículo no existe");
  revalidatePath("/wishlist");
}

export async function deleteWishlistItem(id: string) {
  const userId = await requireUserId();
  const result = await prisma.wishlistItem.deleteMany({ where: { id, userId } });
  if (result.count !== 1) throw new Error("El artículo no existe");
  revalidatePath("/wishlist");
}

export type WishlistItemInput = {
  name: string;
  cashPrice: number;
  totalInstallments: number;
  installmentAmount: number;
  subcategoryId: string;
  priority: WishlistPriority;
  url?: string | null;
};
