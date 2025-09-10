"use client";

import * as React from "react";
import { StatCard } from "@/components/stat-card";
import { formatCurrency } from "@/lib/utils";

export interface DashboardStatsProps {
  monthName: string;
  totalEstimated: number;
  totalPaid: number;
  totalPending: number;
  itemCount: number;
  paidCount: number;
  remainingCount: number;
  skippedCount: number;
}

export function DashboardStatsClient(props: DashboardStatsProps) {
  const paidPercent = props.totalEstimated > 0 ? (props.totalPaid / props.totalEstimated) * 100 : 0;
  const effectiveTotal = props.itemCount - props.skippedCount; // total considerado (sin skip)
  const progressPercent = (props.paidCount / (effectiveTotal || 1)) * 100;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Estimado"
        iconName="dollar"
        value={formatCurrency(props.totalEstimated)}
        subtitle={props.monthName}
      />
      <StatCard
        title="Total Pagado"
        iconName="trendingDown"
  value={<span className="text-primary">{formatCurrency(props.totalPaid)}</span>}
        subtitle={`${paidPercent.toFixed(1)}% completado`}
        progress={paidPercent}
      />
      <StatCard
        title="Pendiente"
        iconName="trendingUp"
  value={<span className="text-accent">{formatCurrency(props.totalPending)}</span>}
        subtitle={`${props.remainingCount} items restantes`}
        progress={paidPercent}
      />
      <StatCard
        title="Progreso"
        iconName="calendar"
        value={`${props.paidCount}/${effectiveTotal}`}
        subtitle={`gastos completados (saltados ${props.skippedCount})`}
        progress={progressPercent}
      />
    </div>
  );
}
