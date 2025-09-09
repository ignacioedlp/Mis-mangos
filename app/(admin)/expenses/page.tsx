import { listCategories, listExpenses, listSubcategories } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, Filter } from "lucide-react"
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

  const totalEstimated = expenses.reduce((sum, expense) => sum + Number(expense.estimatedAmount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestion de Gastos</h2>
        <p className="text-muted-foreground">Administra tus gastos recurrentes y controla tus gastos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Gastos recurrentes activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimado Mensual</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">Total de gastos mensuales estimados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Categorías de gastos activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Gastos</CardTitle>
              <CardDescription>Administra tus gastos recurrentes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DeletedExpensesDialog />
              <CreateExpenseDialog categories={categories} subcategories={subcategories} />
            </div>
          </div>
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


