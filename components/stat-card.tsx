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
  dollar: "bg-primary/10 text-primary",
  trendingDown: "bg-primary/10 text-primary",
  trendingUp: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  calendar: "bg-gold-200/10 text-gold-200",
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
    <Card className={cn("group relative min-h-32 overflow-hidden border-border/70 bg-card/[0.94] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md", accentClassName)}>
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="font-mono text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border border-current/10 shadow-xs", iconColor)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="relative space-y-2">
        <div className="font-serif text-2xl font-extrabold leading-none tracking-normal text-foreground" aria-live="polite">{value}</div>
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
