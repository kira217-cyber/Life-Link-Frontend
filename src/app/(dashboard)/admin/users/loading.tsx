import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function AdminUsersLoading() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
