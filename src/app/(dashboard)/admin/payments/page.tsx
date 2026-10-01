import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentsTable } from "@/components/admin/payments-table";
import { PageHeader } from "@/components/layout/page-header";
import { StatGridSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Payments",
  description: "Every donation through Stripe, and what the platform has actually received.",
};

export default async function AdminPaymentsPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeader
        title="Payments"
        description="The ledger, straight from Stripe. Nothing here can be edited — a row turns paid when Stripe signs a webhook saying so, and never because someone clicked."
      />

      <Suspense
        fallback={
          <div className="grid gap-5">
            <StatGridSkeleton count={2} />
            <TableSkeleton rows={6} columns={5} />
          </div>
        }
      >
        <PaymentsTable />
      </Suspense>
    </div>
  );
}
