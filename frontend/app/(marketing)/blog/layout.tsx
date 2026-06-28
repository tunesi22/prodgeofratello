import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Blog - Fratello',
  description: 'Insight, strategi, dan panduan seputar GEO (Generative Engine Optimization) dari tim Fratello.',
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
