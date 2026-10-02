import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

/**
 * What a failed sign-in looks like, wherever it failed.
 *
 * Three different things land here — Google refusing, the API refusing, and a
 * code that never arrived — and all three leave someone in the same position:
 * not signed in, nothing changed, needing a way forward. One panel rather
 * than three keeps that answer identical.
 *
 * A redirect would have been the obvious alternative, but `(auth)` streams a
 * loading shell first, so a `redirect()` in the page body degrades into a
 * client-side navigation the visitor can see happen.
 */
export function AuthProblem({
  title,
  description,
  hint,
}: {
  title: string;
  description: string;
  hint?: ReactNode;
}) {
  return (
    <div className="w-full max-w-md text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-urgency-critical-soft">
        <TriangleAlert className="size-7 text-urgency-critical" />
      </div>

      <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}

      <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
        <Button asChild className="tap-target">
          <Link href="/login">Back to sign in</Link>
        </Button>
        <Button asChild variant="outline" className="tap-target bg-card">
          <Link href="/register">Create an account</Link>
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        An email and password works too — Google is only one of the ways in.
      </p>
    </div>
  );
}
