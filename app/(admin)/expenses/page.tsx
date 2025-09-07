import { listCategories, listExpenses, listSubcategories, deleteExpense } from "@/actions/expense-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, DollarSign, Calendar, Filter } from "lucide-react"
import { CreateExpenseDialog } from "@/components/expense-dialog"
import { DeletedExpensesDialog } from "@/components/deleted-expenses-dialog"
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

  async function deleteExpenseAction(formData: FormData) {
    "use server"
    const id = String(formData.get("id") || "")
    await deleteExpense(id)
  }

  const totalEstimated = expenses.reduce((sum, expense) => sum + Number(expense.estimatedAmount), 0)
  const frequencyColors = {
    WEEKLY: "bg-blue-100 text-blue-800",
    MONTHLY: "bg-green-100 text-green-800", 
    ANNUAL: "bg-purple-100 text-purple-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
        <p className="text-muted-foreground">Manage your recurring expenses and track spending</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Active recurring expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Estimated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">Total estimated monthly spending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Active expense categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense List</CardTitle>
              <CardDescription>Manage your recurring expenses</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DeletedExpensesDialog />
              <CreateExpenseDialog categories={categories} subcategories={subcategories} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No expenses yet</p>
              <p className="text-sm">Create your first expense to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{expense.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {expense.category.name} / {expense.subcategory.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category.name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(expense.estimatedAmount))}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={frequencyColors[expense.frequency as keyof typeof frequencyColors]}
                      >
                        {expense.frequency.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <form action={deleteExpenseAction} className="inline">
                        <input type="hidden" name="id" value={expense.id} />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          type="submit"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


