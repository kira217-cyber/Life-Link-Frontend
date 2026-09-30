import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function AdminRequestsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} columns={6} />
    </div>
  );
}
