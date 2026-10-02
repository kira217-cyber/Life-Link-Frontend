import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Crawlers are welcome on the public pages and nowhere else.
 *
 * The disallow list is not a security measure — every one of those routes is
 * already behind a session check in the proxy. It exists so a crawler does
 * not spend its budget collecting redirects to the sign-in page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/donor", "/requester", "/donors", "/requests", "/notifications", "/profile", "/donate", "/payment/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
