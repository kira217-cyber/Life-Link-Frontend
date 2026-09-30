import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { Role, SessionUser } from "@/types/api";

/**
 * Route protection, decided before a page renders.
 *
 * Next 16 renamed the `middleware` convention to `proxy`; this is the same
 * hook. It runs on the edge with no access to the app's modules, so the small
 * amount of routing knowledge it needs is repeated here rather than imported —
 * the domain module it would otherwise pull in drags the whole API client
 * behind it.
 *
 * This is the outer gate only. Every dashboard layout checks the role again on
 * the server, and the API enforces it a third time: a cookie can be deleted,
 * but it cannot be forged into a different role.
 */

const ACCESS_COOKIE = "ll_at";
const USER_COOKIE = "ll_user";

const ROLE_HOME: Record<Role, string> = {
  DONOR: "/donor",
  REQUESTER: "/requester",
  ADMIN: "/admin",
};

/**
 * Prefixes restricted to a set of roles.
 *
 * The check has to happen here rather than in the page. Once a layout's shell
 * has been streamed, a `redirect()` inside the page can no longer change the
 * response status — it degrades to a client-side navigation, and the HTML that
 * already went out contains the page a visitor was not meant to see. Deciding
 * before anything renders is the only way to get a real 307.
 */
const ROLE_AREAS: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/donor", roles: ["DONOR"] },
  { prefix: "/requester", roles: ["REQUESTER"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  // The API opens the donor pool to these two only; a donor browsing other
  // donors has no use for it and it would widen the exposure of their details.
  { prefix: "/donors", roles: ["REQUESTER", "ADMIN"] },
];

/** Signed in, any role. */
const SHARED_PROTECTED = ["/requests", "/notifications", "/profile", "/donate"];

/** Pointless to visit once signed in. */
const AUTH_ROUTES = ["/login", "/register"];

function readUser(request: NextRequest): SessionUser | null {
  const raw = request.cookies.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const hasToken = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);
  const user = readUser(request);
  const signedIn = hasToken && user !== null;

  // Already signed in — the login page has nothing to offer.
  if (signedIn && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(ROLE_HOME[user.role], request.url));
  }

  const area = ROLE_AREAS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const needsAuth =
    area !== undefined ||
    SHARED_PROTECTED.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!needsAuth) return NextResponse.next();

  if (!signedIn) {
    // Remember where they were headed so the login can return them to it.
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  // Signed in, wrong door: send them to their own dashboard rather than
  // showing a 403 page for a route they were never meant to see.
  if (area && !area.roles.includes(user.role)) {
    const home = new URL(ROLE_HOME[user.role], request.url);
    home.searchParams.set("denied", area.prefix.replace("/", ""));
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Everything except Next's own assets and the files served from /public.
   * Running on an image request would cost a cookie parse per asset.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
