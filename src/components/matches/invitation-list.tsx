"use client";

import { CalendarClock, Hospital, MapPin, Navigation } from "lucide-react";
import { useState } from "react";

import { SpotMatch } from "@/components/illustrations/spot";
import { BloodGroupBadge, MatchStatusBadge, UrgencyBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
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
import { useAnswerMatch, useMyMatches } from "@/hooks/queries/use-matches";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatDate, formatDistanceKm, formatRelative, pluralise } from "@/lib/format";
import type { DonorMatch } from "@/types/api";

/**
 * The donor's invitations, fetched in the browser so accepting one updates the
 * list without a full page navigation.
 *
 * This is the one view where client-side fetching earns its place: the page is
 * a queue the donor works through, and a server round trip per answer would
 * make it feel like a form rather than a list.
 */
export function InvitationList() {
  const { getNumber } = useQueryParams();
  const page = getNumber("page", 1);

  const { data, isPending, isError, error, refetch } = useMyMatches({ page });
  const answer = useAnswerMatch();
  const [declining, setDeclining] = useState<DonorMatch | null>(null);
  const [reason, setReason] = useState("");

  if (isPending) return <CardListSkeleton count={3} />;

  if (isError) {
    return (
      <EmptyState
        title="Could not load your invitations"
        description={error instanceof Error ? error.message : "Please try again."}
        action={
          <Button onClick={() => refetch()} className="tap-target">
            Try again
          </Button>
        }
      />
    );
  }

  const matches = data?.items ?? [];

  if (matches.length === 0) {
    return (
      <EmptyState
        art={SpotMatch}
        title="No invitations yet"
        description="You will hear from us when a verified request matches your blood group, your area and your eligibility. Keeping your profile current is what puts you in front of the right one."
        action={{ href: "/donor/profile", label: "Review my donor profile" }}
        secondaryAction={{ href: "/requests", label: "Browse open requests" }}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-3">
          {matches.map((match) => {
            const request = match.request;
            const pending = answer.isPending && answer.variables?.matchId === match.id;
            const open = match.status === "INVITED";

            return (
              <article key={match.id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start gap-4">
                  <BloodGroupBadge value={match.donorBloodGroup} size="lg" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <MatchStatusBadge value={match.status} />
                      {request ? <UrgencyBadge value={request.urgency} /> : null}
                    </div>

                    <h3 className="mt-2 truncate font-heading text-base font-semibold">
                      {request ? request.patientName : "A patient near you"}
                    </h3>

                    <dl className="mt-2.5 grid gap-1.5 text-sm text-muted-foreground">
                      {request ? (
                        <>
                          <div className="flex items-start gap-2">
                            <Hospital className="mt-0.5 size-4 shrink-0" />
                            <dd className="min-w-0 truncate">{request.hospitalName}</dd>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            <dd className="min-w-0 truncate">
                              {request.city}, {request.district}
                            </dd>
                          </div>
                          <div className="flex items-start gap-2">
                            <CalendarClock className="mt-0.5 size-4 shrink-0" />
                            <dd>
                              Needed {formatDate(request.neededAt)}
                              <span className="ml-1.5 text-xs">
                                ({formatRelative(request.neededAt)})
                              </span>
                            </dd>
                          </div>
                        </>
                      ) : null}
                      <div className="flex items-start gap-2">
                        <Navigation className="mt-0.5 size-4 shrink-0" />
                        <dd>{formatDistanceKm(match.distanceKm)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3.5">
                  <p className="text-sm text-muted-foreground">
                    {request
                      ? `${Math.max(0, request.unitsNeeded - request.unitsFulfilled)} of ${pluralise(request.unitsNeeded, "unit")} still needed`
                      : `Invited ${formatRelative(match.invitedAt)}`}
                  </p>

                  {open ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="bg-card"
                        disabled={answer.isPending}
                        onClick={() => {
                          setReason("");
                          setDeclining(match);
                        }}
                      >
                        Decline
                      </Button>
                      <Button
                        disabled={answer.isPending}
                        onClick={() => answer.mutate({ matchId: match.id, answer: "accept" })}
                      >
                        {pending ? (
                          <>
                            <InlineLoader label="Accepting" />
                            Accepting…
                          </>
                        ) : (
                          "Accept"
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <Pager meta={data?.meta ?? null} />
      </div>

      <Dialog open={declining !== null} onOpenChange={(next) => !next && setDeclining(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this invitation?</DialogTitle>
            <DialogDescription>
              The requester will see that you are unavailable and the request stays open for
              other donors. You can add a reason, though it is not required.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional — for example, travelling this week"
            rows={3}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclining(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              disabled={answer.isPending}
              onClick={() => {
                if (!declining) return;
                answer.mutate(
                  {
                    matchId: declining.id,
                    answer: "decline",
                    ...(reason.trim() ? { reason: reason.trim() } : {}),
                  },
                  { onSettled: () => setDeclining(null) },
                );
              }}
            >
              {answer.isPending ? (
                <>
                  <InlineLoader label="Declining" />
                  Declining…
                </>
              ) : (
                "Decline invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
