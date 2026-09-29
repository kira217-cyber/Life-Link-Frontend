import { ChartSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "@/components/ui/skeletons";

export default function AdminLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
