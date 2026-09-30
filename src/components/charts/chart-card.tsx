import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The frame every chart sits in: a title that names what is plotted, a line of
 * context under it, the plot, and a legend that doubles as the reading of the
 * numbers — so identity never rests on colour alone.
 */
export function ChartCard({
  title,
  description,
  legend,
  footnote,
  className,
  children,
}: {
  title: string;
  description?: string;
  legend?: Array<{ label: string; value: string | number; color: string }>;
  footnote?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 sm:p-6", className)}>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}

      <div className="mt-5">{children}</div>

      {legend?.length ? (
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {footnote ? <p className="mt-3 text-xs text-muted-foreground">{footnote}</p> : null}
    </section>
  );
}
