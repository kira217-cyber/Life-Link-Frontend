import { cn } from "@/lib/utils";

/**
 * The panel beside the auth forms.
 *
 * A key turning inside a drop, over the faint match network — the sign-in is
 * what connects a person to the requests they can actually answer, and the
 * drawing says that rather than decorating the space.
 */
export function AuthArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 340"
      role="img"
      aria-label="A key turning inside a blood drop, over a network of connected donors"
      className={cn("h-auto w-full", className)}
      fill="none"
    >
      {/* network behind */}
      <g className="stroke-primary-foreground" strokeWidth="1.5" opacity="0.28">
        <path d="M40 74c46-26 92-16 122 14" strokeLinecap="round" strokeDasharray="4 8" />
        <path d="M320 74c-46-26-92-16-122 14" strokeLinecap="round" strokeDasharray="4 8" />
        <path d="M52 250c40 22 78 22 118 4" strokeLinecap="round" strokeDasharray="4 8" />
        <path d="M308 250c-40 22-78 22-118 4" strokeLinecap="round" strokeDasharray="4 8" />
      </g>
      <g className="fill-primary-foreground" opacity="0.4">
        <circle cx="40" cy="74" r="6" />
        <circle cx="320" cy="74" r="6" />
        <circle cx="52" cy="250" r="5" />
        <circle cx="308" cy="250" r="5" />
      </g>

      {/* the drop */}
      <path
        d="M180 40c40 50 62 86 62 118a62 62 0 0 1-124 0c0-32 22-68 62-118Z"
        className="fill-primary-foreground"
        opacity="0.14"
      />
      <path
        d="M180 40c40 50 62 86 62 118a62 62 0 0 1-124 0c0-32 22-68 62-118Z"
        className="stroke-primary-foreground"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* key inside */}
      <g className="stroke-primary-foreground" strokeWidth="6" strokeLinecap="round">
        <circle cx="180" cy="142" r="22" />
        <path d="M180 164v46" />
        <path d="M180 188h16" />
        <path d="M180 204h12" />
      </g>
      <circle cx="180" cy="142" r="7" className="fill-primary-foreground" />
    </svg>
  );
}
