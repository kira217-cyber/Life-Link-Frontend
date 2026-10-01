import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function ProfileLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={3} />
    </div>
  );
}
