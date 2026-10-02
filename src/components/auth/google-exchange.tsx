"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AuthProblem } from "@/components/auth/auth-problem";
import { Loader } from "@/components/ui/loader";
import { exchangeGoogleCodeAction } from "@/lib/auth/actions";

/**
 * Trades the one-time code from Google for a real session.
 *
 * The exchange is fired from an effect rather than during render: it writes
 * cookies, it is not safe to run twice, and a ref guards the second call
 * Strict Mode makes in development.
 *
 * On success the browser is *replaced* rather than pushed, so the back button
 * does not return to a URL carrying a code that has already been burned.
 */
export function GoogleExchange({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;
    void (async () => {
      const result = await exchangeGoogleCodeAction(code);
      if (cancelled) return;
      if (result.ok) {
        router.replace(result.redirectTo);
        router.refresh();
      } else {
        setError(result.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, router]);

  if (error) {
    return (
      <AuthProblem
        title="We could not finish signing you in"
        description={error}
        hint="Sign-in codes are single-use and expire quickly, so an old link always lands here. Starting again usually works."
      />
    );
  }

  return (
    <div className="w-full max-w-md text-center">
      <Loader className="mx-auto" />
      <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
        Finishing your sign-in
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Google confirmed who you are. Setting up your session and opening your dashboard.
      </p>
    </div>
  );
}
