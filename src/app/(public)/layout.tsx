import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Marketing shell.
 *
 * The session is read here on the server and handed down, so the header can
 * offer a signed-in visitor their dashboard instead of a sign-in button —
 * without the page flashing the wrong state while a client fetch resolves.
 */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <>
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
