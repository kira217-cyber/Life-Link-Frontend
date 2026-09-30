import type { Metadata } from "next";
import { Suspense } from "react";

import { ModerationTable } from "@/components/admin/moderation-table";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/skeletons";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Blood requests",
  description: "Review pending requests before any donor is contacted about them.",
};

export default async function AdminRequestsPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeader
        title="Review queue"
        description="A pending request is invisible to donors until it is verified here. Rejecting one asks for a reason, which the requester sees."
      />

      <Suspense fallback={<TableSkeleton rows={6} columns={6} />}>
        <ModerationTable />
      </Suspense>
    </div>
  );
}
