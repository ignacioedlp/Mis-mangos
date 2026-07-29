import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataToolbarProps {
  primary?: ReactNode;
  secondary?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function DataToolbar({
  primary,
  secondary,
  className,
  "aria-label": ariaLabel = "Herramientas de datos",
}: DataToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col gap-3 border-b border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {primary}
      </div>
      {secondary && (
        <div className="flex flex-wrap items-center gap-2">{secondary}</div>
      )}
    </div>
  );
}
