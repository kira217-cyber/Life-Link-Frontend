import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function DonateLoading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <FormSkeleton fields={4} />
        <FormSkeleton fields={2} />
      </div>
    </div>
  );
}
