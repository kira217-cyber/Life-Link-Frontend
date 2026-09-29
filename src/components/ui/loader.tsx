import { cn } from "@/lib/utils";

/**
 * The loading indicator for the whole app.
 *
 * A drop filling from the bottom rather than a generic ring — the wait is part
 * of the product's own story, and a spinner that could belong to any site is a
 * missed chance to say which one you are on. The outline stays visible while
 * the fill rises, so there is something to look at from the first frame rather
 * than an empty box.
 *
 * Motion is suppressed by the global reduced-motion rule; the drop then simply
 * sits filled, which still reads as "working".
 */

const SIZES = {
  sm: "size-5",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
} as const;

export type LoaderSize = keyof typeof SIZES;

export function Loader({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: LoaderSize;
  className?: string;
  /** Announced to screen readers; pass something specific where you can. */
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-grid place-items-center", className)}>
      <svg viewBox="0 0 24 28" className={cn(SIZES[size], "text-primary")} fill="none" aria-hidden="true">
        <defs>
          <clipPath id="ll-drop-clip">
            <path d="M12 1.6c5.6 6.6 9 11.6 9 15.6A9 9 0 0 1 3 17.2C3 13.2 6.4 8.2 12 1.6Z" />
          </clipPath>
        </defs>

        {/* the vessel */}
        <path
          d="M12 1.6c5.6 6.6 9 11.6 9 15.6A9 9 0 0 1 3 17.2C3 13.2 6.4 8.2 12 1.6Z"
          className="fill-primary/12 stroke-current"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* the fill, rising and falling inside it */}
        <g clipPath="url(#ll-drop-clip)">
          <rect x="0" y="0" width="24" height="28" className="fill-current ll-drop-fill" />
        </g>
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Centred loader with a line of copy — for a panel or a route that is fetching
 * its first data. Says what is loading rather than only that something is.
 */
export function LoadingPanel({
  title = "Loading",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-56 place-items-center rounded-2xl border border-dashed bg-card/60 p-8",
        className,
      )}
    >
      <div className="text-center">
        <Loader size="lg" label={title} />
        <p className="mt-4 font-heading text-base font-semibold">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Fills the viewport under the dashboard shell or an auth pane. Used by the
 * route-level loading.tsx files, where there is no layout of the page yet to
 * mirror with skeletons.
 */
export function LoadingScreen({
  title = "Loading",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="text-center">
        <Loader size="xl" label={title} />
        <p className="mt-5 font-heading text-lg font-semibold">{title}</p>
        {description ? (
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Inline, for a button or a row that is busy. */
export function InlineLoader({ label = "Working" }: { label?: string }) {
  return <Loader size="sm" label={label} className="align-middle" />;
}
