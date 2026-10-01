import type { Metadata } from "next";
import { Suspense } from "react";

import { AuditTable } from "@/components/admin/audit-table";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/skeletons";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Audit trail",
  description: "An append-only record of every action taken on the platform.",
};

export default async function AdminAuditLogsPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeader
        title="Audit trail"
        description="Who did what, and when. Append-only by design — an audit log that can be tidied up is not evidence of anything."
      />

      <Suspense fallback={<TableSkeleton rows={10} columns={4} />}>
        <AuditTable />
      </Suspense>
    </div>
  );
}
