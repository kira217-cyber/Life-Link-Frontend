"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      title="This page could not load"
      description="We could not reach the API for this view. Your session is still fine — trying again usually works."
      error={error}
      reset={reset}
      homeHref="/"
      homeLabel="Back to home"
    />
  );
}
