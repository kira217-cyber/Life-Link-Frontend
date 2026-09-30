"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatNumber } from "@/lib/format";
import type { PaginationMeta } from "@/types/api";

/**
 * Pagination that lives in the URL, so a page is shareable and the back button
 * steps through pages rather than out of the list.
 *
 * Page changes push rather than replace — unlike a filter, moving to page 3 is
 * a step a person would expect to be able to undo.
 */
export function Pager({ meta }: { meta: PaginationMeta | null }) {
  const { setParams } = useQueryParams();

  if (!meta || meta.totalPages <= 1) {
    return meta && meta.total > 0 ? (
      <p className="text-sm text-muted-foreground">
        {formatNumber(meta.total)} {meta.total === 1 ? "result" : "results"}
      </p>
    ) : null;
  }

  const { page, limit, total, totalPages } = meta;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  const go = (next: number) =>
    setParams({ page: next <= 1 ? null : next }, { history: "push", resetPage: false });

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{formatNumber(first)}</span>–
        <span className="font-medium text-foreground">{formatNumber(last)}</span> of{" "}
        <span className="font-medium text-foreground">{formatNumber(total)}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="gap-1 bg-card"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <span className="px-1 text-sm tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="gap-1 bg-card"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
