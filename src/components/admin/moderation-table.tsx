"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import { SpotVerified } from "@/components/illustrations/spot";
import { BloodGroupBadge, RequestStatusBadge, UrgencyBadge } from "@/components/shared/badges";
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
import { TableSkeleton } from "@/components/ui/skeletons";
import { Textarea } from "@/components/ui/textarea";
import { useAdminRequests, useModerateRequest } from "@/hooks/queries/use-requests";
import { useQueryParams } from "@/hooks/use-query-params";
import { BLOOD_GROUPS, BLOOD_GROUP_LABEL, REQUEST_STATUSES, REQUEST_STATUS_LABEL, URGENCY_OPTIONS } from "@/lib/domain";
import { formatDate, formatRelative, pluralise } from "@/lib/format";
import type { BloodRequest } from "@/types/api";

const STATUS_OPTIONS = REQUEST_STATUSES.map((status) => ({
  value: status,
  label: REQUEST_STATUS_LABEL[status],
}));

const BLOOD_GROUP_OPTIONS = BLOOD_GROUPS.map((group) => ({
  value: group,
  label: BLOOD_GROUP_LABEL[group],
}));

/**
 * The review queue.
 *
 * A pending request is invisible to donors until someone here acts on it, so
 * the two actions sit on the row rather than behind a detail page — the whole
 * job is reading a line and deciding.
 *
 * Rejecting asks for a reason before it fires. The requester sees that text,
 * and a refusal with no explanation is the kind of dead end that turns into a
 * support message.
 */
export function ModerationTable() {
  const { get, getNumber } = useQueryParams();
  const filters = {
    page: getNumber("page", 1),
    search: get("search") || undefined,
    status: get("status") || undefined,
    bloodGroup: get("bloodGroup") || undefined,
    urgency: get("urgency") || undefined,
  };

  const { data, isPending, isError, error, refetch } = useAdminRequests(filters);
  const moderate = useModerateRequest();
  const [rejecting, setRejecting] = useState<BloodRequest | null>(null);
  const [reason, setReason] = useState("");

  const filterRow = (
    <FilterBar>
      <SearchFilter placeholder="Search patient or hospital" />
      <SelectFilter paramKey="status" label="Status" options={STATUS_OPTIONS} allLabel="Any status" />
      <SelectFilter
        paramKey="bloodGroup"
        label="Blood group"
        options={BLOOD_GROUP_OPTIONS}
        allLabel="Any group"
      />
      <SelectFilter paramKey="urgency" label="Urgency" options={URGENCY_OPTIONS} allLabel="Any urgency" />
      <ClearFilters />
    </FilterBar>
  );

  if (isPending) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <TableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid gap-5">
        {filterRow}
        <EmptyState
          title="Could not load the queue"
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

  return (
    <>
      <div className="grid gap-5">
        {filterRow}

        {rows.length === 0 ? (
          <EmptyState
            art={SpotVerified}
            title="Nothing waiting for review"
            description="Every request has been dealt with. New ones appear here the moment a requester submits them."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="scroll-x">
                <table className="w-full min-w-[52rem] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th scope="col" className="px-4 py-3 font-medium">
                        Patient
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Group
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Hospital
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Needed
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">
                        Review
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((request) => {
                      const busy =
                        moderate.isPending && moderate.variables?.requestId === request.id;
                      const pending = request.status === "PENDING";

                      return (
                        <tr key={request.id} className="border-b last:border-0 align-middle">
                          <td className="px-4 py-3.5">
                            <p className="font-medium">{request.patientName}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {pluralise(request.unitsNeeded, "unit")} · {formatRelative(request.createdAt)}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <BloodGroupBadge value={request.bloodGroup} size="sm" />
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="max-w-[16rem] truncate">{request.hospitalName}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {request.city}, {request.district}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <p>{formatDate(request.neededAt)}</p>
                            <div className="mt-1">
                              <UrgencyBadge value={request.urgency} />
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <RequestStatusBadge value={request.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            {pending ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 bg-card"
                                  disabled={moderate.isPending}
                                  onClick={() => {
                                    setReason("");
                                    setRejecting(request);
                                  }}
                                >
                                  <X className="size-3.5" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  disabled={moderate.isPending}
                                  onClick={() =>
                                    moderate.mutate({ requestId: request.id, decision: "verify" })
                                  }
                                >
                                  {busy ? (
                                    <InlineLoader label="Verifying" />
                                  ) : (
                                    <Check className="size-3.5" />
                                  )}
                                  Verify
                                </Button>
                              </div>
                            ) : (
                              <p className="text-right text-xs text-muted-foreground">
                                {request.verifiedAt
                                  ? `Reviewed ${formatRelative(request.verifiedAt)}`
                                  : "—"}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <Pager meta={data?.meta ?? null} />
          </>
        )}
      </div>

      <Dialog open={rejecting !== null} onOpenChange={(next) => !next && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this request?</DialogTitle>
            <DialogDescription>
              The requester will see your reason, and no donor will ever be contacted about it.
              Rejection is final — the request cannot be reopened.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="For example: the hospital could not confirm this admission"
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Keep it pending
            </Button>
            <Button
              variant="destructive"
              disabled={moderate.isPending || reason.trim().length === 0}
              onClick={() => {
                if (!rejecting) return;
                moderate.mutate(
                  { requestId: rejecting.id, decision: "reject", note: reason.trim() },
                  { onSettled: () => setRejecting(null) },
                );
              }}
            >
              {moderate.isPending ? (
                <>
                  <InlineLoader label="Rejecting" />
                  Rejecting…
                </>
              ) : (
                "Reject request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
