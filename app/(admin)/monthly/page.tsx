import { getMonthlyDetails, generateMonthOccurrences, getSalary, getExportData, getDailyExpensesHeatmap } from "@/actions/expense-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Plus, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { MonthSelector } from "@/components/month-selector"
import { ExpenseCharts } from "@/components/expense-charts"
import { ExportDialog } from "@/components/export-dialog"
import { SalaryDialog } from "@/components/salary-dialog"
import { PendingAlerts } from "@/components/pending-alerts"
import type { ExpenseFrequency } from "@/lib/types"
import { MonthlyExpensesTable } from "@/components/tables/monthly-expenses-table"
import { ExpenseHeatmap } from "@/components/expense-heatmap"

interface MonthlyPageProps {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function MonthlyPage({ searchParams }: MonthlyPageProps) {
  const params = await searchParams
  const currentDate = new Date()
  const year = parseInt(params.year || currentDate.getFullYear().toString())
  const month = parseInt(params.month || (currentDate.getMonth() + 1).toString())

  const [data, salary, heatmapData] = await Promise.all([
    getMonthlyDetails(year, month),
    getSalary(year, month),
    getDailyExpensesHeatmap(year, month)
  ])

  const exportData = await getExportData(year, month)

  // Tipado mínimo para evitar `any` en filtros
  type ItemForCounts = { isSkipped: boolean; frequency: ExpenseFrequency; hasOccurrence: boolean }
  // Derivados para visualización
  const activeCount = data.items.filter((i: ItemForCounts) => !i.isSkipped).length
  const completionPct = activeCount > 0 ? (data.totalPaid / activeCount) * 100 : 0
  const estUsagePct = data.totalEstimated > 0 ? (data.totalActual / data.totalEstimated) * 100 : 0
  const salaryUsagePct = salary?.amount ? (data.totalActual / salary.amount) * 100 : 0
  const missingRecurringOccurrences = data.items.filter((i: ItemForCounts) => i.frequency !== 'ONE_TIME' && !i.hasOccurrence).length

  async function generateOccurrencesAction() {
    "use server"
    await generateMonthOccurrences(year, month)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Vista mensual</h2>
            <p className="text-muted-foreground">Resumen y detalle de tus gastos en {data.monthName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MonthSelector currentYear={year} currentMonth={month} />
            <ExportDialog data={exportData} />
            <SalaryDialog
              year={year}
              month={month}
              currentSalary={salary?.amount}
            />
          </div>
        </div>
      </div>

      {/* Resumen con progreso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resumen</CardTitle>
          <CardDescription>
            {activeCount > 0 ? (
              <span>
                {data.totalPaid} de {activeCount} gastos activos pagados • {data.monthName}
              </span>
            ) : (
              <span>Sin gastos activos este mes</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Uso vs estimado</span>
                <span className="text-sm font-medium">{estUsagePct.toFixed(1)}%</span>
              </div>
              <Progress value={estUsagePct} />
              <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                <span>Estimado: <strong className="text-foreground">{formatCurrency(data.totalEstimated)}</strong></span>
                <span>Real: <strong className="text-foreground">{formatCurrency(data.totalActual)}</strong></span>
                <span>
                  {data.totalActual >= data.totalEstimated ? 'Sobre' : 'Bajo'}: {formatCurrency(Math.abs(data.totalEstimated - data.totalActual))}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Uso del salario</span>
                <span className="text-sm font-medium">{salary?.amount ? salaryUsagePct.toFixed(1) : '—'}%</span>
              </div>
              <Progress value={salary?.amount ? salaryUsagePct : 0} />
              <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                <span>Salario: <strong className="text-foreground">{salary?.amount ? formatCurrency(salary.amount) : 'No establecido'}</strong></span>
                <span>Disponible: <strong className="text-foreground">{salary?.amount ? formatCurrency(Math.max(0, salary.amount - data.totalActual)) : '—'}</strong></span>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progreso de pagos</span>
            <span className="font-medium text-foreground">{data.totalPaid}/{activeCount} pagados ({completionPct.toFixed(1)}%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salario Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {salary ? formatCurrency(salary.amount) : 'No establecido'}
            </div>
            <p className="text-xs text-muted-foreground">
              {salary && data.totalActual > 0
                ? `${((data.totalActual / salary.amount) * 100).toFixed(1)}% utilizado`
                : 'Establecé un salario para ver el uso'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(data.totalEstimated)}</div>
            <p className="text-xs text-muted-foreground">{data.monthName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Real</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">{formatCurrency(data.totalActual)}</div>
            <p className="text-xs text-muted-foreground">
              {data.totalEstimated > 0 ? ((data.totalActual / data.totalEstimated) * 100).toFixed(1) : 0}% del estimado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorros</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              {salary ? formatCurrency(salary.amount - data.totalActual) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {salary
                ? `${(((salary.amount - data.totalActual) / salary.amount) * 100).toFixed(1)}% ahorrado`
                : 'Establecé un salario para ver ahorros'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">{data.totalPaid}/{activeCount}</div>
            <p className="text-xs text-muted-foreground">gastos activos pagados</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ExpenseCharts categoryData={data.categoryData} />

      {/* Heatmap Calendar */}
      <ExpenseHeatmap data={heatmapData} year={year} month={month} />

      {/* Detalle de gastos */}
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
            emptyMessage="No se encontraron gastos. Agregá gastos para comenzar."
          />
        </CardContent>
      </Card>

      {/* Pending Alerts */}
      <PendingAlerts />

      {/* Generar ocurrencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Configuración del Mes
          </CardTitle>
          <CardDescription>
            Generá ocurrencias de gastos para {data.monthName} y comenzá a rastrear pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={generateOccurrencesAction}>
            <Button type="submit" disabled={missingRecurringOccurrences === 0}>
              <Plus className="h-4 w-4 mr-2" />
              {missingRecurringOccurrences === 0
                ? 'No hay ocurrencias pendientes'
                : `Generar ${missingRecurringOccurrences} ocurrencia${missingRecurringOccurrences !== 1 ? 's' : ''} pendientes`
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
