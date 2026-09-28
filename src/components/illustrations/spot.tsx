import { cn } from "@/lib/utils";

/**
 * Small hand-drawn spot illustrations, one per idea. Each is a single scene
 * rather than an icon, so a section can carry a picture without pulling in a
 * photo that would only half-fit.
 *
 * All of them draw with theme tokens — `ink` for the line, `primary` for the
 * one thing the drawing is about — so they hold up in both themes.
 */

type SpotProps = { className?: string };

const svg = "h-auto w-full";
const ink = "stroke-ink";
const stroke = { strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** A note pinned to a board — the informal search LifeLink replaces. */
export function SpotGuesswork({ className }: SpotProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      role="img"
      aria-label="A pinned note covered in question marks"
      className={cn(svg, className)}
      fill="none"
    >
      <rect x="28" y="30" width="104" height="86" rx="10" className="fill-card" />
      <rect x="28" y="30" width="104" height="86" rx="10" className={ink} {...stroke} />
      <circle cx="80" cy="30" r="9" className="fill-primary" />
      <circle cx="80" cy="30" r="9" className={ink} {...stroke} />
      <g className={ink} {...stroke}>
        <path d="M54 62c0-8 6-13 13-13s13 5 13 12c0 8-11 8-13 15" />
        <path d="M67 88h.01" />
        <path d="M96 60h18M96 76h22M96 92h12" opacity="0.45" />
      </g>
    </svg>
  );
}

/** A calendar with a blocked-out window — the donation cooldown. */
export function SpotCooldown({ className }: SpotProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      role="img"
      aria-label="A calendar with a stretch of days blocked out"
      className={cn(svg, className)}
      fill="none"
    >
      <rect x="24" y="34" width="112" height="84" rx="10" className="fill-card" />
      <rect x="24" y="34" width="112" height="84" rx="10" className={ink} {...stroke} />
      <path d="M24 58h112" className={ink} {...stroke} />
      <path d="M52 34V22M108 34V22" className={ink} {...stroke} />
      <rect x="40" y="70" width="58" height="16" rx="6" className="fill-primary" />
      <g className={ink} {...stroke}>
        <rect x="40" y="70" width="58" height="16" rx="6" />
        <path d="M40 98h18M70 98h18" opacity="0.45" />
      </g>
    </svg>
  );
}

/** A stamp landing on a document — admin verification. */
export function SpotVerified({ className }: SpotProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      role="img"
      aria-label="A document being stamped as verified"
      className={cn(svg, className)}
      fill="none"
    >
      <rect x="30" y="26" width="84" height="94" rx="10" className="fill-card" />
      <rect x="30" y="26" width="84" height="94" rx="10" className={ink} {...stroke} />
      <g className={ink} {...stroke} opacity="0.45">
        <path d="M46 48h42M46 64h52M46 80h30" />
      </g>
      <circle cx="104" cy="92" r="26" className="fill-primary" />
      <circle cx="104" cy="92" r="26" className={ink} {...stroke} />
      <path d="M92 92l9 9 17-18" className="stroke-primary-foreground" {...stroke} />
    </svg>
  );
}

/** Two pins joined by a route — matching by distance. */
export function SpotMatch({ className }: SpotProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      role="img"
      aria-label="Two map pins joined by a route"
      className={cn(svg, className)}
      fill="none"
    >
      <path
        d="M34 108c22-14 26-38 48-38s26 24 46 14"
        className={ink}
        {...stroke}
        strokeDasharray="6 9"
        opacity="0.55"
      />
      <path d="M44 38c13 16 20 27 20 36a20 20 0 1 1-40 0c0-9 7-20 20-36Z" className="fill-primary" />
      <path d="M44 38c13 16 20 27 20 36a20 20 0 1 1-40 0c0-9 7-20 20-36Z" className={ink} {...stroke} />
      <path
        d="M118 22c13 16 20 27 20 36a20 20 0 1 1-40 0c0-9 7-20 20-36Z"
        className="fill-card"
      />
      <path
        d="M118 22c13 16 20 27 20 36a20 20 0 1 1-40 0c0-9 7-20 20-36Z"
        className={ink}
        {...stroke}
      />
      <circle cx="118" cy="56" r="7" className="fill-primary" />
    </svg>
  );
}

/** An open ledger — the recorded donation. */
export function SpotRecord({ className }: SpotProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      role="img"
      aria-label="An open ledger with a donation recorded in it"
      className={cn(svg, className)}
      fill="none"
    >
      <path d="M22 40c20-8 36-8 58 2v78c-22-10-38-10-58-2V40Z" className="fill-card" />
      <path d="M138 40c-20-8-36-8-58 2v78c22-10 38-10 58-2V40Z" className="fill-card" />
      <g className={ink} {...stroke}>
        <path d="M22 40c20-8 36-8 58 2v78c-22-10-38-10-58-2V40Z" />
        <path d="M138 40c-20-8-36-8-58 2v78c22-10 38-10 58-2V40Z" />
      </g>
      <g className={ink} {...stroke} opacity="0.4">
        <path d="M36 62h28M36 78h24M96 62h28M96 78h24" />
      </g>
      <circle cx="110" cy="100" r="13" className="fill-primary" />
      <path d="M104 100l4 4 8-8" className="stroke-primary-foreground" {...stroke} />
    </svg>
  );
}

/** Nothing here yet — used by list and table empty states. */
export function SpotEmpty({ className }: SpotProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      role="img"
      aria-label="An empty tray"
      className={cn(svg, className)}
      fill="none"
    >
      <ellipse cx="80" cy="100" rx="52" ry="8" className="fill-accent" opacity="0.6" />
      <path d="M34 54h92l-12 40H46L34 54Z" className="fill-card" />
      <g className={ink} {...stroke}>
        <path d="M34 54h92l-12 40H46L34 54Z" />
        <path d="M52 54V34c0-6 5-10 11-10h34c6 0 11 4 11 10v20" opacity="0.5" />
      </g>
      <circle cx="80" cy="72" r="5" className="fill-ink-soft" />
    </svg>
  );
}
