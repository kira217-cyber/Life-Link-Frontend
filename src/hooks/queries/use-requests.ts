"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "./keys";

import { browserFetch, browserFetchPaged } from "@/lib/api/browser";
import { errorMessage } from "@/lib/api/errors";
import { DEFAULT_PAGE_SIZE } from "@/lib/domain";
import type { BloodRequest, DonorMatch } from "@/types/api";

export interface RequestFilters extends Record<string, unknown> {
  page?: number;
  search?: string;
  status?: string;
  bloodGroup?: string;
  urgency?: string;
  city?: string;
}

function toQuery(filters: RequestFilters) {
  return {
    page: filters.page ?? 1,
    limit: DEFAULT_PAGE_SIZE,
    search: filters.search,
    status: filters.status,
    bloodGroup: filters.bloodGroup,
    urgency: filters.urgency,
    city: filters.city,
    sortBy: "createdAt",
    sortOrder: "desc",
  };
}

/** Every request, for the admin moderation queue. */
export function useAdminRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.requests(filters),
    queryFn: () =>
      browserFetchPaged<BloodRequest>("/admin/blood-requests", { query: toQuery(filters) }),
  });
}

/** The signed-in requester's own requests. */
export function useMyRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: queryKeys.requests.mine(filters),
    queryFn: () => browserFetchPaged<BloodRequest>("/blood-requests/mine", { query: toQuery(filters) }),
  });
}

/** The donors invited to one request. */
export function useRequestMatches(requestId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.requests.matches(`${requestId}:${page}`),
    queryFn: () =>
      browserFetchPaged<DonorMatch>(`/blood-requests/${requestId}/matches`, {
        query: { page, limit: DEFAULT_PAGE_SIZE },
      }),
    enabled: Boolean(requestId),
  });
}

/**
 * Verify or reject a pending request.
 *
 * Both are the moment a request becomes visible to donors — or never does — so
 * the whole request branch is invalidated rather than one row patched. A
 * rejection carries its reason: the requester sees it, and "rejected" with no
 * explanation is the kind of dead end that generates a support message.
 */
export function useModerateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      decision,
      note,
    }: {
      requestId: string;
      decision: "verify" | "reject";
      note?: string;
    }) =>
      browserFetch<BloodRequest>(`/admin/blood-requests/${requestId}/${decision}`, {
        method: "POST",
        body: decision === "reject" ? { reason: note ?? "Could not be confirmed" } : { note },
      }),

    onSuccess: async (_data, variables) => {
      toast.success(
        variables.decision === "verify"
          ? "Request verified. Donors can be matched to it now."
          : "Request rejected. The requester has been told why.",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
      ]);
    },

    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** Generate donor matches for a verified request. */
export function useFindMatches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) =>
      browserFetch<unknown>(`/blood-requests/${requestId}/find-matches`, {
        method: "POST",
        body: {},
      }),

    onSuccess: async () => {
      toast.success("Compatible donors have been invited.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
      ]);
    },

    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** Cancel one's own request. */
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) =>
      browserFetch<BloodRequest>(`/blood-requests/${requestId}/cancel`, {
        method: "POST",
        body: reason ? { reason } : {},
      }),

    onSuccess: async () => {
      toast.success("Request cancelled.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },

    onError: (error) => toast.error(errorMessage(error)),
  });
}

/**
 * Records a donation that actually happened.
 *
 * The last step of the whole workflow, and deliberately not the donor's to
 * take: a donor confirming their own donation would leave nobody to check it.
 * The requester saw the person at the hospital, so the requester confirms.
 */
export function useCompleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, units, notes }: { matchId: string; units: number; notes?: string }) =>
      browserFetch<unknown>(`/matches/${matchId}/complete`, {
        method: "POST",
        body: { units, ...(notes ? { notes } : {}) },
      }),

    onSuccess: async () => {
      toast.success("Donation recorded. The request moves on once every unit is in.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.requests.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.donations.all }),
      ]);
    },

    onError: (error) => toast.error(errorMessage(error)),
  });
}
