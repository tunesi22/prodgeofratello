import type { ReactElement } from 'react'
import { pageMetadata } from '@/lib/marketing/seo'
import { BlogListClient } from './BlogListClient'

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Strategy, guides, and perspective from the Fratello team on how brands get seen in the age of AI engines.',
  path: '/blog',
  lang: 'en',
})

/** Server wrapper: exports metadata and renders the (client) bilingual blog list, English mirror. */
export default function BlogPage(): ReactElement {
  return <BlogListClient />
}
