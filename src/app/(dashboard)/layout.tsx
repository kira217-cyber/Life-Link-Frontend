import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSessionUser } from "@/lib/auth/session";

/**
 * The second of three gates.
 *
 * `proxy.ts` already turned anonymous visitors away, but the proxy only reads
 * a cookie — it cannot be the only thing standing between a URL and someone
 * else's data. This layout re-checks on the server, and every API call behind
 * it is authorised again upstream.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
