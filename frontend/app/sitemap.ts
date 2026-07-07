import type { MetadataRoute } from 'next'
import { posts as idPosts } from '@/app/(marketing)/blog/_posts/id'
import { posts as enPosts } from '@/app/(marketing)/blog/_posts/en'

const base = 'https://hifratello.com'

function alt(idPath: string, enPath: string): { languages: Record<string, string> } {
  return {
    languages: {
      id: `${base}${idPath}`,
      en: `${base}${enPath}`,
      'x-default': `${base}${idPath}`,
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1, alternates: alt('/', '/en') },
    { url: `${base}/en`, lastModified: now, changeFrequency: 'weekly', priority: 1, alternates: alt('/', '/en') },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: alt('/about', '/en/about') },
    { url: `${base}/en/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: alt('/about', '/en/about') },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9, alternates: alt('/blog', '/en/blog') },
    { url: `${base}/en/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9, alternates: alt('/blog', '/en/blog') },
    ...idPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: alt(`/blog/${post.slug}`, `/en/blog/${post.slug}`),
    })),
    ...enPosts.map((post) => ({
      url: `${base}/en/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: alt(`/blog/${post.slug}`, `/en/blog/${post.slug}`),
    })),
  ]
}
