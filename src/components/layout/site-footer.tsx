import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/eligibility", label: "Donor eligibility" },
      { href: "/donate", label: "Support the fund" },
    ],
  },
  {
    title: "Organisation",
    links: [
      { href: "/about", label: "About LifeLink" },
      { href: "/contact", label: "Contact" },
      { href: "/register", label: "Become a donor" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-sidebar">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A verified request, a compatible donor, and a record of what happened — so an
              urgent search stops depending on who happens to see a post.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LifeLink. Student project — not a medical service.</p>
          <p>
            Eligibility rules follow common donation guidance and are not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
