import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeletons shaped like the thing that is coming.
 *
 * A skeleton earns its place by holding the layout still — the content lands
 * where the grey blocks were, so nothing jumps. A generic spinner in a box
 * would not do that, which is why the route-level loaders use these rather
 * than the drop.
 */

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:justify-between", className)}>
      <div className="w-full max-w-md space-y-2.5">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-11 w-full shrink-0 sm:w-40" />
    </div>
  );
}

/** A row of summary tiles, as the dashboards open with. */
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border bg-card p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Stacked cards — match invitations, requests, notifications. */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
            <Skeleton className="size-12 shrink-0 rounded-xl" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A data table with its toolbar above it. */
export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full sm:max-w-xs" />
        <Skeleton className="h-10 w-full sm:w-36" />
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="scroll-x">
          <table className="w-full min-w-[40rem]">
            <thead>
              <tr className="border-b bg-muted/50">
                {Array.from({ length: columns }, (_, index) => (
                  <th key={index} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, row) => (
                <tr key={row} className="border-b last:border-0">
                  {Array.from({ length: columns }, (_, column) => (
                    <td key={column} className="px-4 py-3.5">
                      {/* The first column reads as a name, the rest as values —
                          varying the widths keeps it from looking like a grid
                          of identical bars. */}
                      <Skeleton className={cn("h-4", column === 0 ? "w-32" : "w-16")} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-9 w-56" />
      </div>
    </div>
  );
}

/** A form, for the profile and request pages. */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="grid gap-5">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="mt-1 h-11 w-full sm:w-40" />
      </div>
    </div>
  );
}

/** A chart panel, for the admin analytics. */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-6 flex h-48 items-end gap-2.5">
        {[62, 88, 44, 96, 70, 52, 80].map((height, index) => (
          <Skeleton key={index} className="flex-1 rounded-t-md" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
}
