import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { BloodGroupBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { ClearFilters, FilterBar, SearchFilter, SelectFilter } from "@/components/shared/filter-bar";
import { Pager } from "@/components/shared/pager";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { serverFetchPaged } from "@/lib/api/server";
import { requireRole } from "@/lib/auth/guard";
import { BLOOD_GROUPS, BLOOD_GROUP_LABEL, DEFAULT_PAGE_SIZE } from "@/lib/domain";
import { formatDistanceKm, formatRelative, pluralise } from "@/lib/format";
import type { DonorSearchResult } from "@/types/api";
import { UserAvatar } from "@/components/shared/user-avatar";

export const metadata: Metadata = {
  title: "Donor directory",
  description: "Search the donor pool by blood group, city and availability.",
};

const BLOOD_GROUP_OPTIONS = BLOOD_GROUPS.map((group) => ({
  value: group,
  label: BLOOD_GROUP_LABEL[group],
}));

interface SearchParams {
  page?: string;
  search?: string;
  bloodGroup?: string;
  city?: string;
  availableOnly?: string;
  eligibleOnly?: string;
}

/**
 * The donor pool.
 *
 * The API only opens this to requesters and admins — a donor browsing other
 * donors has no use for it and it would only widen the exposure of people's
 * details — so the page checks for those two roles before it fetches.
 *
 * What comes back is already redacted upstream: precise address and full phone
 * number are withheld unless the caller owns the record or is an admin.
 */
async function DonorResults({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? 1) || 1;

  const { items, meta } = await serverFetchPaged<DonorSearchResult>("/donors/search", {
    query: {
      page,
      limit: DEFAULT_PAGE_SIZE,
      search: searchParams.search,
      bloodGroup: searchParams.bloodGroup,
      city: searchParams.city,
      availableOnly: searchParams.availableOnly,
      eligibleOnly: searchParams.eligibleOnly,
    },
  });

  if (items.length === 0) {
    const filtered = Boolean(
      searchParams.search ||
        searchParams.bloodGroup ||
        searchParams.city ||
        searchParams.availableOnly ||
        searchParams.eligibleOnly,
    );

    return filtered ? (
      <EmptyState
        title="No donors match those filters"
        description="Widen the blood group — a patient can receive from more groups than their own — or drop the availability filter."
      />
    ) : (
      <EmptyState
        title="No donors registered yet"
        description="Donor profiles appear here as people join and set their blood group and location."
      />
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((donor) => (
          <article key={donor.donorId} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start gap-4">
              <BloodGroupBadge value={donor.bloodGroup} size="lg" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      donor.isAvailable
                        ? "inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success"
                        : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {donor.isAvailable ? "Available" : "Unavailable"}
                  </span>
                  {donor.eligibility && !donor.eligibility.eligible ? (
                    <span className="inline-flex items-center rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
                      In cooldown
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-2 flex items-center gap-2 truncate font-heading text-base font-semibold">
                  <UserAvatar name={donor.name} src={donor.avatarUrl} size={28} />
                  {donor.name}
                </h3>

                <dl className="mt-2 grid gap-1 text-sm text-muted-foreground">
                  <dd>
                    {donor.city}, {donor.district}
                    {donor.distanceKm !== null ? ` · ${formatDistanceKm(donor.distanceKm)}` : ""}
                  </dd>
                  <dd>
                    {pluralise(donor.totalDonations, "donation")} ·{" "}
                    {donor.lastDonationAt
                      ? `last ${formatRelative(donor.lastDonationAt)}`
                      : "no donation recorded"}
                  </dd>
                </dl>
              </div>
            </div>

            {donor.eligibility && !donor.eligibility.eligible ? (
              <p className="mt-3.5 border-t pt-3 text-xs text-muted-foreground">
                {donor.eligibility.reasons[0]}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <Pager meta={meta} />
    </div>
  );
}

export default async function DonorsPage({ searchParams }: PageProps<"/donors">) {
  await requireRole("REQUESTER", "ADMIN");
  const resolved = (await searchParams) as SearchParams;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title="Donor directory"
        description="Addresses and full phone numbers are withheld by the API — matching is how a donor is contacted, not this page."
      />

      <Suspense fallback={<div className="h-10 rounded-lg bg-muted" />}>
        <FilterBar>
          <SearchFilter placeholder="Search by name" />
          <SelectFilter
            paramKey="bloodGroup"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            allLabel="Any group"
          />
          <SelectFilter
            paramKey="availableOnly"
            label="Availability"
            options={[{ value: "true", label: "Available only" }]}
            allLabel="Any availability"
          />
          <SelectFilter
            paramKey="eligibleOnly"
            label="Eligibility"
            options={[{ value: "true", label: "Eligible today" }]}
            allLabel="Any eligibility"
          />
          <ClearFilters />
        </FilterBar>
      </Suspense>

      <Suspense key={JSON.stringify(resolved)} fallback={<CardListSkeleton count={4} />}>
        <DonorResults searchParams={resolved} />
      </Suspense>
    </div>
  );
}
