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
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 pt-1 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
        <div className="min-w-0">
          {eyebrow && (
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              {eyebrow}
            </span>
          )}
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-[-0.02em] sm:text-[2rem]">
              {title}
            </h1>
            <div className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
            {actions}
          </div>
        )}
    </header>
  );
}
