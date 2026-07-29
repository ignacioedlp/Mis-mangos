"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DashboardChartsProps {
  items: Array<{
    expenseId: string;
    name: string;
    categoryName: string;
    subcategoryName: string;
    estimatedAmount: number;
    isPaid: boolean;
    isSkipped: boolean;
  }>;
}

// Aggregate data by category
function buildCategoryData(items: DashboardChartsProps["items"]) {
  const map = new Map<string, { category: string; estimated: number; paid: number; pending: number }>();
  for (const it of items) {
    if (it.isSkipped) continue; // omit skipped
    if (!map.has(it.categoryName)) {
      map.set(it.categoryName, { category: it.categoryName, estimated: 0, paid: 0, pending: 0 });
    }
    const ref = map.get(it.categoryName)!;
    ref.estimated += it.estimatedAmount;
    if (it.isPaid) ref.paid += it.estimatedAmount; else ref.pending += it.estimatedAmount;
  }
  return Array.from(map.values()).sort((a, b) => b.estimated - a.estimated);
}

export function DashboardCharts({ items }: DashboardChartsProps) {
  const data = buildCategoryData(items);
  const chartVars = React.useMemo(
    () => [1, 2, 3, 4, 5].map((i) => `var(--color-chart-${i})`),
    [],
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Categorías</CardTitle>
          <CardDescription>No hay datos suficientes para mostrar gráficos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-muted-foreground">Agrega gastos o marca algunos como pagados.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = data.map((d, i) => ({ name: d.category, value: d.paid + d.pending, color: chartVars[i % chartVars.length] }));
  const totalEstimated = data.reduce((sum, item) => sum + item.estimated, 0);
  const topCategory = data[0];
  const topShare = totalEstimated > 0 && topCategory ? (topCategory.estimated / totalEstimated) * 100 : 0;
  const paidTotal = data.reduce((sum, item) => sum + item.paid, 0);
  const pendingTotal = data.reduce((sum, item) => sum + item.pending, 0);

  const barConfig: ChartConfig = {
    paid: { label: "Pagado", color: "var(--color-chart-2)" },
    pending: { label: "Pendiente", color: "var(--color-chart-3)" },
  };

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Pagado vs Pendiente</CardTitle>
              <CardDescription>Distribución por categoría (monto estimado)</CardDescription>
            </div>
            {topCategory && (
              <div className="hidden rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-right sm:block">
                <p className="metric-label text-primary">Mayor categoría</p>
                <p className="mt-0.5 text-xs font-bold text-foreground">{topCategory.category}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="-mx-1 overflow-x-auto rounded-lg bg-background/25 p-2">
            <ChartContainer
              config={barConfig}
              className="min-h-[320px] w-[640px] sm:w-full lg:min-h-[360px]"
            >
              <BarChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/35" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} height={64} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value: unknown, name: unknown) => [
                        typeof value === "number" ? formatCurrency(value) : String(value ?? ""),
                        String(name ?? ""),
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="paid" stackId="a" fill="var(--color-paid)" radius={[7, 7, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="data-panel p-3">
              <p className="metric-label">Pagado</p>
              <p className="metric-value mt-1 text-lg text-chart-2">{formatCurrency(paidTotal)}</p>
            </div>
            <div className="data-panel p-3">
              <p className="metric-label">Pendiente</p>
              <p className="metric-value mt-1 text-lg text-chart-1">{formatCurrency(pendingTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle>Participación de Categorías</CardTitle>
              <CardDescription>Proporción del total estimado</CardDescription>
            </div>
            <div className="hidden shrink-0 rounded-lg border border-border/75 bg-background/55 px-3 py-2 text-right sm:block">
              <p className="metric-label">Total</p>
              <p className="mt-0.5 text-xs font-bold text-foreground">{formatCurrency(totalEstimated)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-5 xl:grid-cols-[minmax(13rem,0.9fr)_minmax(0,1.1fr)] xl:items-center">
          <ChartContainer
            config={{ value: { label: "Monto", color: "var(--color-chart-1)" } }}
            className="min-h-[260px] min-w-0"
          >
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="78%" innerRadius="50%" stroke="var(--color-card)" strokeWidth={3}>
                {pieData.map((p) => (
                  <Cell key={p.name} fill={p.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideIndicator
                    formatter={(value: unknown) => [
                      typeof value === "number" ? formatCurrency(value) : String(value ?? ""),
                      "Monto",
                    ]}
                  />
                }
              />
            </PieChart>
          </ChartContainer>
          <div className="min-w-0 space-y-3">
            <div className="data-panel p-3">
              <p className="metric-label">Concentración</p>
              <p className="metric-value mt-1 text-xl">{topShare.toFixed(1)}%</p>
              <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
                del total está en {topCategory?.category ?? "categorías"}
              </p>
            </div>
            <div className="space-y-2">
              {pieData.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                  <span className="shrink-0 font-mono text-muted-foreground">
                    {totalEstimated > 0 ? `${((item.value / totalEstimated) * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
