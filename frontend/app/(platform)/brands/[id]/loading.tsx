import type { ReactElement } from 'react'
import { LoadingCircle } from '@/components/ui'

/**
 * Route-level fallback for brand sub-pages. A centered brand spinner inside the
 * persistent AppShell during route compilation / chunk load, instead of
 * skeleton placeholders.
 */
export default function Loading(): ReactElement {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <LoadingCircle size="lg" />
    </div>
  )
}
