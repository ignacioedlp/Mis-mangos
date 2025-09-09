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
      title: `Resumen mensual - ${monthlyData.monthName}`,
      description: `Resumen financiero completo para ${monthlyData.monthName}`,
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
      title: `Análisis de Presupuesto - ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      description: `Análisis detallado del rendimiento del presupuesto para ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
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
      title: `Tendencias de Gastos - ${months.length} meses`,
      description: `Análisis de gastos desde ${monthlyData[0]?.monthName} hasta ${monthlyData[monthlyData.length - 1]?.monthName}`,
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
        title: "Alto Nivel de Gastos",
        message: `Has gastado ${spendingRate.toFixed(1)}% de tu ingreso este mes. Considera revisar tus gastos.`
      });
    } else if (spendingRate < 70) {
      insights.push({
        type: "positive",
        title: "Gran Tasa de Ahorro",
        message: `Has ahorrado ${(100 - spendingRate).toFixed(1)}% de tu ingreso este mes. ¡Excelente disciplina financiera!`
      });
    }
  }

  // Category Performance
  const overBudgetCategories = budgetData.categories?.filter((c: any) => c.isOverBudget) || [];
  if (overBudgetCategories.length > 0) {
    insights.push({
      type: "warning",
      title: "Presupuesto Superado",
      message: `${overBudgetCategories.length} categorías superaron su presupuesto. Enfócate en ${overBudgetCategories[0].name} que estuvo ${Math.abs(overBudgetCategories[0].remaining).toFixed(0)} sobre presupuesto.`
    });
  }

  // Payment Status
  const unpaidCount = monthlyData.items?.filter((item: any) => !item.isPaid && !item.isSkipped).length || 0;
  if (unpaidCount > 0) {
    insights.push({
      type: "info",
      title: "Pagos Pendientes",
      message: `Tienes ${unpaidCount} gastos aún pendientes de pago para este mes.`
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
      title: "Asignar Presupuesto No Asignado",
      description: `Tienes ${budgetData.unassignedAmount.toFixed(0)} ARS no asignados. Considera asignarlo a un fondo de emergencia o categorías de inversión.`
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
      title: `Reducir Gastos en ${worstCategory.name}`,
      description: `Esta categoría está ${Math.abs(worstCategory.remaining).toFixed(0)} ARS sobre presupuesto. Considera revisar los gastos en esta área.`
    });
  }

  // Categories with very low usage
  const underUsedCategories = budgetData.categories.filter((c: any) => c.usagePercentage < 50 && c.budgetPercentage > 0);
  if (underUsedCategories.length > 0) {
    recommendations.push({
      type: "reallocation",
      priority: "low",
      title: "Considerar Reasignación de Presupuesto",
      description: `Categorías como ${underUsedCategories[0].name} están subutilizadas. Podrías reasignar parte del presupuesto a otras áreas.`
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
      title: `Gasto ${spendingChange > 0 ? "Aumentado" : "Disminuido"}`,
      message: `Tu gasto ${spendingChange > 0 ? "aumentó" : "disminuyó"} en ${Math.abs(spendingChange).toFixed(1)}% en comparación con el mes pasado.`
    });
  }

  return insights;
}
