"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Loader } from "@/components/ui/loader";
import { useUiStore } from "@/stores/ui-store";

/**
 * The blocking overlay for moments that replace the whole page — signing in,
 * signing out, switching role.
 *
 * A spinner inside a button covers the server action, but not the gap between
 * the action resolving and the next route painting. That gap is where it looks
 * like the click did nothing, so this covers the page for the whole of it.
 *
 * It clears itself when the pathname changes: the navigation it was waiting on
 * has landed, and the component that started it is gone by then, so nothing
 * else is left to turn it off.
 */
export function LoadingOverlay() {
  const blocking = useUiStore((state) => state.blocking);
  const stopBlocking = useUiStore((state) => state.stopBlocking);
  const pathname = usePathname();

  useEffect(() => {
    stopBlocking();
  }, [pathname, stopBlocking]);

  // Keep the page behind from scrolling under the overlay.
  useEffect(() => {
    if (!blocking) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [blocking]);

  if (!blocking) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="blocking-title"
      aria-describedby={blocking.description ? "blocking-description" : undefined}
      className="fixed inset-0 z-[100] grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-xs rounded-2xl border bg-card p-8 text-center shadow-lg">
        <Loader size="xl" label={blocking.title} />
        <p id="blocking-title" className="mt-5 font-heading text-lg font-semibold">
          {blocking.title}
        </p>
        {blocking.description ? (
          <p id="blocking-description" className="mt-1.5 text-sm text-muted-foreground">
            {blocking.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
