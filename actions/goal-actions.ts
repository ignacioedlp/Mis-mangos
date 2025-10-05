"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { GoalDTO } from "@/lib/types";

const goalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["SAVINGS", "DEBT_PAYMENT", "EXPENSE_REDUCTION", "CUSTOM"]),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().nonnegative().default(0),
  categoryId: z.string().uuid().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
});

const updateGoalAmountSchema = z.object({
  amount: z.coerce.number(),
  operation: z.enum(["add", "subtract", "set"]),
});

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

function mapGoalToDTO(goal: any): GoalDTO {
  const targetAmount = Number(goal.targetAmount);
  const currentAmount = Number(goal.currentAmount);
  const progress = targetAmount > 0 
    ? Math.min((currentAmount / targetAmount) * 100, 100) 
    : 0;
  
  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    type: goal.type,
    status: goal.status,
    targetAmount,
    currentAmount,
    categoryId: goal.categoryId,
    categoryName: goal.category?.name ?? null,
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    completedAt: goal.completedAt,
    progress: Math.round(progress * 100) / 100,
    remainingAmount: Math.max(targetAmount - currentAmount, 0),
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}

// Create a new goal
export async function createGoal(input: unknown) {
  const userId = await requireUserId();
  const data = goalSchema.parse(input);
  
  const goal = await prisma.goal.create({
    data: {
      ...data,
      userId,
    },
    include: {
      category: {
        select: { name: true },
      },
    },
  });
  
  revalidatePath("/goals");
  return mapGoalToDTO(goal);
}

// List all goals for the current user
export async function listGoals(status?: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED") {
  const userId = await requireUserId();
  
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: [
      { status: "asc" }, // ACTIVE first
      { createdAt: "desc" },
    ],
  });
  
  return goals.map(mapGoalToDTO);
}

// Get a single goal by ID
export async function getGoal(id: string) {
  const userId = await requireUserId();
  
  const goal = await prisma.goal.findFirst({
    where: { id, userId },
    include: {
      category: {
        select: { name: true },
      },
    },
  });
  
  if (!goal) {
    throw new Error("Goal not found");
  }
  
  return mapGoalToDTO(goal);
}

// Update a goal
export async function updateGoal(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = goalSchema.partial().parse(input);
  
  const goal = await prisma.goal.update({
    where: { id, userId },
    data,
    include: {
      category: {
        select: { name: true },
      },
    },
  });
  
  revalidatePath("/goals");
  return mapGoalToDTO(goal);
}

// Update goal amount (add, subtract, or set)
export async function updateGoalAmount(id: string, input: unknown) {
  const userId = await requireUserId();
  const { amount, operation } = updateGoalAmountSchema.parse(input);
  
  const goal = await prisma.goal.findFirst({
    where: { id, userId },
  });
  
  if (!goal) {
    throw new Error("Goal not found");
  }
  
  let newAmount: number;
  const currentAmount = Number(goal.currentAmount);
  
  switch (operation) {
    case "add":
      newAmount = currentAmount + amount;
      break;
    case "subtract":
      newAmount = Math.max(0, currentAmount - amount);
      break;
    case "set":
      newAmount = Math.max(0, amount);
      break;
  }
  
  // Check if goal is completed
  const targetAmount = Number(goal.targetAmount);
  const isCompleted = newAmount >= targetAmount && goal.status === "ACTIVE";
  
  const updatedGoal = await prisma.goal.update({
    where: { id, userId },
    data: {
      currentAmount: newAmount,
      ...(isCompleted && {
        status: "COMPLETED",
        completedAt: new Date(),
      }),
    },
    include: {
      category: {
        select: { name: true },
      },
    },
  });
  
  revalidatePath("/goals");
  return mapGoalToDTO(updatedGoal);
}

// Change goal status
export async function updateGoalStatus(
  id: string, 
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED"
) {
  const userId = await requireUserId();
  
  const updateData: any = { status };
  
  // Set completedAt if marking as completed
  if (status === "COMPLETED") {
    updateData.completedAt = new Date();
  }
  
  // Clear completedAt if changing from completed to another status
  if (status !== "COMPLETED") {
    updateData.completedAt = null;
  }
  
  const goal = await prisma.goal.update({
    where: { id, userId },
    data: updateData,
    include: {
      category: {
        select: { name: true },
      },
    },
  });
  
  revalidatePath("/goals");
  return mapGoalToDTO(goal);
}

// Delete a goal
export async function deleteGoal(id: string) {
  const userId = await requireUserId();
  
  await prisma.goal.delete({
    where: { id, userId },
  });
  
  revalidatePath("/goals");
  return { success: true };
}

// Get goals summary (statistics)
export async function getGoalsSummary() {
  const userId = await requireUserId();
  
  const [activeGoals, completedGoals, totalGoals, allActiveGoals] = await Promise.all([
    prisma.goal.count({
      where: { userId, status: "ACTIVE" },
    }),
    prisma.goal.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.goal.count({
      where: { userId },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
    }),
  ]);
  
  const totalTargetAmount = allActiveGoals.reduce(
    (sum, goal) => sum + Number(goal.targetAmount),
    0
  );
  
  const totalCurrentAmount = allActiveGoals.reduce(
    (sum, goal) => sum + Number(goal.currentAmount),
    0
  );
  
  const overallProgress = totalTargetAmount > 0
    ? (totalCurrentAmount / totalTargetAmount) * 100
    : 0;
  
  return {
    activeGoals,
    completedGoals,
    totalGoals,
    totalTargetAmount,
    totalCurrentAmount,
    overallProgress: Math.round(overallProgress * 100) / 100,
    remainingAmount: Math.max(totalTargetAmount - totalCurrentAmount, 0),
  };
}
