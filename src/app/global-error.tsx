"use client";

/**
 * The last resort.
 *
 * Every route group has its own error boundary, but those live inside the
 * root layout — if the layout itself throws, none of them ever mount. This
 * replaces the whole document, which is why it ships its own <html> and its
 * own inline styles: the stylesheet is exactly the thing that may not have
 * loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#fdf6f2",
          color: "#2b1b1e",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <main style={{ maxWidth: 420, textAlign: "center" }}>
          <svg width="88" height="88" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#8f1d2b" />
            <path
              d="M32 11c10.6 12.4 16.4 21.6 16.4 29.2A16.4 16.4 0 0 1 32 56a16.4 16.4 0 0 1-16.4-15.8C15.6 32.6 21.4 23.4 32 11Z"
              fill="#fdf3ef"
            />
          </svg>

          <h1 style={{ margin: "24px 0 0", fontSize: 26, letterSpacing: "-0.02em" }}>
            LifeLink could not start
          </h1>
          <p style={{ margin: "12px 0 0", lineHeight: 1.6, color: "#6d5a5e" }}>
            Something failed before the page could be built. Reloading usually clears it. If a
            patient needs blood right now, call the hospital blood bank directly rather than
            waiting on this.
          </p>

          {error.digest ? (
            <p style={{ margin: "16px 0 0", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#9a888c" }}>
              Reference {error.digest}
            </p>
          ) : null}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 28,
              padding: "12px 26px",
              minHeight: 44,
              border: "none",
              borderRadius: 12,
              background: "#8f1d2b",
              color: "#fdf3ef",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
