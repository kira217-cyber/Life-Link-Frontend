import { CalendarClock, Hospital, MapPin } from "lucide-react";
import Link from "next/link";

import { BloodGroupBadge, RequestStatusBadge, UrgencyBadge } from "@/components/shared/badges";
import { formatDate, formatRelative, isPastDue, pluralise } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BloodRequest } from "@/types/api";

/**
 * One blood request, as it appears in every list that shows them.
 *
 * The blood group leads because that is the first thing a donor checks, and
 * urgency sits beside it because that is the second. The hospital and the
 * deadline follow, and how many units are still outstanding is shown as a
 * fraction rather than a bare number — "1 of 3" says more than "1".
 */
export function RequestCard({
  request,
  href,
  action,
  className,
}: {
  request: BloodRequest;
  href?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const remaining = Math.max(0, request.unitsNeeded - request.unitsFulfilled);
  const overdue = isPastDue(request.neededAt);

  const body = (
    <>
      <div className="flex items-start gap-4">
        <BloodGroupBadge value={request.bloodGroup} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge value={request.urgency} />
            <RequestStatusBadge value={request.status} />
          </div>

          <h3 className="mt-2 truncate font-heading text-base font-semibold">
            {request.patientName}
          </h3>

          <dl className="mt-2.5 grid gap-1.5 text-sm text-muted-foreground">
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
              <CalendarClock className={cn("mt-0.5 size-4 shrink-0", overdue && "text-destructive")} />
              <dd className={cn("min-w-0", overdue && "text-destructive")}>
                Needed {formatDate(request.neededAt)}
                <span className="ml-1.5 text-xs">({formatRelative(request.neededAt)})</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3.5">
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{remaining}</span>
          <span className="text-muted-foreground">
            {" "}
            of {pluralise(request.unitsNeeded, "unit")} still needed
          </span>
        </p>
        {action}
      </div>
    </>
  );

  const shell = cn(
    "rounded-2xl border bg-card p-5 transition-colors",
    href && "hover:border-primary/40 hover:bg-accent/30",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(shell, "block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring")}>
        {body}
      </Link>
    );
  }

  return <article className={shell}>{body}</article>;
}
