import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/domain";

import type { Role, SessionUser } from "@/types/api";

/** The signed-in user, or a redirect to sign in. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login");
  }
  return user;
}

/**
 * The signed-in user, provided they hold one of these roles.
 *
 * Someone who lands here with the wrong role is sent to their own dashboard
 * rather than shown a refusal — they have not done anything wrong, they are
 * just on a page that was never theirs.
 */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(ROLE_HOME[user.role]);
  }
  return user;
}
