"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";

import { useUiStore } from "@/stores/ui-store";

/** What every auth-style server action resolves to. */
type ActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

interface RunOptions {
  /** Shown in the overlay while the action runs. */
  title: string;
  description?: string;
  /** Toast on success — skipped when omitted. */
  successMessage?: string;
  /** Called with the field errors so a form can put them beside its inputs. */
  onFieldErrors?: (errors: Record<string, string>) => void;
}

/**
 * Runs a server action that ends in a navigation, with the overlay up for the
 * whole of it.
 *
 * The three steps this bundles are the ones that were easy to get wrong
 * separately: raise the overlay before the await, keep the router call inside
 * the transition so the pending state spans the navigation too, and lower the
 * overlay on failure — on success the overlay clears itself when the new route
 * lands, because the component that raised it no longer exists by then.
 */
export function useBlockingAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const startBlocking = useUiStore((state) => state.startBlocking);
  const stopBlocking = useUiStore((state) => state.stopBlocking);

  const run = useCallback(
    (action: () => Promise<ActionResult>, options: RunOptions) => {
      const { title, description, successMessage, onFieldErrors } = options;

      startBlocking({ title, ...(description ? { description } : {}) });

      startTransition(async () => {
        const result = await action();

        if (!result.ok) {
          stopBlocking();
          if (result.fieldErrors && onFieldErrors) onFieldErrors(result.fieldErrors);
          toast.error(result.message);
          return;
        }

        if (successMessage) toast.success(successMessage);

        // Inside the transition on purpose: the pending state then covers the
        // navigation as well as the action that preceded it.
        router.push(result.redirectTo);
        router.refresh();
      });
    },
    [router, startBlocking, stopBlocking],
  );

  return { run, pending };
}
