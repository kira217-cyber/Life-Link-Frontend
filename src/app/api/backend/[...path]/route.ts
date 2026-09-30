import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAccessToken, refreshSession } from "@/lib/auth/session";

/**
 * A thin same-origin proxy to the LifeLink API.
 *
 * Client components fetch through here rather than calling the backend
 * directly, which buys three things at once:
 *
 *   - the access token stays in an httpOnly cookie and is attached on the
 *     server, so no token ever reaches browser JavaScript;
 *   - the request is same-origin, so CORS never enters into it;
 *   - an expired token can be refreshed and the call retried once, without
 *     every caller having to know that.
 *
 * The response body is passed through untouched — TanStack Query on the other
 * side wants the API's own envelope, not a second one wrapped around it.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** Hop-by-hop and body-framing headers must not be copied onto a new request. */
const STRIPPED = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding",
  "cookie",
]);

function targetUrl(request: NextRequest, path: string[]): string {
  const url = new URL(`${BASE_URL}/${path.join("/")}`);
  url.search = request.nextUrl.search;
  return url.toString();
}

async function forward(request: NextRequest, path: string[]): Promise<Response> {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED.has(key.toLowerCase())) headers.set(key, value);
  });

  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  const send = async (token: string | null) => {
    if (token) headers.set("authorization", `Bearer ${token}`);
    else headers.delete("authorization");

    return fetch(targetUrl(request, path), {
      method: request.method,
      headers,
      ...(body ? { body } : {}),
      cache: "no-store",
    });
  };

  let upstream = await send(await getAccessToken());

  // One retry, and only on an expired token. The backend rotates refresh
  // tokens and revokes the family if a spent one is replayed, so a second
  // attempt would end the session rather than rescue it.
  if (upstream.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) upstream = await send(refreshed);
  }

  const payload = await upstream.text();

  return new NextResponse(payload, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  return forward(request, path);
}
