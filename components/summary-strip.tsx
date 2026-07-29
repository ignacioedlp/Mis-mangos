import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type SummaryTone = "default" | "accent" | "success" | "danger";

export interface SummaryItem {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: LucideIcon;
  tone?: SummaryTone;
  progress?: number;
}

interface SummaryStripProps {
  items: SummaryItem[];
  className?: string;
  "aria-label"?: string;
}

const toneClasses: Record<SummaryTone, string> = {
  default: "text-foreground",
  accent: "text-primary",
  success: "text-chart-5",
  danger: "text-destructive",
};

export function SummaryStrip({
  items,
  className,
  "aria-label": ariaLabel = "Resumen financiero",
}: SummaryStripProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const tone = item.tone ?? "default";

        return (
          <div
            key={item.label}
            className="min-w-0 border-b border-border p-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="metric-label">{item.label}</p>
              {Icon && (
                <Icon
                  className={cn("size-4 shrink-0", toneClasses[tone])}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className={cn("metric-value mt-3 text-2xl", toneClasses[tone])}>
              {item.value}
            </div>
            {item.detail && (
              <p className="mt-2 min-h-4 text-xs leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            )}
            {typeof item.progress === "number" && (
              <Progress
                value={Math.max(0, Math.min(item.progress, 100))}
                className="mt-3 h-1"
                aria-label={`${item.label}: ${item.progress.toFixed(0)}%`}
              />
            )}
          </div>
        );
      })}
    </section>
  );
}
