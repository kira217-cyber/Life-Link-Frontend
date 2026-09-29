"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Logo } from "@/components/brand/logo";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/auth/actions";
import { ROLE_LABEL } from "@/lib/domain";
import { initials } from "@/lib/format";
import { useUiStore } from "@/stores/ui-store";
import type { SessionUser } from "@/types/api";

/**
 * A persistent rail on desktop, a sheet on mobile.
 *
 * The shell is a client component because the sheet and the account menu need
 * state — but the pages it wraps stay server-rendered, so the data still
 * arrives without a client fetch.
 */
export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const startBlocking = useUiStore((state) => state.startBlocking);

  const accountMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[10rem] truncate text-sm font-medium leading-tight">
              {user.name}
            </span>
            <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Account settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications">Notifications</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signingOut}
          onSelect={(event) => {
            event.preventDefault();
            // Signing out revokes every session upstream and then redirects,
            // so the page is about to be replaced — the overlay covers the gap
            // the dropdown closing would otherwise leave blank.
            startBlocking({
              title: "Signing you out",
              description: "Ending your session on every device.",
            });
            startSignOut(async () => {
              await logoutAction();
            });
          }}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-dvh">
      {/* desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo href="/" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <DashboardNav role={user.role} />
        </div>
        <div className="border-t p-3">
          <p className="rounded-lg bg-accent/60 px-3 py-2.5 text-xs text-accent-foreground">
            Signed in as <span className="font-semibold">{ROLE_LABEL[user.role]}</span>
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[17rem] p-0">
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <div className="flex h-full flex-col bg-sidebar">
                <div className="flex h-16 items-center border-b px-5">
                  <Logo href="/" />
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-5">
                  <DashboardNav role={user.role} onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="font-heading font-semibold lg:hidden">
            Life<span className="text-primary">Link</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {accountMenu}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
