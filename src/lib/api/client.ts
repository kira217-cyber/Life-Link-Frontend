import { ApiError, NetworkError } from "./errors";

import type { ApiResponse, PaginationMeta } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Query values; undefined and empty strings are dropped rather than sent. */
  query?: Record<string, string | number | boolean | undefined | null>;
  token?: string | undefined;
  /** Next.js caching controls — server callers set these, the browser ignores them. */
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
}

/** A page of results plus the envelope's meta block. */
export interface Paged<T> {
  items: T[];
  meta: PaginationMeta | null;
}

export function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * One request to the LifeLink API.
 *
 * Unwraps the success envelope so callers get the payload directly, and turns
 * a failure envelope into an ApiError carrying the status, code and per-field
 * errors — the pieces a form and a toast each need.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, token, cache, revalidate, tags, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : {}),
    ...(signal ? { signal } : {}),
  };

  if (revalidate !== undefined || tags) {
    init.next = {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags ? { tags } : {}),
    };
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }

  // 204 carries no body, so there is nothing to unwrap.
  if (response.status === 204) return undefined as T;

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(response.status, `The server sent a response we could not read (${response.status}).`);
  }

  if (!response.ok || payload.success === false) {
    const failure = payload as Extract<ApiResponse<T>, { success: false }>;
    throw new ApiError(response.status, failure?.message ?? "Request failed", {
      ...(failure?.code ? { code: failure.code } : {}),
      ...(failure?.errors ? { errors: failure.errors } : {}),
      ...(failure?.requestId ? { requestId: failure.requestId } : {}),
    });
  }

  return payload.data;
}

/**
 * Same request, but keeps the pagination meta the list endpoints return
 * alongside the rows — a table needs both.
 */
export async function apiFetchPaged<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paged<T>> {
  const { method = "GET", query, token, cache, revalidate, tags, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method,
    headers,
    ...(cache ? { cache } : {}),
    ...(signal ? { signal } : {}),
  };

  if (revalidate !== undefined || tags) {
    init.next = {
      ...(revalidate !== undefined ? { revalidate } : {}),
      ...(tags ? { tags } : {}),
    };
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), init);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }

  let payload: ApiResponse<T[]>;
  try {
    payload = (await response.json()) as ApiResponse<T[]>;
  } catch {
    throw new ApiError(response.status, `The server sent a response we could not read (${response.status}).`);
  }

  if (!response.ok || payload.success === false) {
    const failure = payload as Extract<ApiResponse<T[]>, { success: false }>;
    throw new ApiError(response.status, failure?.message ?? "Request failed", {
      ...(failure?.code ? { code: failure.code } : {}),
      ...(failure?.errors ? { errors: failure.errors } : {}),
      ...(failure?.requestId ? { requestId: failure.requestId } : {}),
    });
  }

  return { items: payload.data ?? [], meta: payload.meta ?? null };
}
