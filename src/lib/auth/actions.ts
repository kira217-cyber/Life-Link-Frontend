"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { clearSession, getAccessToken, getRefreshToken, writeSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/domain";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

import type { AuthPayload, Role } from "@/types/api";

/** What every auth action hands back to the form that called it. */
export type AuthActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function failure(error: unknown): AuthActionResult {
  if (error instanceof ApiError) {
    return {
      ok: false,
      message: error.message,
      ...(error.fieldErrors.length ? { fieldErrors: error.toFormErrors() } : {}),
    };
  }
  return { ok: false, message: errorMessage(error) };
}

/** Where to send someone after signing in — their own dashboard. */
function homeFor(role: Role, requested?: string | null): string {
  const fallback = ROLE_HOME[role];
  if (!requested || !requested.startsWith("/") || requested.startsWith("//")) return fallback;
  // Only honour a return path this role is actually allowed to enter.
  const owner = Object.entries(ROLE_HOME).find(([, home]) => requested.startsWith(home));
  if (owner && owner[0] !== role) return fallback;
  return requested;
}

export async function loginAction(
  values: unknown,
  returnTo?: string | null,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields and try again." };
  }

  try {
    const result = await apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: parsed.data,
      cache: "no-store",
    });
    await writeSession(result.user, result.tokens);
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: homeFor(result.user.role, returnTo) };
  } catch (error) {
    return failure(error);
  }
}

export async function registerAction(values: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Check the highlighted fields and try again." };
  }

  // confirmPassword only exists to compare the two inputs; the API neither
  // expects nor accepts it.
  const { name, email, password, role, phone } = parsed.data;

  try {
    const result = await apiFetch<AuthPayload>("/auth/register", {
      method: "POST",
      body: { name, email, password, role, ...(phone ? { phone } : {}) },
      cache: "no-store",
    });
    await writeSession(result.user, result.tokens);
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: ROLE_HOME[result.user.role] };
  } catch (error) {
    return failure(error);
  }
}

/**
 * One-click sign-in for the three demo accounts.
 *
 * The credentials come from server-only environment variables, so they are
 * never part of the client bundle — the button posts a role name, and the
 * server decides which account that means.
 */
const DEMO_ENV: Record<Role, { email: string | undefined; password: string | undefined }> = {
  ADMIN: { email: process.env.DEMO_ADMIN_EMAIL, password: process.env.DEMO_ADMIN_PASSWORD },
  DONOR: { email: process.env.DEMO_DONOR_EMAIL, password: process.env.DEMO_DONOR_PASSWORD },
  REQUESTER: {
    email: process.env.DEMO_REQUESTER_EMAIL,
    password: process.env.DEMO_REQUESTER_PASSWORD,
  },
};

export async function demoLoginAction(role: Role): Promise<AuthActionResult> {
  const account = DEMO_ENV[role];
  if (!account?.email || !account.password) {
    return {
      ok: false,
      message: `The ${role.toLowerCase()} demo account is not configured on this deployment.`,
    };
  }

  try {
    const result = await apiFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: { email: account.email, password: account.password },
      cache: "no-store",
    });
    await writeSession(result.user, result.tokens);
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: ROLE_HOME[result.user.role] };
  } catch (error) {
    return failure(error);
  }
}

/**
 * Signs out everywhere rather than only here.
 *
 * `allDevices` bumps the token version upstream, which kills the access token
 * immediately instead of leaving it usable for the rest of its 15 minutes.
 */
export async function logoutAction(): Promise<void> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (accessToken) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        token: accessToken,
        body: refreshToken ? { refreshToken, allDevices: true } : { allDevices: true },
        cache: "no-store",
      });
    } catch {
      // The session is being thrown away regardless; a failure upstream must
      // not strand the user on a page they can no longer use.
    }
  }

  await clearSession();
  revalidatePath("/", "layout");
  redirect("/login");
}
