import type { Metadata } from "next";

import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { SpotRecord } from "@/components/illustrations/spot";
import { PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Platform analytics, request moderation, users and the audit trail.",
};

export default async function AdminHomePage() {
  const user = await requireRole("ADMIN");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Nothing reaches a donor until it passes through here. Requests wait for review, and every action is written to the audit trail."
      />

      <WelcomeCard
        eyebrow="Your next step"
        title="Clear the review queue"
        body="Pending requests are invisible to donors until you verify them. Each one carries the patient, the hospital and the deadline, so a request that cannot be confirmed can be rejected with a reason the requester will see."
        primary={{ href: "/admin/requests", label: "Review pending requests" }}
        secondary={{ href: "/admin/audit-logs", label: "Open the audit log" }}
        art={SpotRecord}
      />
    </div>
  );
}
