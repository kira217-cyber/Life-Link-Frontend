import {
  BadgeCheck,
  Bell,
  ClipboardList,
  Droplets,
  FileClock,
  HeartHandshake,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  Search,
  Settings,
  Users,
} from "lucide-react";

import type { Role } from "@/types/api";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Matched as a prefix so a detail page keeps its parent highlighted. */
  match?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * The sidebar for each role.
 *
 * Kept as data rather than JSX so the same definition drives the desktop rail,
 * the mobile sheet and the breadcrumbs — three places that would otherwise
 * drift apart the first time a route is renamed.
 */
export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  DONOR: [
    {
      title: "Donating",
      items: [
        { href: "/donor", label: "Invitations", icon: HeartHandshake },
        { href: "/requests", label: "Open requests", icon: Droplets },
        { href: "/donor/donations", label: "My donations", icon: Droplets },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/donor/profile", label: "Donor profile", icon: BadgeCheck },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profile", label: "Settings", icon: Settings },
      ],
    },
  ],
  REQUESTER: [
    {
      title: "Requests",
      items: [
        { href: "/requester", label: "My requests", icon: ClipboardList },
        { href: "/requests", label: "All open requests", icon: Droplets },
        { href: "/donors", label: "Find donors", icon: Search },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profile", label: "Settings", icon: Settings },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Moderation",
      items: [
        { href: "/admin/requests", label: "Blood requests", icon: ClipboardList },
        { href: "/requests", label: "Open requests", icon: Droplets },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/donors", label: "Donor directory", icon: Search },
      ],
    },
    {
      title: "Records",
      items: [
        { href: "/admin/payments", label: "Payments", icon: Receipt },
        { href: "/admin/audit-logs", label: "Audit log", icon: FileClock },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profile", label: "Settings", icon: Settings },
      ],
    },
  ],
};

/** True when `pathname` is this item's route or something beneath it. */
export function isActiveNav(pathname: string, item: NavItem): boolean {
  const target = item.match ?? item.href;
  if (pathname === target) return true;
  // A role's index route would otherwise light up on every child page.
  if (target === "/donor" || target === "/requester" || target === "/admin") return false;
  return pathname.startsWith(`${target}/`);
}
