import type { Metadata } from "next";

import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { SpotVerified } from "@/components/illustrations/spot";
import { PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Requester dashboard",
  description: "Post blood requests, follow their status and confirm donations.",
};

export default async function RequesterHomePage() {
  const user = await requireRole("REQUESTER");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Every request you post is reviewed by an admin before any donor is contacted, then matched against all compatible groups."
      />

      <WelcomeCard
        eyebrow="Your next step"
        title="Post a request for a patient"
        body="Give the patient's blood group, the hospital, how many units and by when. Once an admin verifies it, LifeLink expands the group into every compatible one and invites the donors who are eligible today."
        primary={{ href: "/requester/requests/new", label: "Create a blood request" }}
        secondary={{ href: "/donors", label: "Browse the donor directory" }}
        art={SpotVerified}
      />
    </div>
  );
}
