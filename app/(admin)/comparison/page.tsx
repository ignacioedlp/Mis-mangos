import { getComparison } from "@/actions/expense-actions"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { ComparisonSelector } from "@/components/comparison-selector"
import { ComparisonCharts } from "@/components/comparison-charts"
import { ExpensesByMonthChart } from "@/components/expenses-by-month-chart"
import { ExpensesByMonthTable } from "@/components/expenses-by-month-table"
import { SummaryStrip } from "@/components/summary-strip"
import { DataSection } from "@/components/data-section"
import { formatCurrency } from '../../../lib/utils';

interface ComparisonPageProps {
  searchParams: Promise<{
    startYear?: string
    startMonth?: string
    endYear?: string
    endMonth?: string
  }>
}

export default async function ComparisonPage({ searchParams }: ComparisonPageProps) {
  const params = await searchParams
  const currentDate = new Date()

  // Default to last 6 months
  const defaultEndYear = currentDate.getFullYear()
  const defaultEndMonth = currentDate.getMonth() + 1
  const defaultStartDate = new Date(defaultEndYear, defaultEndMonth - 7, 1)

  const startYear = parseInt(params.startYear || defaultStartDate.getFullYear().toString())
  const startMonth = parseInt(params.startMonth || (defaultStartDate.getMonth() + 1).toString())
  const endYear = parseInt(params.endYear || defaultEndYear.toString())
  const endMonth = parseInt(params.endMonth || defaultEndMonth.toString())

  const comparisonData = await getComparison(startYear, startMonth, endYear, endMonth)

  const totalEstimated = comparisonData.reduce((sum, d) => sum + d.totalEstimated, 0)
  const totalActual = comparisonData.reduce((sum, d) => sum + d.totalActual, 0)
  const totalSalary = comparisonData.reduce((sum, d) => sum + d.salary, 0)
  const avgSavingsRate = comparisonData.length > 0
    ? comparisonData.reduce((sum, d) => sum + d.savingsRate, 0) / comparisonData.length
    : 0

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Tendencias"
        title="Comparación de Gastos"
        description="Compara gastos en diferentes períodos de tiempo."
        actions={
          <ComparisonSelector
            startYear={startYear}
            startMonth={startMonth}
            endYear={endYear}
            endMonth={endMonth}
          />
        }
      />

      <SummaryStrip
        aria-label="Resumen del período comparado"
        items={[
          { label: "Estimado", value: formatCurrency(totalEstimated), detail: `${comparisonData.length} meses`, icon: DollarSign },
          { label: "Gasto real", value: formatCurrency(totalActual), detail: `${totalEstimated > 0 ? ((totalActual / totalEstimated) * 100).toFixed(1) : 0}% de lo estimado`, icon: TrendingDown, tone: "accent", progress: totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0 },
          { label: "Ingresos", value: formatCurrency(totalSalary), detail: "Total del período", icon: TrendingUp, tone: "success" },
          { label: "Ahorro promedio", value: `${avgSavingsRate.toFixed(1)}%`, detail: "Promedio mensual", icon: Percent, tone: avgSavingsRate < 0 ? "danger" : "success", progress: Math.max(avgSavingsRate, 0) },
        ]}
      />

      {/* Charts */}
      <ComparisonCharts data={comparisonData} />

      {/* Expenses by Month Chart */}
      <ExpensesByMonthChart data={comparisonData} />

      {/* Expenses by Month Table */}
      <ExpensesByMonthTable data={comparisonData} />

      {/* Detailed Table */}
      <DataSection title="Desglose mensual" description="Comparación detallada por mes">
          {comparisonData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay datos disponibles para el periodo seleccionado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead>Estimado</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Ahorros</TableHead>
                  <TableHead>Tasa de Ahorro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((data) => (
                  <TableRow key={`${data.year}-${data.month}`}>
                    <TableCell className="font-medium">
                      {data.monthName}
                    </TableCell>
                    <TableCell>
                      {data.salary > 0 ? formatCurrency(data.salary) : '-'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(data.totalEstimated)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(data.totalActual)}
                    </TableCell>
                    <TableCell>
                      {data.salary > 0 ? (
                          <span className={data.salary - data.totalActual > 0 ? 'text-chart-5' : 'text-destructive'}>
                          {formatCurrency(data.salary - data.totalActual)}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {data.salary > 0 ? (
                          <span className={data.savingsRate > 0 ? 'text-chart-5' : 'text-destructive'}>
                          {data.savingsRate.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={data.totalPaid === data.items.length ? "default" : "secondary"}>
                          {data.totalPaid}/{data.items.length} pagados
                        </Badge>
                        {data.savingsRate > 20 && (
                          <Badge variant="outline" className="border-chart-5/35 text-chart-5">
                            Buen Ahorro
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
      </DataSection>
    </div>
  )
}
