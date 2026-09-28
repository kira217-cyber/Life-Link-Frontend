import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The mark is a drop with a link cut through it — the two halves of the name,
 * drawn rather than shipped as an image so it inherits the theme colour.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-6 text-primary", className)}
      fill="none"
    >
      <path
        d="M12 2.5c3.6 4.2 6.5 7.8 6.5 11.1A6.5 6.5 0 0 1 12 20a6.5 6.5 0 0 1-6.5-6.4C5.5 10.3 8.4 6.7 12 2.5Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M12 2.5c3.6 4.2 6.5 7.8 6.5 11.1A6.5 6.5 0 0 1 12 20a6.5 6.5 0 0 1-6.5-6.4C5.5 10.3 8.4 6.7 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 13.6h5.6M12 10.9v5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-sm font-heading text-lg font-semibold tracking-tight",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <LogoMark />
      <span>
        Life<span className="text-primary">Link</span>
      </span>
    </Link>
  );
}
