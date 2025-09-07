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
        `Budget Exceeded: ${category.name}`,
        `You've exceeded your ${category.name} budget by ${Math.abs(category.remaining).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}. Consider reviewing your spending in this category.`,
        {
          categoryId: category.id,
          categoryName: category.name,
          budgetAmount: category.budgetAmount,
          actualSpent: category.actualSpent,
          overAmount: Math.abs(category.remaining)
        },
        `/budget?year=${budgetData.year}&month=${budgetData.month}`,
        "View Budget"
      );
      notifications.push(notification);
    }
    
    // Check for budget warning (80%+ used)
    else if (category.usagePercentage >= 80 && category.usagePercentage < 100 && category.budgetPercentage > 0) {
      const notification = await createNotification(
        userId,
        "BUDGET_WARNING",
        "MEDIUM",
        `Budget Warning: ${category.name}`,
        `You've used ${category.usagePercentage.toFixed(1)}% of your ${category.name} budget. You have ${category.remaining.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} remaining.`,
        {
          categoryId: category.id,
          categoryName: category.name,
          usagePercentage: category.usagePercentage,
          remaining: category.remaining
        },
        `/budget?year=${budgetData.year}&month=${budgetData.month}`,
        "View Budget"
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
      "Unassigned Budget Available",
      `You have ${budgetData.unassignedAmount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} (${(100 - budgetData.totalBudgetPercentage).toFixed(1)}%) of your income unassigned. Consider allocating it to categories or savings.`,
      {
        unassignedAmount: budgetData.unassignedAmount,
        unassignedPercentage: 100 - budgetData.totalBudgetPercentage
      },
      "/categories",
      "Manage Categories"
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
      `${unpaidExpenses.length} Payments Pending`,
      `You have ${unpaidExpenses.length} unpaid expenses totaling ${totalUnpaid.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })} for this month.`,
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
      "View Expenses"
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
