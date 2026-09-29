import Link from "next/link";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";

/**
 * The opening panel on each role's dashboard: what this person is here to do,
 * with the art that belongs to their half of the workflow.
 */
export function WelcomeCard({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  art: Art,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  art: ComponentType<{ className?: string }>;
}) {
  return (
    <section className="grain overflow-hidden rounded-2xl border bg-sidebar">
      <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:gap-10">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-wider text-primary">{eyebrow}</p>
          <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{body}</p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Button asChild className="tap-target w-full sm:w-auto">
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
            {secondary ? (
              <Button asChild variant="outline" className="tap-target w-full bg-card sm:w-auto">
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0">
          <Art />
        </div>
      </div>
    </section>
  );
}
