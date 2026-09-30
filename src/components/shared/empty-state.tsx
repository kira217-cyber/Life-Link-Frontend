import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { SpotEmpty } from "@/components/illustrations/spot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * What a list shows when it has nothing in it.
 *
 * An empty table with a header row and no explanation reads as a bug. This
 * says which of the two empties it is — nothing has happened yet, or the
 * filters excluded everything — and offers the action that resolves it.
 */
export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  art: Art = SpotEmpty,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string } | ReactNode;
  secondaryAction?: { href: string; label: string };
  art?: ComponentType<{ className?: string }>;
  className?: string;
  children?: ReactNode;
}) {
  const renderedAction =
    action && typeof action === "object" && "href" in action ? (
      <Button asChild className="tap-target">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    ) : (
      action
    );

  return (
    <div
      className={cn(
        "grid place-items-center rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="w-36">
        <Art />
      </div>
      <h3 className="mt-5 font-heading text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {renderedAction || secondaryAction ? (
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {renderedAction}
          {secondaryAction ? (
            <Button asChild variant="outline" className="tap-target bg-card">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}
