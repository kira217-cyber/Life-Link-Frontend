import { ArrowRight, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your contribution to the LifeLink emergency assistance fund.",
  robots: { index: false },
};

/**
 * Where Stripe sends a completed checkout.
 *
 * It deliberately does not claim the payment succeeded. Anyone can open this
 * URL, and reloading it proves nothing — only the signed webhook Stripe sends
 * to the API is authoritative. So the page thanks the contributor and points
 * at the place where the real status appears once it lands.
 */
export default async function PaymentSuccessPage({
  searchParams,
}: PageProps<"/payment/success">) {
  const { session_id: sessionId } = (await searchParams) as { session_id?: string };

  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-xl place-items-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <svg
          viewBox="0 0 160 150"
          role="img"
          aria-label="A drop with a tick inside it"
          className="mx-auto w-36"
          fill="none"
        >
          <path
            d="M80 20c28 34 44 58 44 76a44 44 0 0 1-88 0c0-18 16-42 44-76Z"
            className="fill-success/15 stroke-ink"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M62 98l13 13 26-29"
            className="stroke-success"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="mt-7 font-heading text-3xl font-bold tracking-tight">Thank you</h1>
        <p className="mt-3 text-muted-foreground">
          Stripe has taken your payment. It covers transport, tests and hospital costs for
          patients who cannot meet them.
        </p>

        <div className="mt-6 rounded-xl border bg-card p-4 text-left">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Clock3 className="size-4 text-muted-foreground" />
            Your receipt may take a moment to appear
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            LifeLink marks a contribution paid only when Stripe confirms it with a signed webhook —
            not when you land on this page. That is what stops a reloaded URL from being mistaken
            for a payment.
          </p>
          {sessionId ? (
            <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
              Session {sessionId}
            </p>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild className="tap-target">
            <Link href="/donate">
              See my contributions
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
