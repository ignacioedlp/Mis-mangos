import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataSectionProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DataSection({
  title,
  description,
  actions,
  children,
  className,
}: DataSectionProps) {
  return (
    <section className={cn("ledger-section", className)}>
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-bold">{title}</h2>
          {description && (
            <div className="mt-1 text-sm text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
