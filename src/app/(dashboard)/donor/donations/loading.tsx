import { CardListSkeleton, PageHeaderSkeleton, StatGridSkeleton } from "@/components/ui/skeletons";

export default function DonationsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton count={3} />
      <CardListSkeleton count={3} />
    </div>
  );
}
