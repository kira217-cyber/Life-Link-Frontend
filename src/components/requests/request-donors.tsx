"use client";

import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";

import { MatchStatusBadge } from "@/components/shared/badges";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineLoader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCompleteMatch, useRequestMatches } from "@/hooks/queries/use-requests";
import { BLOOD_GROUP_LABEL } from "@/lib/domain";
import { formatDistanceKm, formatRelative, maskPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest, DonorMatch } from "@/types/api";

/**
 * Who was invited to one request, and the button that closes the loop.
 *
 * Without this the requester could invite donors and then never see what
 * happened — the workflow had a step the browser could not reach, so a
 * donation could only ever be recorded by calling the API directly.
 *
 * Recording it belongs to the requester rather than the donor: the requester
 * is the one who saw the person at the hospital. A donor confirming their own
 * donation would leave nobody to check it.
 *
 * The list is fetched only once opened, so a page of ten requests does not
 * fire ten extra calls nobody asked for.
 */
export function RequestDonors({ request }: { request: BloodRequest }) {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState<DonorMatch | null>(null);
  const [units, setUnits] = useState("1");
  const [notes, setNotes] = useState("");

  const { data, isPending, isError } = useRequestMatches(open ? request.id : "", 1);
  const complete = useCompleteMatch();

  const remaining = Math.max(0, request.unitsNeeded - request.unitsFulfilled);
  const matches = data?.items ?? [];

  return (
    <div className="mt-3 border-t pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Users className="size-4" />
        Donors invited
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="mt-3">
          {isPending ? (
            <div className="grid gap-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              Could not load the donor list. Close and open it again to retry.
            </p>
          ) : matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nobody has been invited yet. Use <span className="font-medium">Invite donors</span> and
              LifeLink will contact every compatible donor who is eligible today.
            </p>
          ) : (
            <ul className="grid gap-2">
              {matches.map((match) => {
                const busy = complete.isPending && complete.variables?.matchId === match.id;
                const canRecord = match.status === "ACCEPTED" && remaining > 0;

                return (
                  <li
                    key={match.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3"
                  >
                    <UserAvatar
                      name={match.donor?.name ?? "Donor"}
                      src={match.donor?.avatarUrl}
                      size={32}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {match.donor?.name ?? "Donor"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {BLOOD_GROUP_LABEL[match.donorBloodGroup]}
                        {match.distanceKm !== null
                          ? ` · ${formatDistanceKm(match.distanceKm)} away`
                          : ""}
                        {` · invited ${formatRelative(match.invitedAt)}`}
                      </p>
                      {/* The phone only comes back once a donor has accepted;
                          before that the API withholds it. */}
                      {match.status === "ACCEPTED" && match.donor?.phone ? (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {maskPhone(match.donor.phone)}
                        </p>
                      ) : null}
                    </div>

                    <MatchStatusBadge value={match.status} />

                    {canRecord ? (
                      <Button
                        size="sm"
                        disabled={complete.isPending}
                        onClick={() => {
                          setUnits(String(Math.min(remaining, 1)));
                          setNotes("");
                          setRecording(match);
                        }}
                      >
                        {busy ? <InlineLoader label="Recording" /> : null}
                        Record donation
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      <Dialog open={recording !== null} onOpenChange={(next) => !next && setRecording(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record this donation</DialogTitle>
            <DialogDescription>
              Only do this once {recording?.donor?.name ?? "the donor"} has actually given blood at{" "}
              {request.hospitalName}. It starts their 90-day cooldown, so recording it early takes a
              donor out of matching for three months for nothing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="units">Units given</Label>
              <Input
                id="units"
                type="number"
                min={1}
                max={Math.max(1, remaining)}
                value={units}
                onChange={(event) => setUnits(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {remaining} of {request.unitsNeeded} still needed.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">
                Note <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Collected in the morning session"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRecording(null)}>
              Not yet
            </Button>
            <Button
              disabled={complete.isPending || Number(units) < 1}
              onClick={() => {
                if (!recording) return;
                complete.mutate(
                  {
                    matchId: recording.id,
                    units: Number(units),
                    ...(notes.trim() ? { notes: notes.trim() } : {}),
                  },
                  { onSettled: () => setRecording(null) },
                );
              }}
            >
              {complete.isPending ? (
                <>
                  <InlineLoader label="Recording" />
                  Recording…
                </>
              ) : (
                "Record donation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
