import { CardListSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <PageHeaderSkeleton />
      <CardListSkeleton count={4} />
    </div>
  );
}
