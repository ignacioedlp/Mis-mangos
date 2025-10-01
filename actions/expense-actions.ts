"use server"

import prisma from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const categorySchema = z.object({
  name: z.string().min(1).max(60),
  budgetPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
});

const subcategorySchema = z.object({
  name: z.string().min(1).max(60),
  categoryId: z.string().uuid(),
});

const expenseSchema = z.object({
  name: z.string().min(1).max(100),
  estimatedAmount: z.coerce.number().nonnegative(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "ANNUAL", "ONE_TIME"]),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid(),
  active: z.boolean().optional().default(true),
});

function getYearMonth(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

// Helper functions for cascade delete information
export async function getCategoryDeletionInfo(categoryId: string) {
  await requireUserId();
  
  const [subcategories, expenses] = await Promise.all([
    prisma.subcategory.findMany({
      where: { categoryId },
      select: { id: true, name: true }
    }),
    prisma.expense.findMany({
      where: { 
        categoryId,
        deletedAt: null
      },
      select: { id: true, name: true }
    })
  ]);
  
  return {
    subcategories,
    expenses,
    totalItems: subcategories.length + expenses.length
  };
}

export async function getSubcategoryDeletionInfo(subcategoryId: string) {
  await requireUserId();
  
  const expenses = await prisma.expense.findMany({
    where: { 
      subcategoryId,
      deletedAt: null
    },
    select: { id: true, name: true }
  });
  
  return {
    expenses,
    totalItems: expenses.length
  };
}

// Categories
export async function createCategory(input: unknown) {
  const userId = await requireUserId();
  const data = categorySchema.parse(input);
  const result = await prisma.category.create({ data: { ...data, userId } });
  revalidatePath("/categories");
  return result;
}

export async function listCategories() {
  const userId = await requireUserId();
  const categories = await prisma.category.findMany({ 
    where: { userId }, 
    orderBy: { name: "asc" } 
  });
  
  // Serialize Decimal to number for client components
  return categories.map(category => ({
    ...category,
    budgetPercentage: category.budgetPercentage ? Number(category.budgetPercentage) : null
  }));
}

export async function updateCategory(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = categorySchema.parse(input);
  const result = await prisma.category.update({ where: { id, userId }, data });
  revalidatePath("/categories");
  revalidatePath("/expenses");
  
  // Serialize Decimal to number for client components
  return {
    ...result,
    budgetPercentage: result.budgetPercentage ? Number(result.budgetPercentage) : null
  };
}

export async function deleteCategory(id: string) {
  const userId = await requireUserId();
  
  // Con borrado en cascada habilitado, primero informamos al usuario qué se eliminará
  const [subcategoriesInCategory, expensesUsingCategory] = await Promise.all([
    prisma.subcategory.findMany({
      where: { categoryId: id },
      select: { id: true, name: true }
    }),
    prisma.expense.findMany({
      where: { 
        categoryId: id,
        deletedAt: null // Solo considerar gastos no eliminados
      },
      select: { 
        id: true, 
        name: true 
      }
    })
  ]);
  
  // Informar al usuario sobre el impacto de la eliminación
  const warnings = [];
  if (subcategoriesInCategory.length > 0) {
    const subcategoryNames = subcategoriesInCategory.map(s => s.name).join(", ");
    warnings.push(`${subcategoriesInCategory.length} subcategoría(s): ${subcategoryNames}`);
  }
  if (expensesUsingCategory.length > 0) {
    const expenseNames = expensesUsingCategory.map(e => e.name).join(", ");
    warnings.push(`${expensesUsingCategory.length} gasto(s): ${expenseNames}`);
  }
  
  if (warnings.length > 0) {
    console.warn(`⚠️  ELIMINACIÓN EN CASCADA: Al eliminar esta categoría también se eliminarán: ${warnings.join(" y ")}`);
  }
  
  // Proceder con la eliminación en cascada
  const result = await prisma.category.delete({ where: { id, userId } });
  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/monthly");
  return result;
}

// Subcategories
export async function createSubcategory(input: unknown) {
  await requireUserId();
  const data = subcategorySchema.parse(input);
  const result = await prisma.subcategory.create({ data });
  revalidatePath("/categories");
  revalidatePath("/expenses");
  return result;
}

export async function listSubcategories(categoryId?: string) {
  await requireUserId();
  return prisma.subcategory.findMany({
    where: { categoryId },
    orderBy: { name: "asc" },
  });
}

export async function updateSubcategory(id: string, input: unknown) {
  await requireUserId();
  const data = subcategorySchema.partial().parse(input);
  const result = await prisma.subcategory.update({ where: { id }, data });
  revalidatePath("/categories");
  revalidatePath("/expenses");
  return result;
}

export async function deleteSubcategory(id: string) {
  await requireUserId();
  
  // Con borrado en cascada habilitado, primero informamos al usuario qué se eliminará
  const expensesUsingSubcategory = await prisma.expense.findMany({
    where: { 
      subcategoryId: id,
      deletedAt: null // Solo considerar gastos no eliminados
    },
    select: { 
      id: true, 
      name: true 
    }
  });
  
  // Informar al usuario sobre el impacto de la eliminación
  if (expensesUsingSubcategory.length > 0) {
    const expenseNames = expensesUsingSubcategory.map(e => e.name).join(", ");
    console.warn(`⚠️  ELIMINACIÓN EN CASCADA: Al eliminar esta subcategoría también se eliminarán ${expensesUsingSubcategory.length} gasto(s): ${expenseNames}`);
  }
  
  // Proceder con la eliminación en cascada
  const result = await prisma.subcategory.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/monthly");
  return result;
}

// Expenses
export async function createExpense(input: unknown) {
  const userId = await requireUserId();
  const data = expenseSchema.parse(input);
  const created = await prisma.expense.create({
    data: { ...data, userId },
  });
  const { year, month } = getYearMonth();
  
  // For ONE_TIME expenses, create occurrence only for current month
  // For recurring expenses, create occurrence for current month as before
  await prisma.expenseOccurrence.upsert({
    where: { expenseId_year_month: { expenseId: created.id, year, month } },
    update: {},
    create: { expenseId: created.id, year, month },
  });
  
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return created;
}

export async function listExpenses() {
  const userId = await requireUserId();
  const expenses = await prisma.expense.findMany({
    where: { 
      userId, 
      active: true, 
      deletedAt: null // Only show non-deleted expenses
    },
    include: { category: true, subcategory: true },
    orderBy: { name: "asc" },
  });
  
  // Serialize Decimal to number for client components
  return expenses.map(expense => ({
    ...expense,
    estimatedAmount: Number(expense.estimatedAmount),
    category: {
      ...expense.category,
      budgetPercentage: expense.category.budgetPercentage ? Number(expense.category.budgetPercentage) : null
    }
  }));
}

export async function updateExpense(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = expenseSchema.partial().parse(input);
  const result = await prisma.expense.update({ where: { id, userId }, data });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return result;
}

export async function deleteExpense(id: string) {
  const userId = await requireUserId();
  // Soft delete: set deletedAt timestamp instead of physically deleting
  const result = await prisma.expense.update({ 
    where: { id, userId }, 
    data: { deletedAt: new Date() }
  });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return result;
}

export async function restoreExpense(id: string) {
  const userId = await requireUserId();
  // Restore soft-deleted expense by setting deletedAt to null
  const result = await prisma.expense.update({ 
    where: { id, userId }, 
    data: { deletedAt: null }
  });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return result;
}

export async function listDeletedExpenses() {
  const userId = await requireUserId();
  const expenses = await prisma.expense.findMany({
    where: { 
      userId, 
      deletedAt: { not: null } // Only show soft-deleted expenses
    },
    include: { category: true, subcategory: true },
    orderBy: { deletedAt: "desc" }, // Most recently deleted first
  });
  
  // Serialize Decimal to number for client components
  return expenses.map(expense => ({
    ...expense,
    estimatedAmount: Number(expense.estimatedAmount),
    category: {
      ...expense.category,
      budgetPercentage: expense.category.budgetPercentage ? Number(expense.category.budgetPercentage) : null
    }
  }));
}

// Skip/Unskip occurrence functions
export async function skipOccurrence(expenseId: string, year?: number, month?: number) {
  await requireUserId();
  const base = getYearMonth();
  const y = year ?? base.year;
  const m = month ?? base.month;
  
  // First, get or create the occurrence
  const occ = await prisma.expenseOccurrence.upsert({
    where: { expenseId_year_month: { expenseId, year: y, month: m } },
    update: {},
    create: { expenseId, year: y, month: m },
  });

  // Then update with the skip logic
  const updated = await prisma.expenseOccurrence.update({
    where: { id: occ.id },
    data: {
      isSkipped: !occ.isSkipped,
      skippedAt: !occ.isSkipped ? new Date() : null,
      // If we're skipping, also unmark as paid
      isPaid: occ.isSkipped ? occ.isPaid : false,
      paidAt: occ.isSkipped ? occ.paidAt : null,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/monthly");
  return updated;
}

// Monthly dashboard and toggle paid
export async function getMonthlyDashboard(year?: number, month?: number) {
  const userId = await requireUserId();
  const base = getYearMonth();
  const y = year ?? base.year;
  const m = month ?? base.month;

  const expenses = await prisma.expense.findMany({
    where: { 
      userId, 
      active: true, 
      deletedAt: null, // Only show non-deleted expenses
      occurrences: {
        some: { year: y, month: m } // Only expenses that have an occurrence for the month
      }
    },
    include: {
      category: true,
      subcategory: true,
      occurrences: {
        where: { year: y, month: m },
      },
    },
  });

  const items = expenses.map((e) => {
    const occ = e.occurrences[0];
    const isPaid = occ?.isPaid ?? false;
    const isSkipped = occ?.isSkipped ?? false;
    const paidAt = occ?.paidAt ?? null;
    const skippedAt = occ?.skippedAt ?? null;
    return {
      expenseId: e.id,
      name: e.name,
      categoryName: e.category.name,
      subcategoryName: e.subcategory.name,
      estimatedAmount: Number(e.estimatedAmount),
      isPaid,
      isSkipped,
      paidAt,
      skippedAt,
    };
  });

  // Filter out skipped items for calculations
  const activeItems = items.filter(item => !item.isSkipped);
  const totalEstimated = activeItems.reduce((s, it) => s + it.estimatedAmount, 0);
  const totalPaid = activeItems.filter((i) => i.isPaid).reduce((s, it) => s + it.estimatedAmount, 0);
  const totalPending = totalEstimated - totalPaid;

  return { year: y, month: m, totalEstimated, totalPaid, totalPending, items };
}

export async function togglePaid(expenseId: string, year?: number, month?: number, finalAmount?: number) {
  await requireUserId();
  const base = getYearMonth();
  const y = year ?? base.year;
  const m = month ?? base.month;

  // First, get or create the occurrence
  const occ = await prisma.expenseOccurrence.upsert({
    where: { expenseId_year_month: { expenseId, year: y, month: m } },
    update: {},
    create: { expenseId, year: y, month: m },
  });

  // Then update with the toggle logic
  const updated = await prisma.expenseOccurrence.update({
    where: { id: occ.id },
    data: {
      isPaid: !occ.isPaid,
      paidAt: !occ.isPaid ? new Date() : null,
      amount: !occ.isPaid && finalAmount ? finalAmount : (occ.isPaid ? null : occ.amount),
    },
  });

  if (!occ.isPaid && finalAmount !== undefined && finalAmount !== null) {
    await prisma.expense.update({
      where: { id: expenseId },
      data: { estimatedAmount: finalAmount },
    });
  }
  revalidatePath("/dashboard");
  revalidatePath("/monthly");
  return updated;
}

// Generate occurrences for a specific month
export async function generateMonthOccurrences(year: number, month: number) {
  const userId = await requireUserId();
  
  // Get all active expenses for the user (excluding soft-deleted ones)
  // Exclude ONE_TIME expenses as they should only exist in their original month
  const expenses = await prisma.expense.findMany({
    where: { 
      userId, 
      active: true, 
      deletedAt: null,
      frequency: { not: "ONE_TIME" } // Don't generate occurrences for one-time expenses
    }
  });
  
  // Generate occurrences for each recurring expense
  const occurrences = [];
  for (const expense of expenses) {
    const existing = await prisma.expenseOccurrence.findUnique({
      where: { 
        expenseId_year_month: { 
          expenseId: expense.id, 
          year, 
          month 
        } 
      }
    });
    
    if (!existing) {
      const occurrence = await prisma.expenseOccurrence.create({
        data: {
          expenseId: expense.id,
          year,
          month
        }
      });
      occurrences.push(occurrence);
    }
  }
  
  revalidatePath("/monthly");
  revalidatePath("/dashboard");
  return occurrences;
}

// Get detailed monthly view with charts data
export async function getMonthlyDetails(year: number, month: number) {
  const userId = await requireUserId();
  
  const expenses = await prisma.expense.findMany({
    where: { 
      userId, 
      active: true, 
      deletedAt: null,
      occurrences: {
        some: { year, month } // Only expenses that have an occurrence for the month
      }
    },
    include: {
      category: true,
      subcategory: true,
      occurrences: {
        where: { year, month }
      }
    }
  });

  const items = expenses.map((e) => {
    const occ = e.occurrences[0];
    return {
      expenseId: e.id,
      name: e.name,
      categoryName: e.category.name,
      subcategoryName: e.subcategory.name,
      frequency: e.frequency,
      estimatedAmount: Number(e.estimatedAmount),
      actualAmount: occ?.amount ? Number(occ.amount) : null,
      isPaid: occ?.isPaid ?? false,
      isSkipped: occ?.isSkipped ?? false,
      paidAt: occ?.paidAt ?? null,
      skippedAt: occ?.skippedAt ?? null,
      hasOccurrence: !!occ,
    };
  });

  // Calculate totals (excluding skipped items)
  const activeItems = items.filter(item => !item.isSkipped);
  const totalEstimated = activeItems.reduce((s, it) => s + it.estimatedAmount, 0);
  const totalActual = activeItems
    .filter(i => i.isPaid && i.actualAmount)
    .reduce((s, it) => s + (it.actualAmount || it.estimatedAmount), 0);
  const totalPaid = activeItems.filter(i => i.isPaid).length;
  const totalPending = activeItems.filter(i => !i.isPaid).length;

  // Group by category for charts (excluding skipped items)
  const byCategory = activeItems.reduce((acc, item) => {
    const key = item.categoryName;
    if (!acc[key]) {
      acc[key] = {
        category: key,
        estimated: 0,
        actual: 0,
        count: 0
      };
    }
    acc[key].estimated += item.estimatedAmount;
    acc[key].actual += item.actualAmount || (item.isPaid ? item.estimatedAmount : 0);
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const categoryData = Object.values(byCategory);

  return {
    year,
    month,
    totalEstimated,
    totalActual,
    totalPaid,
    totalPending,
    items,
    categoryData,
    monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  };
}

// Salary management
const salarySchema = z.object({
  amount: z.coerce.number().positive(),
  year: z.number().int().min(2020).max(2030),
  month: z.number().int().min(1).max(12),
});

export async function setSalary(input: unknown) {
  const userId = await requireUserId();
  const data = salarySchema.parse(input);
  
  const result = await prisma.salary.upsert({
    where: { 
      userId_year_month: { 
        userId, 
        year: data.year, 
        month: data.month 
      } 
    },
    update: { amount: data.amount },
    create: { ...data, userId },
  });
  
  revalidatePath("/monthly");
  revalidatePath("/dashboard");
  
  // Serialize Decimal to number for client components
  return {
    ...result,
    amount: Number(result.amount)
  };
}

export async function getSalary(year: number, month: number) {
  const userId = await requireUserId();
  const salary = await prisma.salary.findUnique({
    where: { 
      userId_year_month: { userId, year, month } 
    }
  });
  
  // Serialize Decimal to number for client components
  if (salary) {
    return {
      ...salary,
      amount: Number(salary.amount)
    };
  }
  
  return null;
}

// Comparison between months/years
export async function getComparison(startYear: number, startMonth: number, endYear: number, endMonth: number) {
  const userId = await requireUserId();
  
  const periods = [];
  let currentYear = startYear;
  let currentMonth = startMonth;
  
  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    periods.push({ year: currentYear, month: currentMonth });
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  
  const comparisonData = [];
  
  for (const period of periods) {
    const data = await getMonthlyDetails(period.year, period.month);
    const salary = await getSalary(period.year, period.month);
    
    comparisonData.push({
      ...data,
      salary: salary ? Number(salary.amount) : 0,
      savingsRate: salary ? ((Number(salary.amount) - data.totalActual) / Number(salary.amount)) * 100 : 0
    });
  }
  
  return comparisonData;
}

// Export functions
export async function getExportData(year: number, month: number) {
  const userId = await requireUserId();
  const data = await getMonthlyDetails(year, month);
  const salary = await getSalary(year, month);
  
  return {
    ...data,
    salary: salary ? Number(salary.amount) : 0,
    exportDate: new Date().toISOString(),
  };
}

// Budget tracking functions
export async function getBudgetAnalysis(year?: number, month?: number) {
  const userId = await requireUserId();
  const base = getYearMonth();
  const y = year ?? base.year;
  const m = month ?? base.month;

  // Get salary for the month
  const salary = await getSalary(y, m);
  const monthlyIncome = salary ? Number(salary.amount) : 0;

  if (monthlyIncome === 0) {
    return {
      year: y,
      month: m,
      monthlyIncome: 0,
      categories: [],
      totalBudgetPercentage: 0,
      hasUnassignedIncome: false
    };
  }

  // Get categories with their budget percentages
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      expenses: {
        where: { 
          deletedAt: null,
          active: true,
          // Include expenses (recurring and ONE_TIME) that have a PAID occurrence in the target month
          occurrences: {
            some: {
              year: y,
              month: m,
              isPaid: true,
              isSkipped: false
            }
          }
        },
        include: {
          occurrences: {
            where: { year: y, month: m, isPaid: true, isSkipped: false }
          }
        }
      }
    }
  });

  const categoryAnalysis = categories.map(category => {
    const budgetPercentage = category.budgetPercentage ? Number(category.budgetPercentage) : 0;
    const budgetAmount = (monthlyIncome * budgetPercentage) / 100;
    
    // Calculate actual spending for this category
    let actualSpent = 0;
    let oneTimeSpent = 0;
    let oneTimeCount = 0;
    for (const expense of category.expenses) {
      const occurrence = expense.occurrences[0];
      if (occurrence) {
        const amount = Number(occurrence.amount || expense.estimatedAmount);
        actualSpent += amount;
        if (expense.frequency === "ONE_TIME") {
          oneTimeSpent += amount;
          oneTimeCount += 1;
        }
      }
    }
    const recurringSpent = actualSpent - oneTimeSpent;

    const remaining = budgetAmount - actualSpent;
    const usagePercentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;
    const isOverBudget = actualSpent > budgetAmount;

    return {
      id: category.id,
      name: category.name,
      budgetPercentage,
      budgetAmount,
      actualSpent,
      oneTimeSpent,
      oneTimeCount,
      recurringSpent,
      remaining,
      usagePercentage,
      isOverBudget,
      expenseCount: category.expenses.length
    };
  });

  const totalBudgetPercentage = categoryAnalysis.reduce((sum, cat) => sum + cat.budgetPercentage, 0);
  const hasUnassignedIncome = totalBudgetPercentage < 100;
  
  // Calculate total savings (money not used from budgets)
  const totalSavings = categoryAnalysis.reduce((sum, cat) => {
    // Only count positive remaining amounts as savings (don't subtract overspends)
    return sum + Math.max(0, cat.remaining);
  }, 0);

  return {
    year: y,
    month: m,
    monthlyIncome,
    categories: categoryAnalysis,
    totalBudgetPercentage,
    hasUnassignedIncome,
    unassignedAmount: hasUnassignedIncome ? (monthlyIncome * (100 - totalBudgetPercentage)) / 100 : 0,
    totalSavings
  };
}

export async function getCategoryBudgetStatus(categoryId: string, year?: number, month?: number) {
  const userId = await requireUserId();
  const base = getYearMonth();
  const y = year ?? base.year;
  const m = month ?? base.month;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    include: {
      expenses: {
        where: { 
          deletedAt: null,
          active: true,
          // Include both recurring and ONE_TIME expenses if they have a PAID occurrence in month
          occurrences: {
            some: { year: y, month: m, isPaid: true, isSkipped: false }
          }
        },
        include: {
          occurrences: {
            where: { year: y, month: m, isPaid: true, isSkipped: false }
          }
        }
      }
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const salary = await getSalary(y, m);
  const monthlyIncome = salary ? Number(salary.amount) : 0;
  const budgetPercentage = category.budgetPercentage ? Number(category.budgetPercentage) : 0;
  const budgetAmount = (monthlyIncome * budgetPercentage) / 100;

  const actualSpent = category.expenses.reduce((total, expense) => {
    const occurrence = expense.occurrences[0];
    if (occurrence) {
      return total + Number(occurrence.amount || expense.estimatedAmount);
    }
    return total;
  }, 0);

  const remaining = budgetAmount - actualSpent;
  const usagePercentage = budgetAmount > 0 ? (actualSpent / budgetAmount) * 100 : 0;

  return {
    categoryId: category.id,
    categoryName: category.name,
    budgetPercentage,
    budgetAmount,
    actualSpent,
    remaining,
    usagePercentage,
    isOverBudget: actualSpent > budgetAmount,
    monthlyIncome
  };
}

// Get pending expenses for alerts
export async function getPendingExpenses() {
  const userId = await requireUserId();
  const { year, month } = getYearMonth();
  
  const expenses = await prisma.expense.findMany({
    where: { 
      userId, 
      active: true, 
      deletedAt: null,
      occurrences: {
        some: { year, month, isPaid: false, isSkipped: false } // Only expenses that have an occurrence for the month
      }
    },
    include: {
      category: true,
      subcategory: true,
      occurrences: {
        where: { 
          year, 
          month, 
          isPaid: false,
          isSkipped: false // Exclude skipped occurrences from pending
        }
      }
    }
  });
  
  const pendingItems = expenses
    .filter(e => e.occurrences.length > 0)
    .map(e => ({
      id: e.id,
      name: e.name,
      categoryName: e.category.name,
      subcategoryName: e.subcategory.name,
      estimatedAmount: Number(e.estimatedAmount),
      daysOverdue: Math.floor((new Date().getTime() - new Date(year, month - 1, 1).getTime()) / (1000 * 60 * 60 * 24))
    }));
  
  return pendingItems;
}


