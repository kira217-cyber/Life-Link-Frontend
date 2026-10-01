import { PageHeaderSkeleton, StatGridSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function AdminPaymentsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton count={2} />
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
