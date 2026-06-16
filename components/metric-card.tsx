import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  icon: LucideIcon;
  tone?: "primary" | "muted" | "success" | "danger" | "warning";
  className?: string;
}

const toneClasses = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  muted: "border-border/60 bg-muted/50 text-muted-foreground",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  danger: "border-destructive/20 bg-destructive/10 text-destructive",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "primary",
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "group min-h-32 border-border/70 bg-card/[0.94] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="font-mono text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
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
        <div className="font-serif text-2xl font-extrabold leading-none tracking-normal">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
