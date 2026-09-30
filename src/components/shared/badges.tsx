import {
  BLOOD_GROUP_LABEL,
  MATCH_STATUS_CLASS,
  MATCH_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
  REQUEST_STATUS_CLASS,
  REQUEST_STATUS_LABEL,
  URGENCY_CLASS,
  URGENCY_LABEL,
} from "@/lib/domain";
import { cn } from "@/lib/utils";
import type {
  BloodGroup,
  MatchStatus,
  PaymentStatus,
  RequestStatus,
  Urgency,
} from "@/types/api";

/**
 * State reads as colour before it reads as words, so each badge pairs the two.
 * Every mapping comes from the domain module rather than being written here,
 * which is what stops the same status looking different on two pages.
 */

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

export function UrgencyBadge({ value, className }: { value: Urgency; className?: string }) {
  return (
    <span className={cn(base, URGENCY_CLASS[value], className)}>
      {/* Critical gets a dot as well as a colour — colour alone is not a
          signal everyone can read. */}
      {value === "CRITICAL" ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {URGENCY_LABEL[value]}
    </span>
  );
}

export function RequestStatusBadge({
  value,
  className,
}: {
  value: RequestStatus;
  className?: string;
}) {
  return <span className={cn(base, REQUEST_STATUS_CLASS[value], className)}>{REQUEST_STATUS_LABEL[value]}</span>;
}

export function MatchStatusBadge({ value, className }: { value: MatchStatus; className?: string }) {
  return <span className={cn(base, MATCH_STATUS_CLASS[value], className)}>{MATCH_STATUS_LABEL[value]}</span>;
}

export function PaymentStatusBadge({
  value,
  className,
}: {
  value: PaymentStatus;
  className?: string;
}) {
  return <span className={cn(base, PAYMENT_STATUS_CLASS[value], className)}>{PAYMENT_STATUS_LABEL[value]}</span>;
}

/** The blood group, set in mono so a column of them lines up. */
export function BloodGroupBadge({
  value,
  className,
  size = "md",
}: {
  value: BloodGroup;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
  } as const;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-primary/10 font-mono font-bold text-primary",
        sizes[size],
        className,
      )}
      aria-label={`Blood group ${BLOOD_GROUP_LABEL[value]}`}
    >
      {BLOOD_GROUP_LABEL[value]}
    </span>
  );
}
