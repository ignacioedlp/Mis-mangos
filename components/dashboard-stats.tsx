"use client";

import * as React from "react";
import { StatCard } from "@/components/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
  formatArsToCryptoUsd,
  type CryptoDollarRate,
} from "@/lib/crypto-dollar";

export interface DashboardStatsProps {
  monthName: string;
  totalEstimated: number;
  totalPaid: number;
  totalPending: number;
  itemCount: number;
  paidCount: number;
  remainingCount: number;
  skippedCount: number;
  cryptoDollarRate: CryptoDollarRate | null;
}

export function DashboardStatsClient(props: DashboardStatsProps) {
  const paidPercent =
    props.totalEstimated > 0
      ? (props.totalPaid / props.totalEstimated) * 100
      : 0;
  const effectiveTotal = props.itemCount - props.skippedCount; // total considerado (sin skip)
  const progressPercent = (props.paidCount / (effectiveTotal || 1)) * 100;
  const estimatedInUsd = formatArsToCryptoUsd(
    props.totalEstimated,
    props.cryptoDollarRate,
  );
  const pendingInUsd = formatArsToCryptoUsd(
    props.totalPending,
    props.cryptoDollarRate,
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Estimado"
        iconName="dollar"
        value={
          <div className="space-y-1">
            <div>{formatCurrency(props.totalEstimated)}</div>
            <div className="font-sans text-xs font-medium text-muted-foreground">
              {estimatedInUsd ?? "Cotización no disponible"}
            </div>
          </div>
        }
        subtitle={props.monthName}
      />
      <StatCard
        title="Total Pagado"
        iconName="trendingDown"
        value={
          <span className="text-primary">
            {formatCurrency(props.totalPaid)}
          </span>
        }
        subtitle={`${paidPercent.toFixed(1)}% completado`}
        progress={paidPercent}
      />
      <StatCard
        title="Pendiente"
        iconName="trendingUp"
        value={
          <div className="space-y-1">
            <div>{formatCurrency(props.totalPending)}</div>
            <div className="font-sans text-xs font-medium text-muted-foreground">
              {pendingInUsd ?? "Cotización no disponible"}
            </div>
          </div>
        }
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
