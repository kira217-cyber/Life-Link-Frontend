"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "./keys";

import { browserFetch, browserFetchPaged, browserFetchWithMeta } from "@/lib/api/browser";
import { errorMessage } from "@/lib/api/errors";
import { DEFAULT_PAGE_SIZE } from "@/lib/domain";
import type { AdminPaymentsPayload, AdminUser, AuditLog } from "@/types/api";

export interface AdminUserFilters extends Record<string, unknown> {
  page?: number;
  search?: string;
  role?: string;
  isActive?: string;
}

/** Every account on the platform, filtered by role and status. */
export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () =>
      browserFetchPaged<AdminUser>("/admin/users", {
        query: {
          page: filters.page ?? 1,
          limit: DEFAULT_PAGE_SIZE,
          search: filters.search,
          role: filters.role,
          isActive: filters.isActive,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }),
  });
}

/**
 * Deactivate or reactivate an account.
 *
 * Deactivating is not cosmetic: the API bumps the token version, revokes every
 * refresh token and drops the donor out of matching, so the person is signed
 * out of every device within seconds. The dialog around this says so, because
 * it is not the kind of thing to discover afterwards.
 */
export function useSetUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
      reason,
    }: {
      userId: string;
      isActive: boolean;
      reason?: string;
    }) =>
      browserFetch<AdminUser>(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: { isActive, ...(reason ? { reason } : {}) },
      }),

    onSuccess: async (_data, variables) => {
      toast.success(
        variables.isActive
          ? "Account reactivated. They can sign in again."
          : "Account deactivated and signed out everywhere.",
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },

    onError: (error) => toast.error(errorMessage(error)),
  });
}

export interface AdminPaymentFilters extends Record<string, unknown> {
  page?: number;
  status?: string;
  purpose?: string;
}

/** Every payment, with the paid totals the endpoint computes alongside. */
export function useAdminPayments(filters: AdminPaymentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.payments(filters),
    queryFn: () =>
      browserFetchWithMeta<AdminPaymentsPayload>("/admin/payments", {
        query: {
          page: filters.page ?? 1,
          limit: DEFAULT_PAGE_SIZE,
          status: filters.status,
          purpose: filters.purpose,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }),
  });
}

export interface AuditLogFilters extends Record<string, unknown> {
  page?: number;
  action?: string;
  entityType?: string;
}

/** The append-only trail of everything the platform recorded. */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(filters),
    queryFn: () =>
      browserFetchPaged<AuditLog>("/admin/audit-logs", {
        query: {
          page: filters.page ?? 1,
          limit: 20,
          action: filters.action,
          entityType: filters.entityType,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      }),
  });
}
