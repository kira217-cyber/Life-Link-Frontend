import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function NewRequestLoading() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <PageHeaderSkeleton />
      <FormSkeleton fields={4} />
    </div>
  );
}
