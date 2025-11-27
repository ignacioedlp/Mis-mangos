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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Gastos</h2>
          <p className="text-muted-foreground">Administra tus gastos recurrentes y optimiza tu presupuesto mensual</p>
        </div>
        <div className="flex items-center gap-2">
          <DeletedExpensesDialog />
          <CreateExpenseDialog categories={categories} subcategories={subcategories} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Gastos recurrentes activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimado Mensual</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">Total de gastos mensuales estimados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Filter className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categorías de gastos activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategorías</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubcategories}</div>
            <p className="text-xs text-muted-foreground">Subcategorías disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
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


