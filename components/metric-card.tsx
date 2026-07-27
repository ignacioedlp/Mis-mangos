import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon: LucideIcon;
  tone?: "primary" | "muted" | "success" | "danger" | "warning";
  progress?: number;
  className?: string;
}

const toneClasses = {
  primary: "border-primary/35 bg-primary/10 text-primary",
  muted: "border-border/65 bg-muted/55 text-muted-foreground",
  success: "border-chart-5/35 bg-chart-5/10 text-chart-5",
  danger: "border-destructive/35 bg-destructive/10 text-destructive",
  warning: "border-chart-1/35 bg-chart-1/10 text-chart-1",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "primary",
  progress,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "group min-h-32 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="metric-label">
          {title}
        </CardTitle>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border shadow-xs",
            toneClasses[tone],
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="metric-value text-2xl">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        )}
        {typeof progress === "number" && (
          <Progress value={progress} className="h-1.5" />
        )}
      </CardContent>
    </Card>
  );
}
