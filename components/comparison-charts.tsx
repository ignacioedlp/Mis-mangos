"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface ComparisonChartsProps {
  data: Array<{
    monthName: string
    year: number
    month: number
    totalEstimated: number
    totalActual: number
    salary: number
    savingsRate: number
  }>
}

export function ComparisonCharts({ data }: ComparisonChartsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafico de Comparación</CardTitle>
          <CardDescription>No hay datos disponibles para los gráficos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Selecciona un período de tiempo para ver los gráficos de comparación</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const chartData = data.map(item => ({
    month: item.monthName.split(' ')[0], // Just month name
    estimated: item.totalEstimated,
    actual: item.totalActual,
    salary: item.salary,
    savings: item.salary - item.totalActual,
    savingsRate: item.savingsRate
  }))

  const trendsConfig: ChartConfig = {
    estimated: { label: "Estimado", color: "var(--color-chart-1)" },
    actual: { label: "Real", color: "var(--color-chart-2)" },
  }

  const savingsRateConfig: ChartConfig = {
    savingsRate: { label: "Tasa de Ahorro", color: "var(--color-chart-3)" },
  }

  const incomeVsExpensesConfig: ChartConfig = {
    salary: { label: "Salario", color: "var(--color-chart-4)" },
    actual: { label: "Gasto", color: "var(--color-chart-5)" },
  }

  const netSavingsConfig: ChartConfig = {
    savings: { label: "Ahorro Neto", color: "var(--color-chart-2)" },
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de gastos</CardTitle>
          <CardDescription>Gasto estimado vs real a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendsConfig} className="min-h-[300px]">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value?: unknown, name?: unknown) => (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {name === 'estimated' ? 'Estimado' : name === 'actual' ? 'Real' : String(name ?? '')}
                        </span>
                        <span className="font-mono">{typeof value === 'number' ? formatCurrency(value) : String(value ?? '')}</span>
                      </div>
                    )}
                  />
                }
              />
              <Line type="monotone" dataKey="estimated" stroke="var(--color-estimated)" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Savings Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de la Tasa de Ahorro</CardTitle>
          <CardDescription>Tu porcentaje de tasa de ahorro a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={savingsRateConfig} className="min-h-[300px]">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value?: unknown) => (
                      <span className="font-mono">{typeof value === 'number' ? `${value.toFixed(1)}%` : String(value ?? '')}</span>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="savingsRate"
                stroke="var(--color-savingsRate)"
                fill="var(--color-savingsRate)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Ingreso vs Gastos</CardTitle>
          <CardDescription>Salario mensual en comparación con el gasto real</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={incomeVsExpensesConfig} className="min-h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value?: unknown, name?: unknown) => (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{name === 'salary' ? 'Salario' : name === 'actual' ? 'Gasto' : String(name ?? '')}</span>
                        <span className="font-mono">{typeof value === 'number' ? formatCurrency(value) : String(value ?? '')}</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="salary" fill="var(--color-salary)" />
              <Bar dataKey="actual" fill="var(--color-actual)" />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Net Savings */}
      <Card>
        <CardHeader>
          <CardTitle>Ahorros Netos</CardTitle>
          <CardDescription>Monto ahorrado cada mes (Salario - Gastos)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={netSavingsConfig} className="min-h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value?: unknown) => (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{typeof value === 'number' && value >= 0 ? 'Ahorrado' : 'Déficit'}</span>
                        <span className="font-mono">{typeof value === 'number' ? formatCurrency(value) : String(value ?? '')}</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="savings" fill="var(--color-savings)" />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
