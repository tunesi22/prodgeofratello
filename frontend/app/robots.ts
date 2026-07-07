import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/about', '/sign-in', '/en', '/en/blog', '/en/about'],
        disallow: [
          '/brands',
          '/settings',
          '/usage',
          '/admin',
          '/onboarding',
          '/getting-started',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://hifratello.com/sitemap.xml',
  }
}
