"use client";

import { ShieldCheck, Stethoscope, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { demoLoginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/ui/loader";
import type { Role } from "@/types/api";

/**
 * One-click sign-in for evaluators.
 *
 * The button sends only a role name. The email and password live in
 * server-only environment variables and are read inside the server action, so
 * nothing about the demo accounts ships in the client bundle.
 */
const ACCOUNTS: Array<{
  role: Role;
  label: string;
  blurb: string;
  icon: typeof User;
}> = [
  {
    role: "DONOR",
    label: "Donor",
    blurb: "Answer match invitations, manage availability",
    icon: User,
  },
  {
    role: "REQUESTER",
    label: "Requester",
    blurb: "Post blood requests, confirm donations",
    icon: Stethoscope,
  },
  {
    role: "ADMIN",
    label: "Admin",
    blurb: "Verify requests, read analytics and audit logs",
    icon: ShieldCheck,
  },
];

export function DemoLogin() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<Role | null>(null);

  function signIn(role: Role) {
    setActive(role);
    startTransition(async () => {
      const result = await demoLoginAction(role);
      if (!result.ok) {
        setActive(null);
        toast.error(result.message);
        return;
      }
      toast.success(`Signed in as the ${role.toLowerCase()} demo account`);
      router.push(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="demo-heading" className="mt-8">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          or try it instantly
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <h2 id="demo-heading" className="mt-6 text-center text-sm font-semibold">
        One-click demo sign-in
      </h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Each button signs you into a ready-made account and opens that role&apos;s dashboard.
      </p>

      <div className="mt-4 grid gap-2.5">
        {ACCOUNTS.map((account) => {
          const busy = pending && active === account.role;
          return (
            <Button
              key={account.role}
              type="button"
              variant="outline"
              onClick={() => signIn(account.role)}
              disabled={pending}
              aria-busy={busy}
              className="tap-target h-auto w-full justify-start gap-3 bg-card px-4 py-3 text-left"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                {busy ? (
                  <InlineLoader label={`Signing in as ${account.label}`} />
                ) : (
                  <account.icon className="size-4" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {busy ? `Signing in as ${account.label}…` : `Continue as ${account.label}`}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {account.blurb}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
