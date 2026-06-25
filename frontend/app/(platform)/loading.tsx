import type { ReactElement } from 'react'
import { LoadingCircle } from '@/components/ui'

/**
 * Route-level fallback for top-level platform pages (projects list, usage,
 * settings) and the post-sign-in redirect. A centered brand spinner reads
 * cleaner than skeleton placeholders during route compilation / chunk load.
 */
export default function Loading(): ReactElement {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <LoadingCircle size="lg" />
    </div>
  )
}
