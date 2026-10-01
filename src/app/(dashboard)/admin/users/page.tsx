import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/skeletons";
import { UsersTable } from "@/components/admin/users-table";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "People",
  description: "Everyone registered on LifeLink, and the one switch that controls their access.",
};

export default async function AdminUsersPage() {
  await requireRole("ADMIN");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeader
        title="People"
        description="Every account on the platform. Deactivating one signs that person out everywhere within seconds — it is not a soft warning."
      />

      <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
