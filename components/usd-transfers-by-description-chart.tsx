"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatUsdCurrency } from "@/lib/utils";

interface UsdTransferSummaryInput {
  amount: number;
  description: string | null;
}

interface UsdTransfersByDescriptionChartProps {
  transfers: UsdTransferSummaryInput[];
}

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

function shortenDescription(value: string) {
  return value.length > 22 ? `${value.slice(0, 20)}…` : value;
}

export function UsdTransfersByDescriptionChart({
  transfers,
}: UsdTransfersByDescriptionChartProps) {
  const totals = new Map<string, { total: number; count: number }>();

  for (const transfer of transfers) {
    const description = transfer.description?.trim() || "Sin descripción";
    const current = totals.get(description) ?? { total: 0, count: 0 };

    totals.set(description, {
      total: current.total + transfer.amount,
      count: current.count + 1,
    });
  }

  const chartData = Array.from(totals, ([description, values]) => ({
    description,
    shortDescription: shortenDescription(description),
    ...values,
  })).sort((a, b) => b.total - a.total);

  if (chartData.length === 0) {
    return (
      <div className="data-panel border-dashed px-4 py-10 text-center">
        <p className="font-medium text-foreground">
          Todavía no hay datos para agrupar.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          El gráfico aparecerá cuando registres una transferencia.
        </p>
      </div>
    );
  }

  const chartHeight = Math.max(280, chartData.length * 48);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto min-h-[280px]"
      style={{ height: chartHeight }}
      role="img"
      aria-label="Totales de transferencias en dólares agrupados por descripción"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 18, bottom: 4, left: 4 }}
      >
        <CartesianGrid
          horizontal={false}
          strokeDasharray="3 3"
          className="stroke-border/35"
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) =>
            new Intl.NumberFormat("es-AR", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(value))
          }
        />
        <YAxis
          dataKey="shortDescription"
          type="category"
          width={126}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.35 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.description ?? ""
              }
              formatter={(value, _name, item) => (
                <div className="flex min-w-44 items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.count} transferencia
                    {item.payload.count === 1 ? "" : "s"}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {formatUsdCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="total"
          fill="var(--color-total)"
          radius={[0, 7, 7, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ChartContainer>
  );
}
