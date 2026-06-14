/** @type {import('next').NextConfig} */
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3201';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'rezwoan.me' },
      { protocol: 'https', hostname: 'www.rezwoan.me' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'opengraph.githubassets.com' },
    ],
  },
  async rewrites() {
    // In production, nginx serves /uploads and /api directly. In local dev there is no
    // nginx, so proxy /uploads/* to the backend so <img src="/uploads/..."> resolves.
    if (process.env.NODE_ENV === 'production') return [];
    return [{ source: '/uploads/:path*', destination: `${API}/uploads/:path*` }];
  },
};

module.exports = nextConfig;
