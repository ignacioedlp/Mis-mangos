import { BudgetDashboard } from "@/components/budget-dashboard"
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Análisis de presupuesto</h2>
          <p className="text-muted-foreground">
            Compara tus gastos con la asignación de tu presupuesto por categoría
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthSelector currentYear={year} currentMonth={month} />
        </div>
      </div>

      <BudgetDashboard year={year} month={month} />
    </div>
  )
}
