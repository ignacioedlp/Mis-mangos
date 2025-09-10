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

export interface StatCardProps {
  title: string;
  iconName: keyof typeof ICONS;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  accentClassName?: string; // optional gradient / bg classes
  progress?: number; // 0-100
}

export function StatCard({ title, iconName, value, subtitle, accentClassName, progress }: StatCardProps) {
  const Icon = ICONS[iconName];
  return (
    <Card className={cn("relative overflow-hidden", accentClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold leading-none tracking-tight" aria-live="polite">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {typeof progress === "number" && (
          <div className="pt-1" aria-label={`Progreso ${progress.toFixed(0)}%`}>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
