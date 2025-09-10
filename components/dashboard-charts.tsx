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
    const extracted = [1,2,3,4,5].map(i => style.getPropertyValue(`--color-chart-${i}`).trim() || `var(--color-chart-${i})`);
    setVars(extracted);
  }, []);
  return vars;
}

export function DashboardCharts({ items }: DashboardChartsProps) {
  const data = buildCategoryData(items);
  const chartVars = useChartVars();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Categorías</CardTitle>
          <CardDescription>No hay datos suficientes para mostrar gráficos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Agrega gastos o marca algunos como pagados.</div>
        </CardContent>
      </Card>
    );
  }

  const pieData = data.map((d, i) => ({ name: d.category, value: d.paid + d.pending, color: chartVars[i % chartVars.length] }));

  const barConfig: ChartConfig = {
    paid: { label: "Pagado", color: "var(--color-chart-2)" },
    pending: { label: "Pendiente", color: "var(--color-chart-4)" },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pagado vs Pendiente</CardTitle>
          <CardDescription>Distribución por categoría (monto estimado)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="-mx-2 overflow-x-auto">
            <ChartContainer config={barConfig} className="min-h-[260px] w-[640px] sm:w-full">
              <BarChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
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
                <Bar dataKey="paid" stackId="a" fill="var(--color-paid)" radius={[2,2,0,0]} />
                <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[2,2,0,0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Participación de Categorías</CardTitle>
          <CardDescription>Proporción del total estimado</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ value: { label: "Monto", color: "var(--color-chart-1)" } }} className="min-h-[260px]">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} stroke="none" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
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
