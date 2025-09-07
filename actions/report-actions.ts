"use server"

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getMonthlyDetails, getBudgetAnalysis, getSalary } from "./expense-actions";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id as string;
}

// Generate Monthly Summary Report
export async function generateMonthlySummaryReport(year: number, month: number) {
  const userId = await requireUserId();
  
  const [monthlyData, budgetData, salary] = await Promise.all([
    getMonthlyDetails(year, month),
    getBudgetAnalysis(year, month),
    getSalary(year, month)
  ]);

  const reportData = {
    period: {
      year,
      month,
      monthName: monthlyData.monthName
    },
    summary: {
      totalEstimated: monthlyData.totalEstimated,
      totalActual: monthlyData.totalActual,
      totalPaid: monthlyData.totalPaid,
      totalPending: monthlyData.totalPending,
      monthlyIncome: salary?.amount || 0,
      savingsAmount: salary ? salary.amount - monthlyData.totalActual : 0,
      savingsRate: salary ? ((salary.amount - monthlyData.totalActual) / salary.amount) * 100 : 0
    },
    categoryBreakdown: monthlyData.categoryData,
    budgetAnalysis: budgetData.categories,
    expenses: monthlyData.items.map(item => ({
      name: item.name,
      category: item.categoryName,
      subcategory: item.subcategoryName,
      estimated: item.estimatedAmount,
      actual: item.actualAmount,
      isPaid: item.isPaid,
      isSkipped: item.isSkipped,
      frequency: item.frequency
    })),
    insights: generateMonthlyInsights(monthlyData, budgetData, salary)
  };

  const report = await prisma.report.create({
    data: {
      userId,
      type: "MONTHLY_SUMMARY",
      title: `Monthly Summary - ${monthlyData.monthName}`,
      description: `Complete financial summary for ${monthlyData.monthName}`,
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 0),
      categories: monthlyData.categoryData.map(c => c.category),
      data: reportData,
      status: "COMPLETED",
      generatedAt: new Date()
    }
  });

  revalidatePath("/reports");
  return report;
}

