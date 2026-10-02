import type { Metadata } from "next";

import { AuthProblem } from "@/components/auth/auth-problem";
import { GoogleExchange } from "@/components/auth/google-exchange";

export const metadata: Metadata = {
  title: "Finishing sign-in",
  robots: { index: false, follow: false },
};

/**
 * Where Google sends the browser back.
 *
 * The code in the query string is single-use and short-lived, and redeeming
 * it has to happen on the server — that is where the session cookies are
 * written. A client component makes that call so the spent code can be
 * dropped from history straight afterwards.
 */
export default async function AuthSuccessPage({ searchParams }: PageProps<"/auth/success">) {
  const params = await searchParams;
  const raw = params.code;
  const code = Array.isArray(raw) ? raw[0] : raw;

  if (!code) {
    return (
      <AuthProblem
        title="No sign-in code arrived"
        description="This page only has something to do when Google sends you here at the end of a sign-in. Opening it directly does nothing."
      />
    );
  }

  return <GoogleExchange code={code} />;
}
