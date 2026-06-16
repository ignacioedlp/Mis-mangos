import { BudgetDashboard } from "@/components/budget-dashboard"
import { AdminPageHeader } from "@/components/admin-page-header"
import { MonthSelector } from "@/components/month-selector"

interface BudgetPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const params = await searchParams
  const currentDate = new Date()
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear()
  const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Control"
        title="Análisis de presupuesto"
        description="Compara tus gastos con la asignación de tu presupuesto por categoría."
        actions={
          <MonthSelector currentYear={year} currentMonth={month} />
        }
      />

      <BudgetDashboard year={year} month={month} />
    </div>
  )
}
