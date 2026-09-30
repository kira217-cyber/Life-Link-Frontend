import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/components/notifications/notification-list";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { requireUser } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Verifications, match answers, donations and payments — everything LifeLink told you.",
};

export default async function NotificationsPage() {
  await requireUser("/notifications");

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <PageHeader
        title="Notifications"
        description="Everything LifeLink has told you, newest first."
      />

      <Suspense fallback={<CardListSkeleton count={4} />}>
        <NotificationList />
      </Suspense>
    </div>
  );
}
