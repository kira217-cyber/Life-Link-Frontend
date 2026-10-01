import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function DonorProfileLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={6} />
    </div>
  );
}
