"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError } from "@/lib/api/errors";

/**
 * One QueryClient per browser tab, a fresh one per server render.
 *
 * Sharing a client across server renders would let one visitor's data appear
 * in another's response, so the server never keeps one; the browser makes its
 * own once and holds it in state so a re-render does not throw the cache away.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Long enough that moving between two pages does not refetch what was
        // just shown, short enough that a moderation queue stays honest.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Retrying a 401, 403 or 404 cannot change the answer, and retrying
          // a 422 would just repeat a refusal the domain already made.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
