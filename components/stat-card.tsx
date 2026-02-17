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
  dollar: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  trendingDown: "bg-primary/10 text-primary",
  trendingUp: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  calendar: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
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
    <Card className={cn("relative overflow-hidden border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-md", accentClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconColor)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="font-serif text-2xl font-extrabold leading-none tracking-tight" aria-live="polite">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {typeof progress === "number" && (
          <div className="pt-1" aria-label={`Progreso ${progress.toFixed(0)}%`}>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
