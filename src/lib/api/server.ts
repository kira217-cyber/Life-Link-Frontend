import "server-only";

import { apiFetch, apiFetchPaged, type Paged, type RequestOptions } from "./client";
import { ApiError } from "./errors";

import { getAccessToken, refreshSession } from "@/lib/auth/session";

/**
 * Server-side API calls, authenticated from the session cookie.
 *
 * These run in Server Components, route handlers and server actions — never in
 * the browser — which is why the access token can be attached here without
 * ever being exposed to client script. It also means no CORS: the request
 * leaves a server, not a page.
 *
 * On a 401 the access token is refreshed once and the call retried. Once,
 * deliberately: the backend rotates refresh tokens and revokes the family if a
 * spent one is replayed, so a second attempt would do harm rather than help.
 */
async function withAuth<T>(
  run: (token: string | undefined) => Promise<T>,
  { retryOnExpiry = true }: { retryOnExpiry?: boolean } = {},
): Promise<T> {
  const token = (await getAccessToken()) ?? undefined;

  try {
    return await run(token);
  } catch (error) {
    if (!retryOnExpiry || !(error instanceof ApiError) || !error.isUnauthorized) throw error;

    const refreshed = await refreshSession();
    if (!refreshed) throw error;

    return run(refreshed);
  }
}

export function serverFetch<T>(path: string, options: Omit<RequestOptions, "token"> = {}) {
  return withAuth<T>((token) =>
    apiFetch<T>(path, { ...options, token, cache: options.cache ?? "no-store" }),
  );
}

export function serverFetchPaged<T>(path: string, options: Omit<RequestOptions, "token"> = {}) {
  return withAuth<Paged<T>>((token) =>
    apiFetchPaged<T>(path, { ...options, token, cache: options.cache ?? "no-store" }),
  );
}

/**
 * For places that would rather render an empty state than an error boundary —
 * a sidebar badge, a dashboard tile. Genuine faults still propagate; only an
 * expired or absent session resolves to the fallback.
 */
export async function serverFetchOrNull<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {},
): Promise<T | null> {
  try {
    return await serverFetch<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && (error.isUnauthorized || error.isNotFound)) return null;
    throw error;
  }
}
