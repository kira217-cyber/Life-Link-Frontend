import { ApiError, NetworkError } from "./errors";

import type { ApiResponse, PaginationMeta } from "@/types/api";

/**
 * Client-side API calls, routed through the same-origin proxy.
 *
 * Nothing here knows the backend's address or holds a token: it posts to
 * /api/backend/… and the route handler attaches the credential on the server.
 * That is what keeps the access token out of the browser entirely.
 */

const PROXY = "/api/backend";

export interface BrowserRequest {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

export interface BrowserPaged<T> {
  items: T[];
  meta: PaginationMeta | null;
}

function buildPath(path: string, query?: BrowserRequest["query"]): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const suffix = search.toString();
  return `${PROXY}${path.startsWith("/") ? path : `/${path}`}${suffix ? `?${suffix}` : ""}`;
}

async function call<T>(path: string, options: BrowserRequest): Promise<ApiResponse<T>> {
  const { method = "GET", body, query, signal } = options;

  let response: Response;
  try {
    response = await fetch(buildPath(path, query), {
      method,
      ...(body !== undefined
        ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
        : {}),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }

  if (response.status === 204) {
    return { success: true, message: "", data: undefined as T };
  }

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

  return payload;
}

export async function browserFetch<T>(path: string, options: BrowserRequest = {}): Promise<T> {
  const payload = await call<T>(path, options);
  return (payload as Extract<ApiResponse<T>, { success: true }>).data;
}

export async function browserFetchPaged<T>(
  path: string,
  options: BrowserRequest = {},
): Promise<BrowserPaged<T>> {
  const payload = await call<T[]>(path, options);
  const success = payload as Extract<ApiResponse<T[]>, { success: true }>;
  return { items: success.data ?? [], meta: success.meta ?? null };
}
