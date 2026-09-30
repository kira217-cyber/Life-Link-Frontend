"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * The shared body of every error.tsx.
 *
 * Says what failed in a sentence someone can act on, offers the retry that
 * usually fixes a transient failure, and keeps the digest visible — that
 * string is the only thing tying a user's report to a server log.
 */
export function ErrorView({
  title = "Something went wrong",
  description = "The page could not be loaded. This is usually temporary — trying again often works.",
  error,
  reset,
  homeHref = "/",
  homeLabel = "Back to home",
}: {
  title?: string;
  description?: string;
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <svg
          viewBox="0 0 160 140"
          role="img"
          aria-label="A drop with a crack through it"
          className="mx-auto w-32"
          fill="none"
        >
          <path
            d="M80 22c26 32 40 54 40 70a40 40 0 0 1-80 0c0-16 14-38 40-70Z"
            className="fill-primary/10 stroke-ink"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M80 58l-11 22h20l-13 24"
            className="stroke-primary"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="tap-target gap-2">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
