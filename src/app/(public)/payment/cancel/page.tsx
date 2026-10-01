import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "Your checkout was cancelled and nothing was charged.",
  robots: { index: false },
};

/**
 * Where Stripe sends an abandoned checkout.
 *
 * The important sentence is the first one: nothing was charged. A cancel page
 * that only says "cancelled" leaves people wondering whether their card was
 * touched, and that worry is what generates the support message.
 */
export default function PaymentCancelPage() {
  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-xl place-items-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <svg
          viewBox="0 0 160 150"
          role="img"
          aria-label="An outlined drop, unfilled"
          className="mx-auto w-36"
          fill="none"
        >
          <path
            d="M80 20c28 34 44 58 44 76a44 44 0 0 1-88 0c0-18 16-42 44-76Z"
            className="stroke-ink-soft"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeDasharray="9 9"
          />
        </svg>

        <h1 className="mt-7 font-heading text-3xl font-bold tracking-tight">
          Nothing was charged
        </h1>
        <p className="mt-3 text-muted-foreground">
          You closed the checkout before it completed, so your card was not used. You can start
          again whenever you like — or not at all.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild className="tap-target">
            <Link href="/donate">Try again</Link>
          </Button>
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
