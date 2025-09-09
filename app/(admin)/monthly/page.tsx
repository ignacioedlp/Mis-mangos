import { getMonthlyDetails, generateMonthOccurrences, getSalary, getExportData } from "@/actions/expense-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Plus, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { MonthSelector } from "@/components/month-selector"
import { ExpenseCharts } from "@/components/expense-charts"
import { ExportDialog } from "@/components/export-dialog"
import { SalaryDialog } from "@/components/salary-dialog"
import { PendingAlerts } from "@/components/pending-alerts"
import { MonthlyExpensesTable } from "@/components/tables/monthly-expenses-table"

interface MonthlyPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const params = await searchParams
  const currentDate = new Date()
  const year = parseInt(params.year || currentDate.getFullYear().toString())
  const month = parseInt(params.month || (currentDate.getMonth() + 1).toString())
  
  const [data, salary] = await Promise.all([
    getMonthlyDetails(year, month),
    getSalary(year, month)
  ])
  
  const exportData = await getExportData(year, month)

  async function generateOccurrencesAction() {
    "use server"
    await generateMonthOccurrences(year, month)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Monthly View</h2>
            <p className="text-muted-foreground">Detailed expense tracking for {data.monthName}</p>
          </div>
          <div className="flex items-center gap-2">
            <SalaryDialog 
              year={year} 
              month={month} 
              currentSalary={salary?.amount} 
            />
            <ExportDialog data={exportData} />
            <MonthSelector currentYear={year} currentMonth={month} />
          </div>
        </div>
      </div>

      {/* Generate Occurrences Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Month Setup
          </CardTitle>
          <CardDescription>
            Generate expense occurrences for {data.monthName} to start tracking payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateOccurrencesAction}>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Generate Occurrences for {data.monthName}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Alerts */}
      <PendingAlerts />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {salary ? formatCurrency(salary.amount) : 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground">
              {salary && data.totalActual > 0 
                ? `${formatCurrency((data.totalActual / salary.amount) * 100)}% spent`
                : 'Set salary to track %'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(data.totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">{data.monthName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(data.totalActual)}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalEstimated > 0 ? ((data.totalActual / data.totalEstimated) * 100).toFixed(1) : 0}% of estimated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {salary ? formatCurrency(salary.amount - data.totalActual) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {salary 
                ? `${(((salary.amount - data.totalActual) / salary.amount) * 100).toFixed(1)}% saved`
                : 'Set salary to track'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{data.totalPaid}/{data.items.length}</div>
            <p className="text-xs text-muted-foreground">expenses completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ExpenseCharts categoryData={data.categoryData} />

      {/* Detailed Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Gastos</CardTitle>
          <CardDescription>
            Lista completa de gastos para {data.monthName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyExpensesTable
            data={data.items}
            year={year}
            month={month}
            emptyMessage="No expenses found. Add some expenses to get started!"
          />
        </CardContent>
      </Card>
    </div>
  )
}
