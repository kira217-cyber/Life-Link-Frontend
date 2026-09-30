import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { MyRequestList } from "@/components/requests/my-request-list";
import { Button } from "@/components/ui/button";
import { CardListSkeleton } from "@/components/ui/skeletons";
import { requireRole } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "My requests",
  description: "The blood requests you have posted, and where each one has got to.",
};

export default async function RequesterHomePage() {
  const user = await requireRole("REQUESTER");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Each request is reviewed by an admin before any donor hears about it. Once verified, you can invite every compatible donor who is eligible today."
        action={
          <Button asChild className="tap-target gap-1.5">
            <Link href="/requester/requests/new">
              <Plus className="size-4" />
              New request
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<CardListSkeleton count={3} />}>
        <MyRequestList />
      </Suspense>
    </div>
  );
}
