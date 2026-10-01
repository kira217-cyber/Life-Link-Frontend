import type {
  BloodGroup,
  MatchStatus,
  PaymentPurpose,
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

export const PAYMENT_STATUSES = Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[];

export const PAYMENT_PURPOSE_LABEL: Record<PaymentPurpose, string> = {
  PLATFORM_DONATION: "Keep LifeLink running",
  EMERGENCY_FUND: "Emergency assistance fund",
};

export const PAYMENT_PURPOSES = Object.keys(PAYMENT_PURPOSE_LABEL) as PaymentPurpose[];

// ------------------------------------------------------------- audit trail

/**
 * Every action the backend writes to the audit log, grouped so the admin
 * filter reads as a list of things that happened rather than a list of enum
 * members. Anything the backend adds later still renders — the table falls
 * back to the raw name rather than hiding the row.
 */
export const AUDIT_ACTION_LABEL: Record<string, string> = {
  USER_REGISTERED: "User registered",
  USER_LOGGED_IN: "User signed in",
  USER_LOGGED_OUT: "User signed out",
  USER_UPDATED: "Account updated",
  USER_SOFT_DELETED: "Account deleted",
  USER_STATUS_CHANGED: "Account status changed",
  DONOR_PROFILE_UPSERTED: "Donor profile saved",
  DONOR_AVAILABILITY_CHANGED: "Donor availability changed",
  REQUEST_CREATED: "Request created",
  REQUEST_UPDATED: "Request updated",
  REQUEST_DELETED: "Request deleted",
  REQUEST_VERIFIED: "Request verified",
  REQUEST_REJECTED: "Request rejected",
  REQUEST_CANCELLED: "Request cancelled",
  REQUEST_FULFILLED: "Request fulfilled",
  MATCHES_GENERATED: "Donors invited",
  MATCH_ACCEPTED: "Invitation accepted",
  MATCH_DECLINED: "Invitation declined",
  MATCH_COMPLETED: "Invitation completed",
  DONATION_COMPLETED: "Donation recorded",
  PAYMENT_INITIATED: "Payment started",
  PAYMENT_SUCCEEDED: "Payment succeeded",
  PAYMENT_FAILED: "Payment failed",
  PAYMENT_CANCELLED: "Payment cancelled",
  PAYMENT_REFUNDED: "Payment refunded",
  WEBHOOK_PROCESSED: "Stripe webhook processed",
};

export const AUDIT_ACTIONS = Object.keys(AUDIT_ACTION_LABEL);

/** Colour by what the action did, not by which module raised it. */
export const AUDIT_ACTION_TONE: Record<string, string> = {
  USER_STATUS_CHANGED: "bg-warning-soft text-warning",
  USER_SOFT_DELETED: "bg-urgency-critical-soft text-urgency-critical",
  REQUEST_REJECTED: "bg-urgency-critical-soft text-urgency-critical",
  REQUEST_CANCELLED: "bg-muted text-muted-foreground",
  REQUEST_VERIFIED: "bg-success-soft text-success",
  REQUEST_FULFILLED: "bg-success-soft text-success",
  MATCH_COMPLETED: "bg-success-soft text-success",
  DONATION_COMPLETED: "bg-success-soft text-success",
  PAYMENT_SUCCEEDED: "bg-success-soft text-success",
  PAYMENT_FAILED: "bg-urgency-critical-soft text-urgency-critical",
  PAYMENT_REFUNDED: "bg-info-soft text-info",
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
