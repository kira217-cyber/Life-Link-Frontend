"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "./keys";

import { browserFetch, browserFetchPaged } from "@/lib/api/browser";
import { errorMessage } from "@/lib/api/errors";
import { DEFAULT_PAGE_SIZE } from "@/lib/domain";
import type { DonorMatch } from "@/types/api";

interface MineFilters {
  page?: number;
  activeOnly?: boolean;
}

/** The donor's own invitations. */
export function useMyMatches(filters: MineFilters = {}) {
  const { page = 1, activeOnly } = filters;

  return useQuery({
    queryKey: queryKeys.matches.mine({ page, activeOnly }),
    queryFn: () =>
      browserFetchPaged<DonorMatch>("/matches/mine", {
        query: {
          page,
          limit: DEFAULT_PAGE_SIZE,
          ...(activeOnly ? { activeOnly: "true" } : {}),
        },
      }),
  });
}

/**
 * Accept or decline an invitation.
 *
 * The answer changes the invitation list, the request behind it and — once
 * accepted — what the donor is eligible for next, so the whole matches branch
 * is invalidated rather than one key patched. Optimism would be misplaced
 * here: the backend can refuse an accept that a race has already filled, and
 * showing "accepted" before it agrees would be a lie the user acts on.
 */
export function useAnswerMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      answer,
      reason,
    }: {
      matchId: string;
      answer: "accept" | "decline";
      reason?: string;
    }) =>
      browserFetch<DonorMatch>(`/matches/${matchId}/${answer}`, {
        method: "POST",
        body: answer === "decline" && reason ? { reason } : {},
      }),

    onSuccess: async (_data, variables) => {
      toast.success(
        variables.answer === "accept"
          ? "Invitation accepted. The requester has been notified."
          : "Invitation declined.",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
      ]);
    },

    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}
