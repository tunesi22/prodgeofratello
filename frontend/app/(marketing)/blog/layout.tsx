import type { ReactNode } from 'react'
import { pageMetadata } from '@/lib/marketing/seo'

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Insight, strategi, dan panduan seputar GEO (Generative Engine Optimization) dari tim Fratello.',
  path: '/blog',
  lang: 'id',
})

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
