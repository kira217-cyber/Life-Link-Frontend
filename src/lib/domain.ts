import type {
  BloodGroup,
  MatchStatus,
  PaymentStatus,
  RequestStatus,
  Role,
  Urgency,
} from "@/types/api";

/**
 * Domain vocabulary in one place: the API speaks in enum constants, the UI has
 * to speak in labels a person recognises, and several places need the same
 * colour for the same state. Keeping the mapping here is what stops a status
 * badge drifting between two pages.
 */

// ------------------------------------------------------------- blood groups

export const BLOOD_GROUP_LABEL: Record<BloodGroup, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A−",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B−",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB−",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O−",
};

export const BLOOD_GROUPS = Object.keys(BLOOD_GROUP_LABEL) as BloodGroup[];

/**
 * Which donor groups a recipient of each group can receive red cells from.
 *
 * Written as an explicit table rather than derived from antigen rules — the
 * backend does the same, and this is the one mapping where a clever derivation
 * going wrong would be dangerous rather than merely buggy.
 *
 * Educational project logic, not medical advice.
 */
export const COMPATIBLE_DONORS: Record<BloodGroup, BloodGroup[]> = {
  O_NEGATIVE: ["O_NEGATIVE"],
  O_POSITIVE: ["O_NEGATIVE", "O_POSITIVE"],
  A_NEGATIVE: ["O_NEGATIVE", "A_NEGATIVE"],
  A_POSITIVE: ["O_NEGATIVE", "O_POSITIVE", "A_NEGATIVE", "A_POSITIVE"],
  B_NEGATIVE: ["O_NEGATIVE", "B_NEGATIVE"],
  B_POSITIVE: ["O_NEGATIVE", "O_POSITIVE", "B_NEGATIVE", "B_POSITIVE"],
  AB_NEGATIVE: ["O_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "AB_NEGATIVE"],
  AB_POSITIVE: [
    "O_NEGATIVE",
    "O_POSITIVE",
    "A_NEGATIVE",
    "A_POSITIVE",
    "B_NEGATIVE",
    "B_POSITIVE",
    "AB_NEGATIVE",
    "AB_POSITIVE",
  ],
};

export function canDonateTo(donor: BloodGroup): BloodGroup[] {
  return BLOOD_GROUPS.filter((recipient) => COMPATIBLE_DONORS[recipient].includes(donor));
}

// -------------------------------------------------------------------- roles

export const ROLE_LABEL: Record<Role, string> = {
  DONOR: "Donor",
  REQUESTER: "Requester",
  ADMIN: "Admin",
};

/** Where each role belongs after signing in. */
export const ROLE_HOME: Record<Role, string> = {
  DONOR: "/donor",
  REQUESTER: "/requester",
  ADMIN: "/admin",
};

/** Route prefixes only one role may enter — enforced again in middleware. */
export const ROLE_ROUTE_PREFIX: Record<Role, string> = {
  DONOR: "/donor",
  REQUESTER: "/requester",
  ADMIN: "/admin",
};

// ----------------------------------------------------------------- urgency

export const URGENCY_LABEL: Record<Urgency, string> = {
  NORMAL: "Normal",
  URGENT: "Urgent",
  CRITICAL: "Critical",
};

/**
 * Urgency reads as colour before it reads as text, so each level gets a
 * foreground/background pair from the semantic tokens rather than the accent.
 */
export const URGENCY_CLASS: Record<Urgency, string> = {
  NORMAL: "bg-urgency-normal-soft text-urgency-normal",
  URGENT: "bg-urgency-urgent-soft text-urgency-urgent",
  CRITICAL: "bg-urgency-critical-soft text-urgency-critical",
};

export const URGENCY_OPTIONS = (Object.keys(URGENCY_LABEL) as Urgency[]).map((value) => ({
  value,
  label: URGENCY_LABEL[value],
}));

// ------------------------------------------------------------ request state

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: "Awaiting review",
  VERIFIED: "Verified",
  MATCHING: "Matching donors",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const REQUEST_STATUS_CLASS: Record<RequestStatus, string> = {
  PENDING: "bg-warning-soft text-warning",
  VERIFIED: "bg-info-soft text-info",
  MATCHING: "bg-accent text-accent-foreground",
  FULFILLED: "bg-success-soft text-success",
  CANCELLED: "bg-muted text-muted-foreground",
  REJECTED: "bg-urgency-critical-soft text-urgency-critical",
  EXPIRED: "bg-muted text-muted-foreground",
};

export const REQUEST_STATUSES = Object.keys(REQUEST_STATUS_LABEL) as RequestStatus[];

/** States the owner may still edit — mirrors the backend state machine. */
export const EDITABLE_REQUEST_STATUSES: RequestStatus[] = ["PENDING", "VERIFIED"];

/** States a request can still be cancelled from. */
export const CANCELLABLE_REQUEST_STATUSES: RequestStatus[] = [
  "PENDING",
  "VERIFIED",
  "MATCHING",
];

// -------------------------------------------------------------- match state

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  INVITED: "Invited",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const MATCH_STATUS_CLASS: Record<MatchStatus, string> = {
  INVITED: "bg-info-soft text-info",
  ACCEPTED: "bg-accent text-accent-foreground",
  DECLINED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-success-soft text-success",
  CANCELLED: "bg-muted text-muted-foreground",
};

// ------------------------------------------------------------ payment state

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  PENDING: "bg-warning-soft text-warning",
  PAID: "bg-success-soft text-success",
  FAILED: "bg-urgency-critical-soft text-urgency-critical",
  CANCELLED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-info-soft text-info",
};

// ------------------------------------------------------------------ policy

/** Mirrors the backend eligibility policy, for client-side hints only. */
export const DONOR_ELIGIBILITY = {
  MIN_AGE_YEARS: 18,
  MAX_AGE_YEARS: 65,
  MIN_DAYS_SINCE_LAST_DONATION: 90,
  MIN_WEIGHT_KG: 45,
} as const;

/** Amounts are held in the smallest currency unit, as the backend does. */
export const PAYMENT_LIMITS = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 500_000,
} as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;
