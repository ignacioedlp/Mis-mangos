"use server"

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getBudgetAnalysis } from "./expense-actions";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

// Create notification
export async function createNotification(
  userId: string,
  type: "BUDGET_EXCEEDED" | "BUDGET_WARNING" | "PAYMENT_REMINDER" | "MONTHLY_SUMMARY" | "SAVINGS_MILESTONE" | "SPENDING_SPIKE" | "BUDGET_AVAILABLE",
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  title: string,
  message: string,
  metadata?: any,
  actionUrl?: string,
  actionLabel?: string
) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      priority,
      title,
      message,
      metadata,
      actionUrl,
      actionLabel,
    }
  });
}

// Get user notifications
export async function getUserNotifications(limit = 20, offset = 0) {
  const userId = await requireUserId();
  
  const notifications = await prisma.notification.findMany({
    where: { 
      userId,
      isArchived: false 
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit,
    skip: offset,
  });

  return notifications;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const userId = await requireUserId();
  
  const result = await prisma.notification.update({
    where: { 
      id: notificationId,
      userId // Security: ensure user owns notification
    },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  });

  revalidatePath("/dashboard");
  return result;
}

// Archive notification
export async function archiveNotification(notificationId: string) {
  const userId = await requireUserId();
  
  const result = await prisma.notification.update({
    where: { 
      id: notificationId,
      userId
    },
    data: { 
      isArchived: true,
      archivedAt: new Date()
    }
  });

  revalidatePath("/dashboard");
  return result;
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  const userId = await requireUserId();
  
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
      isArchived: false
    }
  });
}

// Smart notification generation functions
export async function generateBudgetNotifications(year?: number, month?: number) {
  const userId = await requireUserId();
  const budgetData = await getBudgetAnalysis(year, month);
  
  if (budgetData.monthlyIncome === 0) return [];

  const notifications = [];

  // Check for budget exceeded
  for (const category of budgetData.categories) {
    if (category.isOverBudget && category.budgetPercentage > 0) {
      const notification = await createNotification(
        userId,
        "BUDGET_EXCEEDED",
        "HIGH",
        `Presupuesto superado: ${category.name}`,
        `Has superado tu presupuesto de ${category.name} en ${Math.abs(category.remaining).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}. Considera revisar tus gastos en esta categoría.`,
        {
          categoryId: category.id,
          categoryName: category.name,
          budgetAmount: category.budgetAmount,
          actualSpent: category.actualSpent,
          overAmount: Math.abs(category.remaining)
        },
        `/budget?year=${budgetData.year}&month=${budgetData.month}`,
        "Ver Presupuesto"
      );
      notifications.push(notification);
    }
    
    // Check for budget warning (80%+ used)
    else if (category.usagePercentage >= 80 && category.usagePercentage < 100 && category.budgetPercentage > 0) {
      const notification = await createNotification(
        userId,
        "BUDGET_WARNING",
        "MEDIUM",
        `Advertencia de Presupuesto: ${category.name}`,
        `Has utilizado ${category.usagePercentage.toFixed(1)}% de tu presupuesto de ${category.name}. Te queda ${category.remaining.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}.`,
        {
          categoryId: category.id,
          categoryName: category.name,
          usagePercentage: category.usagePercentage,
          remaining: category.remaining
        },
        `/budget?year=${budgetData.year}&month=${budgetData.month}`,
        "Ver Presupuesto"
      );
      notifications.push(notification);
    }
  }

  // Check for available budget
  if (budgetData.hasUnassignedIncome && budgetData.unassignedAmount && budgetData.unassignedAmount > 1000) {
    const notification = await createNotification(
      userId,
      "BUDGET_AVAILABLE",
      "LOW",
      "Presupuesto No Asignado Disponible",
      `Tienes ${budgetData.unassignedAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} (${(100 - budgetData.totalBudgetPercentage).toFixed(1)}%) de tu ingreso no asignado. Considera asignarlo a categorías o ahorros.`,
      {
        unassignedAmount: budgetData.unassignedAmount,
        unassignedPercentage: 100 - budgetData.totalBudgetPercentage
      },
      "/categories",
      "Gestionar Categorías"
    );
    notifications.push(notification);
  }

  return notifications;
}

export async function generatePaymentReminders() {
  const userId = await requireUserId();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Get unpaid expenses for current month
  const unpaidExpenses = await prisma.expense.findMany({
    where: {
      userId,
      active: true,
      deletedAt: null,
      occurrences: {
        some: {
          year: currentYear,
          month: currentMonth,
          isPaid: false,
          isSkipped: false
        }
      }
    },
    include: {
      category: true,
      subcategory: true,
      occurrences: {
        where: {
          year: currentYear,
          month: currentMonth,
          isPaid: false,
          isSkipped: false
        }
      }
    }
  });

  const notifications = [];

  if (unpaidExpenses.length > 0) {
    const totalUnpaid = unpaidExpenses.reduce((sum, expense) => 
      sum + Number(expense.estimatedAmount), 0
    );

    const notification = await createNotification(
      userId,
      "PAYMENT_REMINDER",
      "MEDIUM",
      `${unpaidExpenses.length} Pagos Pendientes`,
      `Tienes ${unpaidExpenses.length} gastos impagos que totalizan ${totalUnpaid.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} para este mes.`,
      {
        count: unpaidExpenses.length,
        totalAmount: totalUnpaid,
        expenses: unpaidExpenses.map(e => ({
          id: e.id,
          name: e.name,
          amount: Number(e.estimatedAmount),
          category: e.category.name
        }))
      },
      "/dashboard",
      "Ver Gastos"
    );
    notifications.push(notification);
  }

  return notifications;
}

export async function generateMonthlyNotifications() {
  const userId = await requireUserId();
  
  // Run all notification generators
  const [budgetNotifications, paymentNotifications] = await Promise.all([
    generateBudgetNotifications(),
    generatePaymentReminders()
  ]);

  revalidatePath("/dashboard");
  
  return [
    ...budgetNotifications,
    ...paymentNotifications
  ];
}

// Clean up old notifications (run periodically)
export async function cleanupOldNotifications(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      },
      isArchived: true
    }
  });

  return result.count;
}
