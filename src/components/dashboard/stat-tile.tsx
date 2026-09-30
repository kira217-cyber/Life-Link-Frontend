import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A single headline figure.
 *
 * Deliberately not a chart: one number with no comparison has nothing to plot,
 * and a sparkline drawn from a single value is decoration pretending to be
 * data. The supporting line under it carries the context instead.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "primary" | "success" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  } as const;

  return (
    <div className={cn("rounded-2xl border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tones[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
