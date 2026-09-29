import { CardListSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function DonorLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <CardListSkeleton count={3} />
    </div>
  );
}
