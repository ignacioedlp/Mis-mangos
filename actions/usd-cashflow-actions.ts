"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const monthSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2035),
  month: z.coerce.number().int().min(1).max(12),
});

const usdIncomeSchema = monthSchema.extend({
  amount: z.coerce.number().positive(),
});

const dateInputSchema = z.preprocess((value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }

  return value;
}, z.coerce.date());

const usdTransferBaseSchema = monthSchema.extend({
  amount: z.coerce.number().positive(),
  transferredAt: dateInputSchema,
  description: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : null)),
});

const usdTransferSchema = usdTransferBaseSchema.refine(
    (data) =>
      data.transferredAt.getUTCFullYear() === data.year &&
      data.transferredAt.getUTCMonth() + 1 === data.month,
    {
      message: "La fecha de transferencia debe pertenecer al mes seleccionado",
      path: ["transferredAt"],
    },
  );

const usdTransferImportSchema = z.object({
  year: monthSchema.shape.year,
  month: monthSchema.shape.month,
  transfers: z
    .array(
      usdTransferBaseSchema.omit({
        year: true,
        month: true,
      }),
    )
    .min(1, "El CSV no tiene transferencias para importar")
    .max(250, "Importá hasta 250 transferencias por vez"),
});

function getValidationMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(". ");
}

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

function serializeIncome(
  income: Awaited<ReturnType<typeof prisma.usdMonthlyIncome.findUnique>>,
) {
  if (!income) return null;

  return {
    ...income,
    amount: Number(income.amount),
  };
}

function serializeTransfer(transfer: {
  id: string;
  amount: { toString(): string };
  year: number;
  month: number;
  transferredAt: Date;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...transfer,
    amount: Number(transfer.amount),
  };
}

export async function getUsdCashflow(year?: number, month?: number) {
  const userId = await requireUserId();
  const now = new Date();
  const target = monthSchema.parse({
    year: year ?? now.getFullYear(),
    month: month ?? now.getMonth() + 1,
  });

  const [income, transfers, totalIncome, totalTransfers] = await Promise.all([
    prisma.usdMonthlyIncome.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: target.year,
          month: target.month,
        },
      },
    }),
    prisma.usdTransfer.findMany({
      where: {
        userId,
        year: target.year,
        month: target.month,
      },
      orderBy: [{ transferredAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.usdMonthlyIncome.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.usdTransfer.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
  ]);

  const serializedIncome = serializeIncome(income);
  const serializedTransfers = transfers.map(serializeTransfer);
  const totalTransferred = serializedTransfers.reduce(
    (sum, transfer) => sum + transfer.amount,
    0,
  );
  const monthlyIncome = serializedIncome?.amount ?? 0;
  const totalStored =
    Number(totalIncome._sum.amount ?? 0) -
    Number(totalTransfers._sum.amount ?? 0);

  return {
    year: target.year,
    month: target.month,
    income: serializedIncome,
    transfers: serializedTransfers,
    monthlyIncome,
    totalTransferred,
    available: monthlyIncome - totalTransferred,
    totalStored,
  };
}

export async function setUsdMonthlyIncome(input: unknown) {
  const userId = await requireUserId();
  const data = usdIncomeSchema.parse(input);

  const result = await prisma.usdMonthlyIncome.upsert({
    where: {
      userId_year_month: {
        userId,
        year: data.year,
        month: data.month,
      },
    },
    update: { amount: data.amount },
    create: { ...data, userId },
  });

  revalidatePath("/usd-cashflow");
  revalidatePath("/dashboard");

  return serializeIncome(result);
}

export async function createUsdTransfer(input: unknown) {
  const userId = await requireUserId();
  const data = usdTransferSchema.parse(input);

  const result = await prisma.usdTransfer.create({
    data: {
      ...data,
      userId,
      description: data.description,
    },
  });

  revalidatePath("/usd-cashflow");
  revalidatePath("/dashboard");

  return serializeTransfer(result);
}

export async function importUsdTransfers(input: unknown) {
  const userId = await requireUserId();
  const parsedInput = usdTransferImportSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error(getValidationMessage(parsedInput.error));
  }

  const data = parsedInput.data;

  const transfers = data.transfers.map((transfer) => {
    const parsedTransfer = usdTransferSchema.safeParse({
      ...transfer,
      year: data.year,
      month: data.month,
    });

    if (!parsedTransfer.success) {
      throw new Error(getValidationMessage(parsedTransfer.error));
    }

    return parsedTransfer.data;
  });

  const result = await prisma.usdTransfer.createMany({
    data: transfers.map((transfer) => ({
      ...transfer,
      userId,
      description: transfer.description,
    })),
  });

  revalidatePath("/usd-cashflow");
  revalidatePath("/dashboard");

  return { count: result.count };
}

export async function updateUsdTransfer(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = usdTransferSchema.parse(input);

  const result = await prisma.usdTransfer.update({
    where: { id, userId },
    data: {
      amount: data.amount,
      year: data.year,
      month: data.month,
      transferredAt: data.transferredAt,
      description: data.description,
    },
  });

  revalidatePath("/usd-cashflow");
  revalidatePath("/dashboard");

  return serializeTransfer(result);
}

export async function deleteUsdTransfer(id: string) {
  const userId = await requireUserId();

  const result = await prisma.usdTransfer.delete({
    where: { id, userId },
  });

  revalidatePath("/usd-cashflow");
  revalidatePath("/dashboard");

  return serializeTransfer(result);
}
