'use client'

import { useEffect } from 'react'
import { isStaleBundleError, recoverFromStaleBundle } from '@/lib/staleBundleRecovery'

// Replaces the root layout entirely when layout.tsx itself throws, so it
// must render its own <html>/<body> — Tailwind/globals.css aren't guaranteed
// to be loaded here, hence the inline styles.
export default function GlobalError({ error }: { error: Error }): React.ReactElement {
  const stale = isStaleBundleError(error)

  useEffect(() => {
    if (stale) recoverFromStaleBundle()
  }, [stale])

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {!stale && (
          <div
            style={{
              display: 'flex',
              minHeight: '60vh',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '0 1.5rem',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Terjadi kesalahan</h1>
            <p style={{ maxWidth: 420, color: '#666' }}>Halaman ini gagal dimuat. Coba muat ulang halaman.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                borderRadius: 9999,
                background: '#16a34a',
                color: '#fff',
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Muat ulang
            </button>
          </div>
        )}
      </body>
    </html>
  )
}
