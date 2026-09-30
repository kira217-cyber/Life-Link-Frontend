"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Filters, search and pagination read from and write to the URL.
 *
 * Keeping this state in the address bar rather than in component state is what
 * makes a filtered view shareable, bookmarkable and survivable across a
 * refresh — and it means the back button undoes a filter change, which is what
 * people expect it to do.
 *
 * Writes use replace rather than push for everything except the page number:
 * typing six characters into a search box should not leave six entries in the
 * history for the back button to walk through.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const get = useCallback((key: string, fallback = "") => params.get(key) ?? fallback, [params]);

  const getNumber = useCallback(
    (key: string, fallback: number) => {
      const raw = params.get(key);
      const value = raw === null ? Number.NaN : Number(raw);
      return Number.isFinite(value) && value > 0 ? value : fallback;
    },
    [params],
  );

  /**
   * Applies a batch of changes. An empty string or null removes the key, so a
   * cleared filter leaves a clean URL rather than `?status=`.
   */
  const setParams = useCallback(
    (
      updates: Record<string, string | number | null | undefined>,
      options: { history?: "push" | "replace"; resetPage?: boolean } = {},
    ) => {
      const { history = "replace", resetPage = true } = options;
      const next = new URLSearchParams(params.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }

      // Changing a filter while on page 4 would otherwise show an empty page.
      if (resetPage && !("page" in updates)) next.delete("page");

      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      if (history === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  /** True when anything other than the page number is set. */
  const hasFilters = useMemo(
    () => Array.from(params.keys()).some((key) => key !== "page"),
    [params],
  );

  return { params, get, getNumber, setParams, clearAll, hasFilters };
}
