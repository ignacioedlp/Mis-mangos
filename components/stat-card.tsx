"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingDown, TrendingUp, Calendar } from "lucide-react";

const ICONS = {
  dollar: DollarSign,
  trendingDown: TrendingDown,
  trendingUp: TrendingUp,
  calendar: Calendar,
};

const ICON_COLORS = {
  dollar: "border-primary/35 bg-primary/10 text-primary",
  trendingDown: "border-chart-2/35 bg-chart-2/10 text-chart-2",
  trendingUp: "border-chart-1/35 bg-chart-1/10 text-chart-1",
  calendar: "border-chart-3/35 bg-chart-3/10 text-chart-3",
};

export interface StatCardProps {
  title: string;
  iconName: keyof typeof ICONS;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  accentClassName?: string;
  progress?: number;
}

export function StatCard({ title, iconName, value, subtitle, accentClassName, progress }: StatCardProps) {
  const Icon = ICONS[iconName];
  const iconColor = ICON_COLORS[iconName];
  return (
    <Card className={cn("group min-h-32 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md", accentClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="metric-label">
          {title}
        </CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border shadow-xs", iconColor)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="relative space-y-2">
        <div className="metric-value text-2xl" aria-live="polite">{value}</div>
        {subtitle && <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>}
        {typeof progress === "number" && (
          <div className="pt-1" aria-label={`Progreso ${progress.toFixed(0)}%`}>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
