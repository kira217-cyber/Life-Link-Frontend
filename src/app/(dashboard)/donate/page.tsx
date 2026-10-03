import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DonateForm } from "@/components/payments/donate-form";
import { PaymentStatusBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { FormSkeleton } from "@/components/ui/skeletons";
import { serverFetch } from "@/lib/api/server";
import { requireUser } from "@/lib/auth/guard";
import { formatMoney, formatRelative } from "@/lib/format";
import type { MyPaymentsPayload } from "@/types/api";

export const metadata: Metadata = {
  title: "Support the fund",
  description:
    "Contribute to the emergency assistance fund, or to keeping LifeLink running. Payments are handled by Stripe.",
};

/** The contributor's own history, so a repeat donor can see what they gave. */
async function MyPayments() {
  // This endpoint wraps its rows to carry the paid totals, so it is read as
  // an envelope — treating it as a bare array is what made this page throw.
  const { payments: items } = await serverFetch<MyPaymentsPayload>("/payments/mine", {
    query: { page: 1, limit: 5 },
  });

  if (items.length === 0) {
    return (
      <EmptyState
        art={HeartHandshake as never}
        title="No contributions yet"
        description="Your first one will appear here once Stripe confirms it."
        className="min-h-0 py-8"
      />
    );
  }

  return (
    <ul className="grid gap-2.5">
      {items.map((payment) => (
        <li
          key={payment.id}
          className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4"
        >
          <div className="min-w-0">
            <p className="font-heading text-base font-semibold tabular-nums">
              {formatMoney(payment.amount, payment.currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {payment.purpose === "EMERGENCY_FUND" ? "Emergency fund" : "Platform support"} ·{" "}
              {formatRelative(payment.createdAt)}
            </p>
          </div>
          <PaymentStatusBadge value={payment.status} />
        </li>
      ))}
    </ul>
  );
}

export default async function DonatePage() {
  await requireUser("/donate");

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title="Support the fund"
        description="Blood is given freely, but getting a donor to a hospital is not always free. This fund covers transport, tests and costs patients cannot meet."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <DonateForm />
        </div>

        <section>
          <h2 className="font-heading text-base font-semibold">Your contributions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A contribution stays pending until Stripe&apos;s signed webhook confirms it.
          </p>
          <div className="mt-4">
            <Suspense fallback={<FormSkeleton fields={2} />}>
              <MyPayments />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
