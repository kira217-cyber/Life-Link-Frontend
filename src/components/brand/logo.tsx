import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A drop with a link cut through it — the two halves of the name.
 *
 * Drawn inline rather than shipped as an image so it inherits the theme
 * colour, stays sharp at any size and costs no extra request.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M12 3.2c3.7 4.4 5.8 7.6 5.8 10.3A5.8 5.8 0 0 1 12 19.4a5.8 5.8 0 0 1-5.8-5.6C6.2 10.8 8.3 7.6 12 3.2Z"
          fill="currentColor"
        />
        <path
          d="M9.4 14.2h5.2M12 11.6v5.2"
          stroke="var(--primary)"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg font-heading text-lg font-semibold tracking-tight",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      <LogoMark />
      {showWordmark ? (
        <span className="leading-none">
          Life<span className="text-primary">Link</span>
        </span>
      ) : (
        <span className="sr-only">LifeLink</span>
      )}
    </Link>
  );
}
