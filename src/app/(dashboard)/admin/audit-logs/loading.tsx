import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function AdminAuditLogsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} columns={4} />
    </div>
  );
}
