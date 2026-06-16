import { listCategories, listExpenses, listSubcategories } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, Filter, Layers } from "lucide-react"
import { AdminPageHeader } from "@/components/admin-page-header"
import { CreateExpenseDialog } from "@/components/expense-dialog"
import { DeletedExpensesDialog } from "@/components/deleted-expenses-dialog"
import { ExpensesTable } from "@/components/tables/expenses-table"
import { MetricCard } from "@/components/metric-card"
import { formatCurrency } from "@/lib/utils"

async function Prefetch() {
  const [categories, subcategories, expenses] = await Promise.all([
    listCategories(),
    listSubcategories(),
    listExpenses(),
  ])
  return { categories, subcategories, expenses }
}

export default async function ExpensesPage() {
  const { categories, subcategories, expenses } = await Prefetch()

  const totalEstimated = expenses.reduce((sum: number, expense: { displayAmount: number }) => sum + expense.displayAmount, 0)
  const totalSubcategories = subcategories.length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Gestión de Gastos"
        description="Administra tus gastos recurrentes y optimiza tu presupuesto."
        actions={
          <>
          <DeletedExpensesDialog />
          <CreateExpenseDialog categories={categories} subcategories={subcategories} />
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total de Gastos" value={expenses.length} subtitle="Gastos recurrentes activos" icon={DollarSign} />
        <MetricCard title="Estimado Mensual" value={formatCurrency(totalEstimated)} subtitle="Total mensual estimado" icon={Calendar} />
        <MetricCard title="Categorías" value={categories.length} subtitle="Categorías activas" icon={Filter} tone="warning" />
        <MetricCard title="Subcategorías" value={totalSubcategories} subtitle="Subcategorías disponibles" icon={Layers} tone="muted" />
      </div>

      {/* Expenses Table */}
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-bold">Lista de Gastos</CardTitle>
          <CardDescription>Administra tus gastos recurrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesTable
            data={expenses}
            categories={categories}
            subcategories={subcategories}
            emptyMessage="No hay gastos aún. Crea tu primer gasto para comenzar"
            emptyIcon={<DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}


