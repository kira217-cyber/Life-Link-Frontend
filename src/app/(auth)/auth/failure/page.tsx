import type { Metadata } from "next";

import { AuthProblem } from "@/components/auth/auth-problem";

export const metadata: Metadata = {
  title: "Sign-in failed",
  robots: { index: false, follow: false },
};

/**
 * Where the API sends a browser whose Google sign-in did not complete.
 *
 * The reason arrives in the query string and is rendered as text. The one
 * thing not to do with a string that came from a URL is hand it to anything
 * that interprets markup.
 */
export default async function AuthFailurePage({ searchParams }: PageProps<"/auth/failure">) {
  const params = await searchParams;
  const raw = params.reason;
  const reason = Array.isArray(raw) ? raw[0] : raw;

  return (
    <AuthProblem
      title="Google sign-in did not finish"
      description={
        reason ??
        "The sign-in was cancelled, or Google did not confirm the account. Nothing was changed."
      }
    />
  );
}
