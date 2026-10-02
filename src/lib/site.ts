/**
 * The site's own identity, in one place.
 *
 * The origin is read from the environment rather than hard-coded because it
 * differs across the three places this runs: localhost while developing, a
 * preview URL on every pull request, and the production domain. Metadata,
 * robots and the sitemap all have to agree on it, and three separate
 * `process.env` reads is how they stop agreeing.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "LifeLink";

export const SITE_TAGLINE = "Blood Donation & Emergency Assistance";

export const SITE_DESCRIPTION =
  "LifeLink connects verified blood requests with compatible, eligible donors nearby — and keeps an emergency assistance fund running behind them.";

/**
 * Pages worth indexing.
 *
 * Everything behind a sign-in is left out on purpose: a crawler cannot reach
 * it, and listing it would only publish the shape of the private area.
 */
export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/eligibility", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/login", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/register", priority: 0.6, changeFrequency: "yearly" as const },
];
