"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      title="Sign-in is unavailable"
      description="We could not reach the sign-in service. Please try again in a moment."
      error={error}
      reset={reset}
    />
  );
}
