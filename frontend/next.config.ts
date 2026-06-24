import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Rewrite these barrel imports to direct deep imports so each route only
  // bundles the pieces it uses. recharts + framer-motion are the heaviest deps.
  experimental: {
    optimizePackageImports: ['recharts', 'framer-motion', '@phosphor-icons/react'],
  },
  // Di production: Nginx proxy /api/* ke backend:4000
  // Di development: rewrite ini yang handle
  ...(process.env.NODE_ENV === 'development' && {
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
