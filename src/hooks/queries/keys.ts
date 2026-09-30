/**
 * Query keys in one place.
 *
 * Written as a tree so a mutation can invalidate a whole branch — accepting a
 * match should refresh the invitation list, the request it belongs to and the
 * donation history, and naming those individually at every call site is how
 * one of them ends up stale.
 */
export const queryKeys = {
  matches: {
    all: ["matches"] as const,
    mine: (filters?: Record<string, unknown>) =>
      filters ? (["matches", "mine", filters] as const) : (["matches", "mine"] as const),
  },
  requests: {
    all: ["requests"] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? (["requests", "list", filters] as const) : (["requests", "list"] as const),
    mine: (filters?: Record<string, unknown>) =>
      filters ? (["requests", "mine", filters] as const) : (["requests", "mine"] as const),
    detail: (id: string) => ["requests", "detail", id] as const,
    matches: (id: string) => ["requests", "matches", id] as const,
  },
  donations: {
    all: ["donations"] as const,
    mine: (filters?: Record<string, unknown>) =>
      filters ? (["donations", "mine", filters] as const) : (["donations", "mine"] as const),
  },
  donors: {
    all: ["donors"] as const,
    search: (filters?: Record<string, unknown>) => ["donors", "search", filters ?? {}] as const,
    profile: ["donors", "me", "profile"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filters?: Record<string, unknown>) => ["notifications", "list", filters ?? {}] as const,
  },
  payments: {
    all: ["payments"] as const,
    mine: (filters?: Record<string, unknown>) => ["payments", "mine", filters ?? {}] as const,
  },
  admin: {
    all: ["admin"] as const,
    stats: ["admin", "stats"] as const,
    users: (filters?: Record<string, unknown>) => ["admin", "users", filters ?? {}] as const,
    requests: (filters?: Record<string, unknown>) => ["admin", "requests", filters ?? {}] as const,
    auditLogs: (filters?: Record<string, unknown>) => ["admin", "audit", filters ?? {}] as const,
    payments: (filters?: Record<string, unknown>) => ["admin", "payments", filters ?? {}] as const,
  },
  me: ["me"] as const,
} as const;
