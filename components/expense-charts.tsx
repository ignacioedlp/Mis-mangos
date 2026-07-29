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
  const totalActual = categoryData.reduce((sum, item) => sum + item.actual, 0)
  const totalEstimated = categoryData.reduce((sum, item) => sum + item.estimated, 0)
  const totalDistribution = pieData.reduce((sum, item) => sum + item.value, 0)
  const topCategory = sortedCategoryData[0]
  const topShare = totalActual > 0 && topCategory ? (topCategory.actual / totalActual) * 100 : 0

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-2">
      {/* Bar Chart - Estimated vs Actual */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Estimado vs Real</CardTitle>
              <CardDescription>Compara gastos planificados y reales por categoría</CardDescription>
            </div>
            <div className="hidden rounded-lg border border-border/75 bg-background/55 px-3 py-2 text-right sm:block">
              <p className="metric-label">Delta</p>
              <p className="mt-0.5 text-xs font-bold text-foreground">
                {formatCurrency(Math.abs(totalEstimated - totalActual))}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={barConfig}
            className="min-h-[360px] lg:min-h-[420px]"
          >
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/35" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.35 }}
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
              <Bar dataKey="estimated" fill="var(--color-estimated)" name="estimated" radius={[7, 7, 0, 0]} />
              <Bar dataKey="actual" fill="var(--color-actual)" name="actual" radius={[7, 7, 0, 0]} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Spending Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Gastos</CardTitle>
          <CardDescription>Mix real o estimado por categoría</CardDescription>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-5 xl:grid-cols-[minmax(13rem,0.9fr)_minmax(0,1.1fr)] xl:items-center">
          <ChartContainer config={{}} className="min-h-[260px] min-w-0">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="78%"
                innerRadius="50%"
                stroke="var(--color-card)"
                strokeWidth={3}
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
          <div className="min-w-0 space-y-3">
            <div className="data-panel p-3">
              <p className="metric-label">Categoría dominante</p>
              <p className="metric-value mt-1 break-words text-lg leading-tight">{topCategory?.category ?? "-"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{topShare.toFixed(1)}% del gasto real</p>
            </div>
            <div className="space-y-2">
              {pieData.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: `var(--color-chart-${(index % 5) + 1})` }} />
                  <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                  <span className="shrink-0 font-mono text-muted-foreground">
                    {totalDistribution > 0 ? `${((item.value / totalDistribution) * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ranking por categoría</CardTitle>
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
                  className={`data-panel p-4 transition-colors ${isOver ? 'border-destructive/35 bg-destructive/5' : 'hover:bg-primary/5'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `var(--color-chart-${(index % 5) + 1})` }}
                      />
                      <p className="font-medium text-sm truncate">{item.category}</p>
                    </div>
                    <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${isOver ? 'border-destructive/35 text-destructive' : 'border-border text-foreground/80'}`}>
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
