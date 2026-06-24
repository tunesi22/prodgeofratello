import type { ReactElement } from 'react'
import { Skeleton } from '@/components/dashboard/primitives'

/**
 * Route-level fallback for brand sub-pages. Shows instantly during route
 * compilation / chunk load (and the client-side data fetch that follows),
 * inside the persistent AppShell, instead of a blank content area.
 */
export default function Loading(): ReactElement {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    </div>
  )
}
