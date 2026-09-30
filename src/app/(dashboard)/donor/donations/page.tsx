import { Droplets } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { StatTile } from "@/components/dashboard/stat-tile";
import { SpotRecord } from "@/components/illustrations/spot";
import { BloodGroupBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { Pager } from "@/components/shared/pager";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { serverFetch, serverFetchPaged } from "@/lib/api/server";
import { requireRole } from "@/lib/auth/guard";
import { DEFAULT_PAGE_SIZE, DONOR_ELIGIBILITY } from "@/lib/domain";
import { formatDate, formatNumber, formatRelative, pluralise } from "@/lib/format";
import type { Donation, MeResponse } from "@/types/api";

export const metadata: Metadata = {
  title: "My donations",
  description: "Every donation recorded against your account, and when you can next give.",
};

/**
 * The donor's own record.
 *
 * The cooldown is the reason this page matters beyond nostalgia: the date of
 * the last donation is what decides whether the next invitation reaches this
 * donor at all, so it is shown as a date rather than buried in a list.
 */
async function DonationHistory({ page }: { page: number }) {
  const [me, donations] = await Promise.all([
    serverFetch<MeResponse>("/users/me"),
    serverFetchPaged<Donation>("/donations/mine", { query: { page, limit: DEFAULT_PAGE_SIZE } }),
  ]);

  const profile = me.donorProfile;
  const nextEligible = profile?.lastDonationAt
    ? new Date(
        new Date(profile.lastDonationAt).getTime() +
          DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION * 86_400_000,
      ).toISOString()
    : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Donations recorded"
          value={formatNumber(profile?.totalDonations ?? 0)}
          hint="Confirmed by the requester"
          icon={Droplets}
          tone="primary"
        />
        <StatTile
          label="Last donation"
          value={profile?.lastDonationAt ? formatDate(profile.lastDonationAt) : "—"}
          hint={
            profile?.lastDonationAt ? formatRelative(profile.lastDonationAt) : "No donation yet"
          }
        />
        <StatTile
          label="Next eligible"
          value={nextEligible ? formatDate(nextEligible) : "Now"}
          hint={`${DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION} days between donations`}
          tone={nextEligible && new Date(nextEligible) > new Date() ? "warning" : "success"}
        />
      </div>

      {donations.items.length === 0 ? (
        <EmptyState
          art={SpotRecord}
          title="No donations recorded yet"
          description="A donation appears here once the requester confirms it. Accepting an invitation is the first step."
          action={{ href: "/donor", label: "See my invitations" }}
          secondaryAction={{ href: "/requests", label: "Browse open requests" }}
        />
      ) : (
        <div className="grid gap-3">
          {donations.items.map((donation) => (
            <article
              key={donation.id}
              className="flex items-start gap-4 rounded-2xl border bg-card p-5"
            >
              {donation.request ? (
                <BloodGroupBadge value={donation.request.bloodGroup} size="lg" />
              ) : null}

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-base font-semibold">
                  {donation.request?.patientName ?? "A patient"}
                </h3>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {donation.request?.hospitalName ?? "Hospital not recorded"}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{pluralise(donation.units, "unit")}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    on {formatDate(donation.donationDate)} ({formatRelative(donation.donationDate)})
                  </span>
                </p>
              </div>
            </article>
          ))}

          <Pager meta={donations.meta} />
        </div>
      )}
    </div>
  );
}

export default async function DonationsPage({ searchParams }: PageProps<"/donor/donations">) {
  await requireRole("DONOR");
  const resolved = (await searchParams) as { page?: string };
  const page = Number(resolved.page ?? 1) || 1;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title="My donations"
        description="What you have given, and when you can give again. The cooldown is what keeps you out of invitations you are not yet eligible for."
      />

      <Suspense key={page} fallback={<CardListSkeleton count={3} />}>
        <DonationHistory page={page} />
      </Suspense>
    </div>
  );
}
