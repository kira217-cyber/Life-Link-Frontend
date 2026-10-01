import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { RequestWizard } from "@/components/requests/request-wizard";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "New blood request",
  description: "Post a request for a patient. An admin reviews it before any donor is contacted.",
};

export default async function NewRequestPage() {
  await requireRole("REQUESTER");

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <PageHeader
        title="Post a blood request"
        description="Three short steps. Once an admin verifies it, LifeLink invites every compatible donor who is eligible today."
      />

      <RequestWizard />
    </div>
  );
}
