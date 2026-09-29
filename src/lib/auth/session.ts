import "server-only";

import { cookies } from "next/headers";

import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import type { AuthTokens, PublicUser, SessionUser } from "@/types/api";

/**
 * The session lives entirely in httpOnly cookies.
 *
 * Nothing here is readable from client JavaScript: a stolen XSS payload cannot
 * lift the access token, because the browser never hands it to script. Client
 * components that need data go through route handlers, which read the cookie
 * on the server and forward the call.
 */

const ACCESS_COOKIE = "ll_at";
const REFRESH_COOKIE = "ll_rt";
const USER_COOKIE = "ll_user";

/** Access tokens last 15 minutes upstream; the cookie is given the same life. */
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

const secure = process.env.NODE_ENV === "production";

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
};

/** The subset of the user we keep in a cookie — never tokens, never email hashes. */
function toSessionUser(user: PublicUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

export async function writeSession(user: PublicUser, tokens: AuthTokens): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
  // Readable by the server on every render so layouts can greet the user
  // without a round trip; still httpOnly, so script cannot forge a role.
  jar.set(USER_COOKIE, JSON.stringify(toSessionUser(user)), {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE]) {
    jar.delete(name);
  }
}

export async function getAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}

/** The signed-in user, or null. Cheap — reads a cookie, makes no request. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Trades the refresh token for a new pair.
 *
 * The backend rotates on every use and revokes the whole family if an already
 * used token comes back, so a failure here means the session is genuinely over
 * — not worth retrying.
 */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const result = await apiFetch<{ user: PublicUser; tokens: AuthTokens }>("/auth/refresh-token", {
      method: "POST",
      body: { refreshToken },
      cache: "no-store",
    });
    await writeSession(result.user, result.tokens);
    return result.tokens.accessToken;
  } catch (error) {
    if (error instanceof ApiError) await clearSession();
    return null;
  }
}

export const SESSION_COOKIES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE,
  user: USER_COOKIE,
} as const;
