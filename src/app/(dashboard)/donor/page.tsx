import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { InvitationList } from "@/components/matches/invitation-list";
import { Button } from "@/components/ui/button";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "My invitations",
  description: "Match invitations from verified blood requests you are compatible with.",
};

export default async function DonorHomePage() {
  const user = await requireRole("DONOR");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Invitations appear here when a verified request matches your blood group, your area and your eligibility. Accepting tells the requester to expect you."
        action={
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href="/donor/profile">My donor profile</Link>
          </Button>
        }
      />

      <Suspense fallback={<CardListSkeleton count={3} />}>
        <InvitationList />
      </Suspense>
    </div>
  );
}
