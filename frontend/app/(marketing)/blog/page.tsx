import type { ReactElement } from 'react'
import { pageMetadata } from '@/lib/marketing/seo'
import { BlogListClient } from './BlogListClient'

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Strategi, panduan, dan perspektif dari tim Fratello tentang bagaimana brand bisa terlihat di era mesin AI.',
  path: '/blog',
})

/** Server wrapper: exports metadata and renders the (client) bilingual blog list. */
export default function BlogPage(): ReactElement {
  return <BlogListClient />
}
