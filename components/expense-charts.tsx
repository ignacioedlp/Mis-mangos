"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface ExpenseChartsProps {
  categoryData: Array<{
    category: string
    estimated: number
    actual: number
    count: number
  }>
}

export function ExpenseCharts({ categoryData }: ExpenseChartsProps) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analisis de gastos</CardTitle>
          <CardDescription>No hay datos disponibles para los gráficos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Genera ocurrencias de gastos para ver análisis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for pie chart
  const pieData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.actual || item.estimated,
    // el color real lo tomamos de las CSS vars en los <Cell/>
    color: `var(--color-chart-${(index % 5) + 1})`
  }))

  const barConfig: ChartConfig = {
    estimated: { label: "Estimado", color: "var(--color-chart-1)" },
    actual: { label: "Real", color: "var(--color-chart-2)" },
  }

  // Ordenamos por gasto real (desc) para destacar las categorías más relevantes
  const sortedCategoryData = [...categoryData].sort((a, b) => b.actual - a.actual)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar Chart - Estimated vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos Estimados vs Reales</CardTitle>
          <CardDescription>Compara los gastos planificados vs reales por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="min-h-[300px]">
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label?: unknown) => `Categoría: ${String(label ?? "")}`}
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
              <Bar dataKey="estimated" fill="var(--color-estimated)" name="estimated" />
              <Bar dataKey="actual" fill="var(--color-actual)" name="actual" />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Spending Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Gastos</CardTitle>
          <CardDescription>Desglose de gastos por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="min-h-[300px]">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: { name?: string; percent?: number }) => `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`var(--color-chart-${(index % 5) + 1})`} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value?: unknown) => (
                      <span className="font-mono">{typeof value === 'number' ? formatCurrency(value) : String(value ?? '')}</span>
                    )}
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Resumen por categoría</CardTitle>
          <CardDescription>Uso vs estimado y detalle por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedCategoryData.map((item, index) => {
              const hasEstimate = item.estimated > 0
              const rawPct = hasEstimate ? (item.actual / item.estimated) * 100 : 0
              const pct = Math.min(100, Math.max(0, rawPct))
              const isOver = hasEstimate ? item.actual > item.estimated : item.actual > 0
              const delta = hasEstimate ? Math.abs(item.actual - item.estimated) : item.actual

              return (
                <div
                  key={item.category}
                  className={`rounded-lg border p-4 transition-colors ${isOver ? 'bg-muted/40' : 'hover:bg-muted/30'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `var(--color-chart-${(index % 5) + 1})` }}
                      />
                      <p className="font-medium text-sm truncate">{item.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${isOver ? 'text-destructive border-border' : 'text-foreground/80 border-border'}`}>
                      {hasEstimate ? `${rawPct.toFixed(0)}%` : '—'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <Progress value={pct} />
                    <div className="mt-2 text-xs text-muted-foreground flex flex-col gap-x-4 gap-y-1">
                      <span>
                        Estimado: <strong className="text-foreground">{formatCurrency(item.estimated)}</strong>
                      </span>
                      <span>
                        Real: <strong className="text-foreground">{formatCurrency(item.actual)}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={isOver ? 'text-destructive' : 'text-foreground'}>
                        {isOver ? `Excedido: ${formatCurrency(delta)}` : `Restante: ${formatCurrency(delta)}`}
                        </span>
                        <span className="ms-auto">
                          {item.count} gasto{item.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
