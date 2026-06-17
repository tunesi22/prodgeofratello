import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://hifratello.com'
  const now = new Date()

  return [
    {
      url: `${base}/sign-in`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
