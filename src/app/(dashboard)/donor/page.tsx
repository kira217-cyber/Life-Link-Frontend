import type { Metadata } from "next";

import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { SpotMatch } from "@/components/illustrations/spot";
import { PageHeader } from "@/components/layout/page-header";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Donor dashboard",
  description: "Match invitations, your donation history and your availability.",
};

export default async function DonorHomePage() {
  const user = await requireRole("DONOR");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Invitations arrive here when a verified request matches your blood group, your location and your eligibility."
      />

      <WelcomeCard
        eyebrow="Your next step"
        title="Keep your profile current"
        body="Matching uses your blood group, district and the date of your last donation. Keeping those accurate is what puts you in front of the right request — and keeps you out of ones you are not eligible for."
        primary={{ href: "/donor/profile", label: "Review my donor profile" }}
        secondary={{ href: "/donor/donations", label: "See my donations" }}
        art={SpotMatch}
      />
    </div>
  );
}
