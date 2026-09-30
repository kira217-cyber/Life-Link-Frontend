import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { RequestCard } from "@/components/requests/request-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ClearFilters, FilterBar, SearchFilter, SelectFilter } from "@/components/shared/filter-bar";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { serverFetchPaged } from "@/lib/api/server";
import { requireUser } from "@/lib/auth/guard";
import { BLOOD_GROUPS, BLOOD_GROUP_LABEL, DEFAULT_PAGE_SIZE, URGENCY_OPTIONS } from "@/lib/domain";
import type { BloodRequest } from "@/types/api";

export const metadata: Metadata = {
  title: "Open requests",
  description:
    "Verified blood requests waiting for donors — filter by blood group, urgency and city.",
};

const BLOOD_GROUP_OPTIONS = BLOOD_GROUPS.map((group) => ({
  value: group,
  label: BLOOD_GROUP_LABEL[group],
}));

interface SearchParams {
  page?: string;
  search?: string;
  bloodGroup?: string;
  urgency?: string;
  city?: string;
}

/**
 * Verified requests, open to every signed-in role.
 *
 * The API keeps this behind authentication — a list of patients, hospitals and
 * contact numbers is not public information — so the page lives in the
 * dashboard rather than on the marketing side.
 *
 * Fetched on the server so the rows arrive rendered, with the filters held in
 * the URL: that is what makes "critical O− in Dhaka" a link someone can send.
 */
async function RequestList({ searchParams }: { searchParams: SearchParams }) {
  const page = Number(searchParams.page ?? 1) || 1;

  const { items, meta } = await serverFetchPaged<BloodRequest>("/blood-requests", {
    query: {
      page,
      limit: DEFAULT_PAGE_SIZE,
      // Only what is actually open to a donor — a fulfilled or cancelled
      // request has nothing left to offer.
      status: "VERIFIED",
      search: searchParams.search,
      bloodGroup: searchParams.bloodGroup,
      urgency: searchParams.urgency,
      city: searchParams.city,
      sortBy: "neededAt",
      sortOrder: "asc",
    },
  });

  if (items.length === 0) {
    const filtered = Boolean(
      searchParams.search || searchParams.bloodGroup || searchParams.urgency || searchParams.city,
    );

    return filtered ? (
      <EmptyState
        title="No requests match those filters"
        description="Try widening the blood group or clearing the search — a compatible donor is often needed nearby rather than exactly here."
      />
    ) : (
      <EmptyState
        title="No open requests right now"
        description="Every verified request has been answered. This list fills again as soon as an admin verifies a new one."
        secondaryAction={{ href: "/eligibility", label: "Check donor eligibility" }}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
      <Pager meta={meta} />
    </div>
  );
}

export default async function RequestsPage({ searchParams }: PageProps<"/requests">) {
  await requireUser("/requests");
  const resolved = (await searchParams) as SearchParams;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title="Open requests"
        description="Every request here has been verified by an admin. A patient can receive from more groups than their own — filter to the ones you match."
        action={
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href="/eligibility">Compatibility chart</Link>
          </Button>
        }
      />

      <Suspense fallback={<div className="h-10 rounded-lg bg-muted" />}>
        <FilterBar>
          <SearchFilter placeholder="Search patient or hospital" />
          <SelectFilter
            paramKey="bloodGroup"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            allLabel="Any group"
          />
          <SelectFilter
            paramKey="urgency"
            label="Urgency"
            options={URGENCY_OPTIONS}
            allLabel="Any urgency"
          />
          <ClearFilters />
        </FilterBar>
      </Suspense>

      <Suspense key={JSON.stringify(resolved)} fallback={<CardListSkeleton count={4} />}>
        <RequestList searchParams={resolved} />
      </Suspense>
    </div>
  );
}
