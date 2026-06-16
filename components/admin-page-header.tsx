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
        "fintech-panel relative overflow-hidden rounded-xl p-5",
        className,
      )}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <span className="inline-flex rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-normal text-primary">
              {eyebrow}
            </span>
          )}
          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-extrabold tracking-normal">
              {title}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
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
