/**
 * app/og/route.tsx — Dynamic OG image generation.
 *
 * Generates a 1200×630 PNG for every page on the fly.
 * Cached at the CDN layer by Cloudflare.
 *
 * Usage:
 *   /og?title=My+Project&subtitle=Next.js+·+Django
 *   /og?title=Blog+Post+Title&type=blog
 *   /og?title=Din+Muhammad+Rezwoan&type=home
 *
 * Used by:
 *   - lib/seo.ts  buildOgImageUrl() helper
 *   - All generateMetadata() functions
 */
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const ACCENT = "#C8F04B";
const BG = "#080808";
const SURFACE = "#111111";
const BORDER = "#242424";
const TEXT_PRIMARY = "#F5F5F0";
const TEXT_MUTED = "#666660";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") ?? "Din Muhammad Rezwoan";
  const subtitle = searchParams.get("subtitle") ?? "Full Stack Developer · Dhaka, Bangladesh";
  const type = searchParams.get("type") ?? "default"; // home | project | blog | default

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${BORDER} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            opacity: 0.4,
          }}
        />

        {/* Accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 65%)`,
          }}
        />

        {/* Top bar — logo + type badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: ACCENT, fontSize: "28px", fontWeight: 800 }}>R</span>
            <span style={{ color: TEXT_PRIMARY, fontSize: "28px", fontWeight: 800 }}>ezwoan</span>
          </div>

          {/* Type badge */}
          {type !== "home" && type !== "default" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "8px 16px",
                color: TEXT_MUTED,
                fontSize: "14px",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {type === "blog" ? "Blog Post" : type === "project" ? "Project" : type}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          {/* Title */}
          <div
            style={{
              color: TEXT_PRIMARY,
              fontSize: title.length > 40 ? "48px" : "60px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: TEXT_MUTED,
              fontSize: "24px",
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22C55E",
              }}
            />
            <span style={{ color: TEXT_MUTED, fontSize: "16px" }}>
              Available for work
            </span>
          </div>
          <span style={{ color: TEXT_MUTED, fontSize: "16px" }}>
            rezwoan.me
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
