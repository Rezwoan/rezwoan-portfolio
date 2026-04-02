import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  // ── Images ────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost", port: "8000", pathname: "/media/**" },
      { protocol: "https", hostname: "rezwoan.me", pathname: "/media/**" },
    ],
    formats: ["image/avif", "image/webp"],
    // Reserve space to prevent CLS (Cumulative Layout Shift)
    // Each image component must supply width + height or use fill + a sized container
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ── Compiler ──────────────────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.rezwoan.me" }],
        destination: "https://rezwoan.me/:path*",
        permanent: true,
      },
    ];
  },

  // ── HTTP Headers ──────────────────────────────────────────────────────────
  async headers() {
    return [
      // Security headers on all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "X-Frame-Options",             value: "DENY" },
          { key: "X-XSS-Protection",            value: "1; mode=block" },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",          value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Immutable cache on Next.js static assets (hashed filenames)
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache media served from Django
      {
        source: "/media/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      // Long cache for OG images (edge-cached by Cloudflare anyway)
      {
        source: "/og(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // ── Rewrites — proxy /api/* and /media/* to Django ───────────────────────
  // This removes CORS issues entirely in production: the browser talks to
  // rezwoan.me/api/* and Next.js proxies the request to gunicorn internally.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${API_BASE}/media/:path*`,
      },
      {
        source: "/sitemap.xml",
        destination: `${API_BASE}/sitemap.xml`,
      },
      {
        source: "/robots.txt",
        destination: `${API_BASE}/robots.txt`,
      },
      {
        source: "/llms.txt",
        destination: `${API_BASE}/llms.txt`,
      },
      {
        source: "/feed/rss/",
        destination: `${API_BASE}/feed/rss/`,
      },
      {
        source: "/cms/:path*",
        destination: `${API_BASE}/cms/:path*`,
      },
    ];
  },
};

export default nextConfig;
