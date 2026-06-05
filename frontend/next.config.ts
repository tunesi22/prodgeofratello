import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
