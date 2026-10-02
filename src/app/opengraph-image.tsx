import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card people see when a link is shared.
 *
 * Drawn here rather than shipped as a file so it stays in step with the
 * palette, and generated at the edge so it costs nothing to keep. The
 * metadata already declares a large-image card; without this it would have
 * declared one and then shown an empty box.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdf6f2",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#8f1d2b" />
            <path
              d="M32 11c10.6 12.4 16.4 21.6 16.4 29.2A16.4 16.4 0 0 1 32 56a16.4 16.4 0 0 1-16.4-15.8C15.6 32.6 21.4 23.4 32 11Z"
              fill="#fdf3ef"
            />
            <path
              d="M24.6 41.4h14.8M32 34v14.8"
              stroke="#8f1d2b"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: 44, fontWeight: 700, color: "#8f1d2b", letterSpacing: -1 }}>
            {SITE_NAME}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#2b1b1e",
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Verified blood requests, matched to donors who can actually answer.
          </span>
          <span style={{ fontSize: 30, color: "#6d5a5e", maxWidth: 880 }}>
            Compatible group · eligible to donate · close enough to come
          </span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"].map((group) => (
            <span
              key={group}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 86,
                height: 56,
                borderRadius: 14,
                background: "#8f1d2b",
                color: "#fdf3ef",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {group}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
