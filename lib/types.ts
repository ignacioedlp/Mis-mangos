export interface User {
   id: string;
   name: string;
   email: string;
   emailVerified: boolean;
   createdAt: Date;
   updatedAt: Date;
   image?: string | null | undefined;
}

export type ExpenseFrequency = "WEEKLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME";

export interface CategoryDTO {
   id: string;
   name: string;
   budgetPercentage?: number | null; // Percentage of total income allocated to this category
}

export interface SubcategoryDTO {
   id: string;
   name: string;
   categoryId: string;
}

export interface ExpenseDTO {
   id: string;
   name: string;
   estimatedAmount: number;
   frequency: ExpenseFrequency;
   categoryId: string;
   subcategoryId: string;
   active: boolean;
   deletedAt?: Date | null; // For soft delete functionality
}

export interface MonthlyExpenseItemDTO {
   expenseId: string;
   name: string;
   categoryName: string;
   subcategoryName: string;
   estimatedAmount: number;
   isPaid: boolean;
   isSkipped: boolean; // For skip functionality
   paidAt?: Date | null;
   skippedAt?: Date | null; // When was this occurrence skipped
}

export interface MonthlySummaryDTO {
   year: number;
   month: number; // 1-12
   totalPaid: number;
   totalPending: number;
   totalEstimated: number;
   items: MonthlyExpenseItemDTO[];
}

// Additional interfaces for new functionality
export interface ExpenseOccurrenceDTO {
   id: string;
   expenseId: string;
   year: number;
   month: number;
   isPaid: boolean;
   isSkipped: boolean;
   paidAt?: Date | null;
   skippedAt?: Date | null;
   amount?: number | null;
}

export interface DeletedExpenseDTO extends ExpenseDTO {
   deletedAt: Date; // Required for deleted expenses
   category: CategoryDTO;
   subcategory: SubcategoryDTO;
}

// Budget tracking interfaces
export interface CategoryBudgetAnalysisDTO {
   id: string;
   name: string;
   budgetPercentage: number;
   budgetAmount: number;
   actualSpent: number;
   remaining: number;
   usagePercentage: number;
   isOverBudget: boolean;
   expenseCount: number;
}

export interface BudgetAnalysisDTO {
   year: number;
   month: number;
   monthlyIncome: number;
   categories: CategoryBudgetAnalysisDTO[];
   totalBudgetPercentage: number;
   hasUnassignedIncome: boolean;
   unassignedAmount?: number;
   totalSavings?: number;
}

export interface CategoryBudgetStatusDTO {
   categoryId: string;
   categoryName: string;
   budgetPercentage: number;
   budgetAmount: number;
   actualSpent: number;
   remaining: number;
   usagePercentage: number;
   isOverBudget: boolean;
   monthlyIncome: number;
}

// Goal types
export type GoalType = "SAVINGS" | "DEBT_PAYMENT" | "EXPENSE_REDUCTION" | "CUSTOM";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED";

export interface GoalDTO {
   id: string;
   name: string;
   description?: string | null;
   type: GoalType;
   status: GoalStatus;
   targetAmount: number;
   currentAmount: number;
   categoryId?: string | null;
   categoryName?: string | null;
   startDate: Date;
   targetDate?: Date | null;
   completedAt?: Date | null;
   progress: number; // Percentage (0-100)
   remainingAmount: number;
   createdAt: Date;
   updatedAt: Date;
}