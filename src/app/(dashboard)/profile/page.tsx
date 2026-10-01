import { IdCard, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AccountForm } from "@/components/account/account-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FormSkeleton } from "@/components/ui/skeletons";
import { serverFetch } from "@/lib/api/server";
import { requireUser } from "@/lib/auth/guard";
import type { MeResponse } from "@/types/api";

export const metadata: Metadata = {
  title: "Account settings",
  description: "Your name, phone and avatar — the details other people see when you are matched.",
};

async function AccountLoader() {
  const me = await serverFetch<MeResponse>("/users/me");
  return <AccountForm me={me} />;
}

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <PageHeader
        title="Account settings"
        description="Who you are on LifeLink. Everything here is shown to the people you end up helping, so keep it something you would recognise."
        action={
          user.role === "DONOR" ? (
            <Button asChild variant="outline" className="tap-target">
              <Link href="/donor/profile">
                <IdCard className="size-4" />
                Donor details
              </Link>
            </Button>
          ) : null
        }
      />

      <Suspense fallback={<FormSkeleton fields={3} />}>
        <AccountLoader />
      </Suspense>

      <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-muted/40 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-sm font-semibold">Signing out everywhere</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            The sign-out button in the menu revokes every refresh token on your account, not just
            the one in this browser. If you ever used LifeLink on a shared computer, that is the
            button to press.
          </p>
        </div>
      </div>
    </div>
  );
}
