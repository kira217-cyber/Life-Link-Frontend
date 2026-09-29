import type { ApiFieldError } from "@/types/api";

/**
 * Everything the API rejects arrives in the same envelope, so it is worth
 * carrying that shape through rather than collapsing it into a string: forms
 * need the per-field errors, toasts need the message, and the request id is
 * what makes a bug report traceable.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldErrors: ApiFieldError[];
  readonly requestId: string | undefined;

  constructor(
    status: number,
    message: string,
    options: { code?: string; errors?: ApiFieldError[]; requestId?: string } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code;
    this.fieldErrors = options.errors ?? [];
    this.requestId = options.requestId;
  }

  /** The caller is not signed in, or the session was revoked. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Signed in, but this role may not do it. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Well-formed request the domain refuses — a disallowed state change. */
  get isConflict(): boolean {
    return this.status === 409 || this.status === 422;
  }

  /** Maps field errors onto the shape react-hook-form's setError expects. */
  toFormErrors(): Record<string, string> {
    return Object.fromEntries(
      this.fieldErrors.map((error) => [error.path, error.message]),
    );
  }
}

/** The network never reached the API — offline, DNS, timeout. */
export class NetworkError extends Error {
  constructor(message = "Could not reach the server. Check your connection and try again.") {
    super(message);
    this.name = "NetworkError";
  }
}

/** A message safe to show a user, whatever was thrown. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof NetworkError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
