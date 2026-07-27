import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <section
      className={cn(
        "fintech-panel relative overflow-hidden rounded-xl p-4 sm:p-5",
        className,
      )}
    >
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <span className="inline-flex rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-normal text-primary">
              {eyebrow}
            </span>
          )}
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-extrabold tracking-normal sm:text-3xl">
              {title}
            </h2>
            <div className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
