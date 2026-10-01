import type { Metadata } from "next";
import { Suspense } from "react";

import { DonorProfileForm } from "@/components/donors/donor-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { FormSkeleton } from "@/components/ui/skeletons";
import { serverFetch } from "@/lib/api/server";
import { requireRole } from "@/lib/auth/guard";
import type { DonorProfileWithEligibility, MeResponse } from "@/types/api";

export const metadata: Metadata = {
  title: "Donor profile",
  description: "Your blood group, location and availability — the record matching runs on.",
};

async function ProfileLoader() {
  const me = await serverFetch<MeResponse>("/users/me");
  const profile = me.donorProfile as DonorProfileWithEligibility | null;

  return (
    <DonorProfileForm profile={profile} eligibility={profile?.eligibility ?? null} />
  );
}

export default async function DonorProfilePage() {
  await requireRole("DONOR");

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title="Donor profile"
        description="This is not account decoration — your blood group, your city and the date of your last donation are what decide whether an invitation reaches you at all."
      />

      <Suspense fallback={<FormSkeleton fields={6} />}>
        <ProfileLoader />
      </Suspense>
    </div>
  );
}
