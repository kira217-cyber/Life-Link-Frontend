/**
 * Types mirroring the LifeLink backend contract.
 *
 * Every response the API sends is wrapped in the same envelope, so the
 * generics below describe that wrapper once and the rest of the app only ever
 * deals with the unwrapped payload.
 */

export type Role = "DONOR" | "REQUESTER" | "ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE";

export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED";

export type RequestStatus =
  | "PENDING"
  | "VERIFIED"
  | "MATCHING"
  | "FULFILLED"
  | "CANCELLED"
  | "REJECTED"
  | "EXPIRED";

export type Urgency = "NORMAL" | "URGENT" | "CRITICAL";

export type MatchStatus = "INVITED" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";

export type DonationStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";

export type PaymentPurpose = "PLATFORM_DONATION" | "EMERGENCY_FUND";

export type NotificationType =
  | "REQUEST_CREATED"
  | "REQUEST_VERIFIED"
  | "REQUEST_REJECTED"
  | "REQUEST_CANCELLED"
  | "REQUEST_FULFILLED"
  | "MATCH_INVITED"
  | "MATCH_ACCEPTED"
  | "MATCH_DECLINED"
  | "DONATION_COMPLETED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "ACCOUNT_STATUS_CHANGED"
  | "SYSTEM";

// ---------------------------------------------------------------- envelope

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: ApiFieldError[];
  code?: string;
  requestId?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// ---------------------------------------------------------------- entities

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  ageYears: number;
  daysSinceLastDonation: number | null;
  nextEligibleDate: string | null;
}

export interface DonorProfile {
  id: string;
  userId: string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  gender: Gender;
  weightKg: number | null;
  latitude: number | null;
  longitude: number | null;
  district: string;
  city: string;
  address: string | null;
  isAvailable: boolean;
  lastDonationAt: string | null;
  medicalEligibilityConfirmedAt: string | null;
  totalDonations: number;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfileWithEligibility extends DonorProfile {
  eligibility?: EligibilityResult;
}

export interface RequesterProfile {
  id: string;
  userId: string;
  organizationName: string | null;
  organizationType: string | null;
  district: string | null;
  city: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  verifiedNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeResponse extends PublicUser {
  donorProfile: DonorProfile | null;
  requesterProfile: RequesterProfile | null;
}

/** Search results deliberately mask address and phone unless the caller owns them. */
export interface DonorSearchResult {
  donorId: string;
  profileId: string;
  name: string;
  avatarUrl: string | null;
  bloodGroup: BloodGroup;
  district: string;
  city: string;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationAt: string | null;
  distanceKm: number | null;
  phone?: string | null;
  address?: string | null;
  eligibility?: EligibilityResult;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  district: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  neededAt: string;
  urgency: Urgency;
  contactPhone: string;
  reason: string | null;
  status: RequestStatus;
  verifiedById: string | null;
  verifiedAt: string | null;
  rejectedReason: string | null;
  cancelledAt: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: Pick<PublicUser, "id" | "name" | "email" | "phone">;
}

export interface DonorMatch {
  id: string;
  requestId: string;
  donorId: string;
  donorBloodGroup: BloodGroup;
  distanceKm: number | null;
  compatibilityNote: string | null;
  status: MatchStatus;
  invitedAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  request?: BloodRequest;
  donor?: Pick<PublicUser, "id" | "name" | "avatarUrl" | "phone">;
}

export interface Donation {
  id: string;
  matchId: string;
  requestId: string;
  donorId: string;
  donationDate: string;
  units: number;
  status: DonationStatus;
  notes: string | null;
  verifiedById: string | null;
  createdAt: string;
  updatedAt: string;
  request?: Pick<BloodRequest, "id" | "patientName" | "hospitalName" | "bloodGroup">;
}

export interface Payment {
  id: string;
  userId: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  /** Smallest currency unit — divide by 100 before display, never before maths. */
  amount: number;
  currency: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  failureReason: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<PublicUser, "id" | "name" | "email">;
}

export interface CheckoutSession {
  paymentId: string;
  checkoutUrl: string;
  sessionId?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  /** Both are whatever the module chose to record, so neither has a fixed shape. */
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  /** Stored, but the admin listing does not select it. */
  userAgent?: string | null;
  createdAt: string;
  actor?: Pick<PublicUser, "id" | "name" | "email" | "role"> | null;
}

export interface DashboardStats {
  generatedAt: string;
  users: {
    total: number;
    donors: number;
    requesters: number;
    active: number;
    softDeleted: number;
  };
  requests: {
    total: number;
    pending: number;
    verified: number;
    matching: number;
    fulfilled: number;
    rejected: number;
  };
  matches: { total: number; accepted: number; completed: number };
  donations: { total: number; unitsCollected: number };
  payments: { paidCount: number; paidAmount: number; pending: number };
}

export interface HealthReport {
  status: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  dependencies: {
    database: { connected: boolean; latencyMs: number | null };
    redis: { configured: boolean; connected: boolean; latencyMs: number | null; fallback: string | null };
    stripe: { configured: boolean };
    googleOAuth: { configured: boolean };
  };
}

/** The shape stored in the session cookie — never the tokens themselves. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

/** A row in the admin user listing — the API never selects the password hash. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  provider: AuthProvider;
  isActive: boolean;
  emailVerified: boolean;
  deletedAt: string | null;
  createdAt: string;
  donorProfile: {
    bloodGroup: BloodGroup;
    district: string;
    city: string;
    isAvailable: boolean;
  } | null;
  _count: { bloodRequests: number; donations: number; payments: number };
}

/** `/admin/payments` wraps its rows so it can carry the paid totals alongside. */
export interface AdminPaymentsPayload {
  payments: Payment[];
  totals: { paidCount: number; paidAmount: number };
}

/**
 * `/notifications` and `/payments/mine` wrap their rows so they can carry a
 * figure alongside, exactly as `/admin/payments` does. They are listed here so
 * a caller reaches for the envelope helper rather than the bare-array one.
 */
export interface NotificationsPayload {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface MyPaymentsPayload {
  payments: Payment[];
  totals: { paidCount: number; paidAmount: number };
}
