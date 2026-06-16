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

function useChartVars() {
  const [vars, setVars] = React.useState<string[]>(["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"]);
  React.useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const extracted = [1, 2, 3, 4, 5].map(i => style.getPropertyValue(`--color-chart-${i}`).trim() || `var(--color-chart-${i})`);
    setVars(extracted);
  }, []);
  return vars;
}

export function DashboardCharts({ items }: DashboardChartsProps) {
  const data = buildCategoryData(items);
  const chartVars = useChartVars();

  if (data.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-serif text-lg font-bold">Gráficos de Categorías</CardTitle>
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

  const barConfig: ChartConfig = {
    paid: { label: "Pagado", color: "var(--color-chart-2)" },
    pending: { label: "Pendiente", color: "var(--color-chart-3)" },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="relative overflow-hidden border-border/70">
        <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/[0.06] blur-3xl" />
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-lg font-bold tracking-normal">Pagado vs Pendiente</CardTitle>
              <CardDescription>Distribución por categoría (monto estimado)</CardDescription>
            </div>
            {topCategory && (
              <div className="hidden rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-right sm:block">
                <p className="font-mono text-[10px] font-semibold uppercase text-primary">Mayor categoría</p>
                <p className="mt-0.5 text-xs font-bold text-foreground">{topCategory.category}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="-mx-2 overflow-x-auto rounded-lg bg-background/25 p-3">
            <ChartContainer config={barConfig} className="min-h-[260px] w-[640px] sm:w-full">
              <BarChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
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
                <Bar dataKey="paid" stackId="a" fill="var(--color-paid)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden border-border/70">
        <div className="pointer-events-none absolute -right-10 top-24 h-36 w-36 rounded-full bg-gold-300/[0.06] blur-3xl" />
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-lg font-bold tracking-normal">Participación de Categorías</CardTitle>
              <CardDescription>Proporción del total estimado</CardDescription>
            </div>
            <div className="hidden rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-right sm:block">
              <p className="font-mono text-[10px] font-semibold uppercase text-muted-foreground">Total</p>
              <p className="mt-0.5 text-xs font-bold text-foreground">{formatCurrency(totalEstimated)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Monto", color: "var(--color-chart-1)" } }} className="min-h-[300px]">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={104} innerRadius={62} stroke="var(--color-card)" strokeWidth={3} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