// Generate Budget Analysis Report
export async function generateBudgetAnalysisReport(year: number, month: number) {
  const userId = await requireUserId();
  
  const budgetData = await getBudgetAnalysis(year, month);
  
  const reportData = {
    period: { year, month },
    budgetSummary: {
      monthlyIncome: budgetData.monthlyIncome,
      totalBudgetPercentage: budgetData.totalBudgetPercentage,
      hasUnassignedIncome: budgetData.hasUnassignedIncome,
      unassignedAmount: budgetData.unassignedAmount
    },
    categories: budgetData.categories,
    performance: {
      categoriesOverBudget: budgetData.categories.filter(c => c.isOverBudget).length,
      categoriesOnTrack: budgetData.categories.filter(c => !c.isOverBudget && c.usagePercentage > 0).length,
      averageUsage: budgetData.categories.reduce((sum, c) => sum + c.usagePercentage, 0) / budgetData.categories.length
    },
    recommendations: generateBudgetRecommendations(budgetData)
  };

  const report = await prisma.report.create({
    data: {
      userId,
      type: "BUDGET_ANALYSIS",
      title: `Budget Analysis - ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      description: `Detailed budget performance analysis`,
      startDate: new Date(year, month - 1, 1),
      endDate: new Date(year, month, 0),
      categories: budgetData.categories.map(c => c.id),
      data: reportData,
      status: "COMPLETED",
      generatedAt: new Date()
    }
  });

  revalidatePath("/reports");
  return report;
}

// Generate Spending Trends Report
export async function generateSpendingTrendsReport(startYear: number, startMonth: number, endYear: number, endMonth: number) {
  const userId = await requireUserId();
  
  const months = [];
  let currentYear = startYear;
  let currentMonth = startMonth;
  
  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    months.push({ year: currentYear, month: currentMonth });
    
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  const monthlyData = await Promise.all(
    months.map(({ year, month }) => getMonthlyDetails(year, month))
  );

  const trends = {
    totalSpending: monthlyData.map(data => ({
      period: data.monthName,
      estimated: data.totalEstimated,
      actual: data.totalActual,
      year: data.year,
      month: data.month
    })),
    categoryTrends: analyzeCategoryTrends(monthlyData),
    insights: generateTrendInsights(monthlyData)
  };

  const report = await prisma.report.create({
    data: {
      userId,
      type: "SPENDING_TRENDS",
      title: `Spending Trends - ${months.length} months`,
      description: `Spending analysis from ${monthlyData[0]?.monthName} to ${monthlyData[monthlyData.length - 1]?.monthName}`,
      startDate: new Date(startYear, startMonth - 1, 1),
      endDate: new Date(endYear, endMonth, 0),
      categories: [],
      data: trends,
      status: "COMPLETED",
      generatedAt: new Date()
    }
  });

  revalidatePath("/reports");
  return report;
}

// Get user reports
export async function getUserReports() {
  const userId = await requireUserId();
  
  return await prisma.report.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

// Get report by ID
export async function getReportById(reportId: string) {
  const userId = await requireUserId();
  
  const report = await prisma.report.findFirst({
    where: { 
      id: reportId,
      userId 
    }
  });

  if (report) {
    // Update download count
    await prisma.report.update({
      where: { id: reportId },
      data: { 
        downloadCount: { increment: 1 },
        lastDownloadAt: new Date()
      }
    });
  }

  return report;
}

// Delete report
export async function deleteReport(reportId: string) {
  const userId = await requireUserId();
  
  const result = await prisma.report.delete({
    where: { 
      id: reportId,
      userId 
    }
  });

  revalidatePath("/reports");
  return result;
}

// Helper functions for insights
function generateMonthlyInsights(monthlyData: any, budgetData: any, salary: any) {
  const insights = [];

  // Spending vs Income
  if (salary && monthlyData.totalActual > 0) {
    const spendingRate = (monthlyData.totalActual / salary.amount) * 100;
    if (spendingRate > 90) {
      insights.push({
        type: "warning",
        title: "High Spending Rate",
        message: `You spent ${spendingRate.toFixed(1)}% of your income this month. Consider reviewing your expenses.`
      });
    } else if (spendingRate < 70) {
      insights.push({
        type: "positive",
        title: "Great Savings Rate",
        message: `You saved ${(100 - spendingRate).toFixed(1)}% of your income this month. Excellent financial discipline!`
      });
    }
  }

  // Category Performance
  const overBudgetCategories = budgetData.categories?.filter((c: any) => c.isOverBudget) || [];
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: "warning",
      title: "Budget Exceeded",
      message: `${overBudgetCategories.length} categories exceeded their budget. Focus on ${overBudgetCategories[0].name} which was ${Math.abs(overBudgetCategories[0].remaining).toFixed(0)} over budget.`
    });
  }

  // Payment Status
  const unpaidCount = monthlyData.items?.filter((item: any) => !item.isPaid && !item.isSkipped).length || 0;
  if (unpaidCount > 0) {
    insights.push({
      type: "info",
      title: "Pending Payments",
      message: `You have ${unpaidCount} expenses still pending payment for this month.`
    });
  }

  return insights;
}

function generateBudgetRecommendations(budgetData: any) {
  const recommendations = [];

  // Unassigned budget
  if (budgetData.hasUnassignedIncome && budgetData.unassignedAmount > 1000) {
    recommendations.push({
      type: "allocation",
      priority: "medium",
      title: "Allocate Unassigned Budget",
      description: `You have ${budgetData.unassignedAmount.toFixed(0)} ARS unassigned. Consider allocating it to emergency fund or investment categories.`
    });
  }

  // Over-budget categories
  const overBudgetCategories = budgetData.categories.filter((c: any) => c.isOverBudget);
  if (overBudgetCategories.length > 0) {
    const worstCategory = overBudgetCategories.reduce((worst: any, current: any) => 
      Math.abs(current.remaining) > Math.abs(worst.remaining) ? current : worst
    );
    
    recommendations.push({
      type: "reduction",
      priority: "high",
      title: `Reduce ${worstCategory.name} Spending`,
      description: `This category is ${Math.abs(worstCategory.remaining).toFixed(0)} ARS over budget. Consider reviewing expenses in this area.`
    });
  }

  // Categories with very low usage
  const underUsedCategories = budgetData.categories.filter((c: any) => c.usagePercentage < 50 && c.budgetPercentage > 0);
  if (underUsedCategories.length > 0) {
    recommendations.push({
      type: "reallocation",
      priority: "low",
      title: "Consider Budget Reallocation",
      description: `Categories like ${underUsedCategories[0].name} are under-utilized. You might reallocate some budget to other areas.`
    });
  }

  return recommendations;
}

function analyzeCategoryTrends(monthlyData: any[]) {
  const categoryTrends: { [key: string]: any[] } = {};

  monthlyData.forEach(month => {
    month.categoryData?.forEach((category: any) => {
      if (!categoryTrends[category.category]) {
        categoryTrends[category.category] = [];
      }
      
      categoryTrends[category.category].push({
        period: month.monthName,
        estimated: category.estimated,
        actual: category.actual,
        count: category.count,
        year: month.year,
        month: month.month
      });
    });
  });

  return categoryTrends;
}

function generateTrendInsights(monthlyData: any[]) {
  if (monthlyData.length < 2) return [];

  const insights = [];
  const latest = monthlyData[monthlyData.length - 1];
  const previous = monthlyData[monthlyData.length - 2];

  // Spending trend
  const spendingChange = ((latest.totalActual - previous.totalActual) / previous.totalActual) * 100;
  if (Math.abs(spendingChange) > 10) {
    insights.push({
      type: spendingChange > 0 ? "warning" : "positive",
      title: `Spending ${spendingChange > 0 ? "Increased" : "Decreased"}`,
      message: `Your spending ${spendingChange > 0 ? "increased" : "decreased"} by ${Math.abs(spendingChange).toFixed(1)}% compared to last month.`
    });
  }

  return insights;
}
