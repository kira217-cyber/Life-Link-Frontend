"use client";

import { Users } from "lucide-react";
import { useState } from "react";

import { SpotGuesswork } from "@/components/illustrations/spot";
import { RequestCard } from "@/components/requests/request-card";
import { RequestDonors } from "@/components/requests/request-donors";
import { EmptyState } from "@/components/shared/empty-state";
import { ClearFilters, FilterBar, SearchFilter, SelectFilter } from "@/components/shared/filter-bar";
import { Pager } from "@/components/shared/pager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineLoader } from "@/components/ui/loader";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { Textarea } from "@/components/ui/textarea";
import { useCancelRequest, useFindMatches, useMyRequests } from "@/hooks/queries/use-requests";
import { useQueryParams } from "@/hooks/use-query-params";
import {
  CANCELLABLE_REQUEST_STATUSES,
  REQUEST_STATUSES,
  REQUEST_STATUS_LABEL,
} from "@/lib/domain";
import type { BloodRequest } from "@/types/api";

const STATUS_OPTIONS = REQUEST_STATUSES.map((status) => ({
  value: status,
  label: REQUEST_STATUS_LABEL[status],
}));

/**
 * The requester's own requests, with the two actions that belong to this
 * stage: inviting donors once a request has been verified, and cancelling one
 * that is no longer needed.
 *
 * Find-matches only appears on a verified request — the API refuses it before
 * then, and offering a button that is guaranteed to fail is worse than not
 * offering one.
 */
export function MyRequestList() {
  const { get, getNumber } = useQueryParams();
  const filters = {
    page: getNumber("page", 1),
    search: get("search") || undefined,
    status: get("status") || undefined,
  };

  const { data, isPending, isError, error, refetch } = useMyRequests(filters);
  const findMatches = useFindMatches();
  const cancel = useCancelRequest();
  const [cancelling, setCancelling] = useState<BloodRequest | null>(null);
  const [reason, setReason] = useState("");

  const filterRow = (
    <FilterBar>
      <SearchFilter placeholder="Search patient or hospital" />
      <SelectFilter paramKey="status" label="Status" options={STATUS_OPTIONS} allLabel="Any status" />
      <ClearFilters />
    </FilterBar>
  );

  if (isPending) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <CardListSkeleton count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <EmptyState
          title="Could not load your requests"
          description={error instanceof Error ? error.message : "Please try again."}
          action={
            <Button onClick={() => refetch()} className="tap-target">
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const rows = data?.items ?? [];
  const filtered = Boolean(filters.search || filters.status);

  return (
    <>
      <div className="grid gap-5">
        {filterRow}

        {rows.length === 0 ? (
          filtered ? (
            <EmptyState
              title="No requests match those filters"
              description="Try clearing the status filter to see everything you have posted."
            />
          ) : (
            <EmptyState
              art={SpotGuesswork}
              title="You have not posted a request yet"
              description="Give the patient's blood group, the hospital and the deadline. An admin reviews it, then LifeLink invites every compatible donor who is eligible today."
              action={{ href: "/requester/requests/new", label: "Create a blood request" }}
            />
          )
        ) : (
          <>
            <div className="grid gap-3">
              {rows.map((request) => {
                const busyMatching =
                  findMatches.isPending && findMatches.variables === request.id;
                const canMatch = request.status === "VERIFIED" || request.status === "MATCHING";
                const canCancel = CANCELLABLE_REQUEST_STATUSES.includes(request.status);

                return (
                  <RequestCard
                    key={request.id}
                    request={request}
                    footer={
                      // Only once donors could exist; a PENDING request has
                      // nobody invited and nothing to show.
                      request.status === "MATCHING" || request.status === "FULFILLED" ? (
                        <RequestDonors request={request} />
                      ) : null
                    }
                    action={
                      <div className="flex flex-wrap gap-2">
                        {canCancel ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-card"
                            disabled={cancel.isPending}
                            onClick={() => {
                              setReason("");
                              setCancelling(request);
                            }}
                          >
                            Cancel
                          </Button>
                        ) : null}

                        {canMatch ? (
                          <Button
                            size="sm"
                            className="gap-1.5"
                            disabled={findMatches.isPending}
                            onClick={() => findMatches.mutate(request.id)}
                          >
                            {busyMatching ? (
                              <InlineLoader label="Inviting donors" />
                            ) : (
                              <Users className="size-3.5" />
                            )}
                            {busyMatching ? "Inviting…" : "Invite donors"}
                          </Button>
                        ) : null}
                      </div>
                    }
                  />
                );
              })}
            </div>

            <Pager meta={data?.meta ?? null} />
          </>
        )}
      </div>

      <Dialog open={cancelling !== null} onOpenChange={(next) => !next && setCancelling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this request?</DialogTitle>
            <DialogDescription>
              Any donor already invited will be told it is no longer needed. A cancelled request
              cannot be reopened — you would have to post a new one.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional — for example, the patient received blood elsewhere"
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>
              Keep it open
            </Button>
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() => {
                if (!cancelling) return;
                cancel.mutate(
                  {
                    requestId: cancelling.id,
                    ...(reason.trim() ? { reason: reason.trim() } : {}),
                  },
                  { onSettled: () => setCancelling(null) },
                );
              }}
            >
              {cancel.isPending ? (
                <>
                  <InlineLoader label="Cancelling" />
                  Cancelling…
                </>
              ) : (
                "Cancel request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
