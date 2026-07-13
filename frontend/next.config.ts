import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Rewrite these barrel imports to direct deep imports so each route only
  // bundles the pieces it uses. recharts + framer-motion are the heaviest deps.
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion', '@phosphor-icons/react'],
  },
  // No floating dev-tools bubble: it photobombs the real product screenshots
  // we capture from the running app for the marketing site.
  devIndicators: false,
  // Di production: Nginx proxy /api/* ke backend:4000
  // Di development: rewrite ini yang handle.
  // Saat MOCK_AUTH=1 (lihat .env.local) rewrite-nya TIDAK dipasang, supaya
  // mock Route Handler lokal — termasuk yang dynamic seperti /api/brands/[id] —
  // bisa menang. (afterFiles rewrite jalan sebelum dynamic route, jadi kalau
  // rewrite ada ia "mencuri" /api/brands/:id sebelum route mock kebaca.)
  // Endpoint yang belum di-mock akan 404 di mode ini, bukan proxy ke :4000.
  ...(process.env.NODE_ENV === 'development' &&
    process.env.MOCK_AUTH !== '1' && {
      async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:4000/api/:path*',
          },
        ]
      },
    }),
}

export default nextConfig
