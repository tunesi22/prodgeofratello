'use client'

import { useEffect } from 'react'
import { isStaleBundleError, recoverFromStaleBundle } from '@/lib/staleBundleRecovery'

export default function Error({ error, reset }: { error: Error; reset: () => void }): React.ReactElement | null {
  const stale = isStaleBundleError(error)

  useEffect(() => {
    if (stale) recoverFromStaleBundle()
  }, [stale])

  if (stale) return null

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-h4 font-semibold text-primary">Terjadi kesalahan</h1>
      <p className="max-w-md text-paragraph-medium text-neutral-500">
        Halaman ini gagal dimuat. Coba lagi, atau muat ulang halaman.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-brand-600 px-5 py-2 text-label-medium font-semibold text-white-remain transition-colors hover:bg-brand-700"
      >
        Coba lagi
      </button>
    </div>
  )
}
