"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "./keys";

import { browserFetch, browserFetchPaged } from "@/lib/api/browser";
import { errorMessage } from "@/lib/api/errors";
import { DEFAULT_PAGE_SIZE } from "@/lib/domain";
import type { AppNotification } from "@/types/api";

export function useNotifications(filters: { page?: number; unreadOnly?: boolean } = {}) {
  const { page = 1, unreadOnly = false } = filters;

  return useQuery({
    queryKey: queryKeys.notifications.list({ page, unreadOnly }),
    queryFn: () =>
      browserFetchPaged<AppNotification>("/notifications", {
        query: { page, limit: DEFAULT_PAGE_SIZE, unreadOnly: unreadOnly ? "true" : "false" },
      }),
  });
}

/**
 * Marking one read is the rare case where optimism is right: the change is
 * cosmetic, the server almost never refuses it, and waiting a round trip to
 * un-bold a line makes the list feel broken. The cache is rolled back if the
 * call does fail.
 */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      browserFetch<AppNotification>(`/notifications/${id}/read`, { method: "PATCH" }),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.notifications.all });

      queryClient.setQueriesData<{ items: AppNotification[] } | undefined>(
        { queryKey: queryKeys.notifications.all },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((item) =>
                  item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
                ),
              }
            : old,
      );

      return { previous };
    },

    onError: (error, _id, context) => {
      for (const [key, value] of context?.previous ?? []) {
        queryClient.setQueryData(key, value);
      }
      toast.error(errorMessage(error));
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => browserFetch<unknown>("/notifications/read-all", { method: "PATCH" }),
    onSuccess: async () => {
      toast.success("All notifications marked as read.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
