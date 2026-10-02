import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DemoLogin } from "@/components/auth/demo-login";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to LifeLink to answer match invitations, post a blood request, or moderate the platform.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to pick up where you left off.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or with your email</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* useSearchParams needs a boundary so the rest of the page can still
            be prerendered. */}
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>

      <DemoLogin />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
