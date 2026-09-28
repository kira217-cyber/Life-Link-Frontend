import { cn } from "@/lib/utils";

/**
 * Two hands meeting around a drop, with the match network drawn faintly
 * behind them.
 *
 * Hand-drawn rather than photographed: a stock photo of a needle is the last
 * thing a nervous first-time donor needs on a landing page, and the strokes
 * here take their colour from the theme so the art re-colours in dark mode
 * instead of sitting in a white box.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 360"
      role="img"
      aria-label="Two open hands passing a drop between them, linked by a network of matched donors"
      className={cn("h-auto w-full", className)}
      fill="none"
    >
      {/* soft ground */}
      <ellipse cx="210" cy="312" rx="150" ry="20" className="fill-accent" opacity="0.5" />

      {/* network behind — the matching graph, kept faint */}
      <g className="stroke-ink-soft" strokeWidth="1.5" opacity="0.45">
        <path d="M64 92c38-18 74-6 96 18" strokeLinecap="round" strokeDasharray="4 7" />
        <path d="M356 92c-38-18-74-6-96 18" strokeLinecap="round" strokeDasharray="4 7" />
        <path d="M78 196c30 14 56 12 80 2" strokeLinecap="round" strokeDasharray="4 7" />
        <path d="M342 196c-30 14-56 12-80 2" strokeLinecap="round" strokeDasharray="4 7" />
      </g>
      <g className="fill-ink-soft" opacity="0.7">
        <circle cx="64" cy="92" r="5" />
        <circle cx="356" cy="92" r="5" />
        <circle cx="78" cy="196" r="4" />
        <circle cx="342" cy="196" r="4" />
      </g>

      {/* left hand */}
      <g className="stroke-ink" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M104 286c-6-30 2-56 20-72 10-9 24-13 38-11"
          className="fill-card"
        />
        <path d="M124 214c-8-14-14-26-12-34 2-8 12-9 17-1l14 24" className="fill-card" />
        <path d="M143 203l-9-30c-3-10 7-15 13-7l13 30" className="fill-card" />
        <path d="M160 196l-3-28c-1-10 11-12 14-3l6 28" className="fill-card" />
        <path d="M177 193l6-22c3-9 14-6 13 3l-2 24" className="fill-card" />
        <path d="M104 286h86v-84" />
      </g>

      {/* right hand, mirrored */}
      <g
        className="stroke-ink"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(420 0) scale(-1 1)"
      >
        <path d="M104 286c-6-30 2-56 20-72 10-9 24-13 38-11" className="fill-card" />
        <path d="M124 214c-8-14-14-26-12-34 2-8 12-9 17-1l14 24" className="fill-card" />
        <path d="M143 203l-9-30c-3-10 7-15 13-7l13 30" className="fill-card" />
        <path d="M160 196l-3-28c-1-10 11-12 14-3l6 28" className="fill-card" />
        <path d="M177 193l6-22c3-9 14-6 13 3l-2 24" className="fill-card" />
        <path d="M104 286h86v-84" />
      </g>

      {/* the drop */}
      <g>
        <path
          d="M210 44c26 32 42 56 42 78a42 42 0 0 1-84 0c0-22 16-46 42-78Z"
          className="fill-primary"
        />
        <path
          d="M210 44c26 32 42 56 42 78a42 42 0 0 1-84 0c0-22 16-46 42-78Z"
          className="stroke-ink"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* highlight — one stroke, so it reads as drawn not rendered */}
        <path
          d="M192 118c0-14 6-26 14-36"
          className="stroke-primary-foreground"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>

      {/* the link through the drop, echoing the logo mark */}
      <g className="stroke-primary-foreground" strokeWidth="6" strokeLinecap="round">
        <path d="M196 128h28" />
        <path d="M210 114v28" />
      </g>
    </svg>
  );
}
