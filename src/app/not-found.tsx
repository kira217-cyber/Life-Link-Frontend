import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <svg
          viewBox="0 0 200 140"
          role="img"
          aria-label="An empty map with a missing pin"
          className="mx-auto w-44"
          fill="none"
        >
          <path
            d="M24 40l44-16 64 20 44-16v76l-44 16-64-20-44 16V40Z"
            className="fill-card stroke-ink"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M68 24v76M132 44v76" className="stroke-ink" strokeWidth="5" opacity="0.35" />
          <circle cx="100" cy="66" r="19" className="stroke-primary" strokeWidth="5" strokeDasharray="6 8" />
          <path d="M100 58v10M100 76h.01" className="stroke-primary" strokeWidth="5" strokeLinecap="round" />
        </svg>

        <p className="mt-6 font-mono text-sm text-primary">404</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
          We could not find that page
        </h1>
        <p className="mt-3 text-muted-foreground">
          The link may be out of date, or the request it pointed at may have been fulfilled and
          closed.
        </p>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild className="tap-target">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href="/how-it-works">See how LifeLink works</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
