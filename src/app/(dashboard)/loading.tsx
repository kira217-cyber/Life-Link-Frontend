import { PageHeaderSkeleton, StatGridSkeleton } from "@/components/ui/skeletons";

/**
 * Shown while any dashboard page resolves on the server. The shell around it
 * is already there, so this only stands in for the body — the header block
 * and the tiles land exactly where the grey ones were.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton count={3} />
    </div>
  );
}
