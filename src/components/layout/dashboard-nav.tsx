"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActiveNav, NAV_BY_ROLE } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

/**
 * The link list shared by the desktop rail and the mobile sheet — one
 * definition, so the two can never disagree about what a role can reach.
 */
export function DashboardNav({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const sections = NAV_BY_ROLE[role];

  return (
    <nav aria-label="Dashboard" className="grid gap-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h2>
          <ul className="mt-2 grid gap-0.5">
            {section.items.map((item) => {
              const active = isActiveNav(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
