import type { ReactNode } from 'react'
import { pageMetadata } from '@/lib/marketing/seo'

export const metadata = pageMetadata({
  title: 'Blog',
  description: 'Insights, strategy, and guides on GEO (Generative Engine Optimization) from the Fratello team.',
  path: '/blog',
  lang: 'en',
})

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
