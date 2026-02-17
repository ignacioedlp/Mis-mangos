import { listCategories, listExpenses, listSubcategories } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, Filter, Layers } from "lucide-react"
import { CreateExpenseDialog } from "@/components/expense-dialog"
import { DeletedExpensesDialog } from "@/components/deleted-expenses-dialog"
import { ExpensesTable } from "@/components/tables/expenses-table"
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

  const totalEstimated = expenses.reduce((sum: number, expense: { estimatedAmount: number }) => sum + Number(expense.estimatedAmount), 0)
  const totalSubcategories = subcategories.length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="font-serif text-3xl font-extrabold tracking-tight">Gestión de Gastos</h2>
          <p className="text-muted-foreground text-sm">Administra tus gastos recurrentes y optimiza tu presupuesto</p>
        </div>
        <div className="flex items-center gap-2">
          <DeletedExpensesDialog />
          <CreateExpenseDialog categories={categories} subcategories={subcategories} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total de Gastos</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-2xl font-extrabold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Gastos recurrentes activos</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimado Mensual</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-2xl font-extrabold">{formatCurrency(totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">Total de gastos mensuales estimados</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categorías</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Filter className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-2xl font-extrabold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categorías de gastos activas</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subcategorías</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-2xl font-extrabold">{totalSubcategories}</div>
            <p className="text-xs text-muted-foreground">Subcategorías disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-bold">Lista de Gastos</CardTitle>
          <CardDescription>Administra tus gastos recurrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesTable
            data={expenses}
            emptyMessage="No hay gastos aún. Crea tu primer gasto para comenzar"
            emptyIcon={<DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}


