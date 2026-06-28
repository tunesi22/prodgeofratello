'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useScanProgress } from '@/components/providers/ScanProgressProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LoadingCircle, ProgressBar } from '@/components/ui'
import { CheckCircleIcon, CloseIcon } from '@/components/onboarding/icons'
import { transitionEnter, transitionExit } from '@/lib/motion'

/**
 * Sticky, minimal banner that follows the user across every page while a scan
 * runs (state from ScanProgressProvider). Shows a live progress bar, checks
 * collected, and a rough ETA, then a brief "complete" state with a link to the
 * fresh results. Intentionally slim: it only needs to say "scan still running".
 */

const COPY = {
  id: {
    scanning: (brand: string): string => `Memindai ${brand}`,
    scanningSub: 'mengumpulkan jawaban AI dari berbagai model',
    checks: (done: number, total: number): string => `${done}/${total} pengecekan`,
    etaLeft: (eta: string): string => `± ${eta} lagi`,
    doneTitle: 'Scan selesai',
    doneSub: 'hasil baru sudah masuk',
    viewResults: 'Lihat hasil',
    dismiss: 'Tutup',
  },
  en: {
    scanning: (brand: string): string => `Scanning ${brand}`,
    scanningSub: 'collecting AI responses across models',
    checks: (done: number, total: number): string => `${done}/${total} checks`,
    etaLeft: (eta: string): string => `~${eta} left`,
    doneTitle: 'Scan complete',
    doneSub: 'new results are in',
    viewResults: 'View results',
    dismiss: 'Dismiss',
  },
} as const

/** Coarse "1m 30s" / "45s" countdown label. */
function formatEta(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  if (s >= 60) {
    const m = Math.floor(s / 60)
    const rem = s % 60
    return rem > 0 ? `${m}m ${rem}s` : `${m}m`
  }
  return `${s}s`
}

export function ScanBanner(): ReactElement {
  const { scan, dismiss } = useScanProgress()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const isDone = scan?.status === 'done'
  const pct = scan != null && scan.total > 0 ? (scan.done / scan.total) * 100 : 0
  // ETA recomputes each second because the provider ticks `done` while running.
  const etaMs = scan != null ? scan.startedAt + scan.durationMs - Date.now() : 0

  return (
    <AnimatePresence>
      {scan != null && (
        <motion.div
          key="scan-banner"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: transitionEnter() }}
          exit={{ opacity: 0, y: -8, transition: transitionExit() }}
          className="sticky top-0 z-30 w-full border-b border-neutral-primary bg-card transition-colors duration-300 ease-standard"
        >
          <div className="flex w-full items-center gap-3 px-6 py-2.5">
            {isDone ? (
              <CheckCircleIcon className="size-6 shrink-0 text-icon-brand" />
            ) : (
              <LoadingCircle size="sm" aria-label={t.scanningSub} />
            )}

            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
              <span className="text-label-big font-semibold text-primary">
                {isDone ? t.doneTitle : t.scanning(scan.brandName)}
              </span>
              <span className="truncate text-label-medium text-tertiary">
                {isDone ? t.doneSub : t.scanningSub}
              </span>
            </div>

            {isDone ? (
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/brands/${scan.brandId}/results`}
                  onClick={dismiss}
                  className="rounded-token-8 px-2 py-1 text-action-small font-medium text-brand-token underline-offset-2 transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
                >
                  {t.viewResults}
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label={t.dismiss}
                  className="flex size-7 items-center justify-center rounded-token-8 text-icon-dark-gray transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed hover:text-primary"
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>
            ) : (
              <span className="shrink-0 whitespace-nowrap text-label-medium font-medium text-secondary tabular-nums">
                {t.checks(scan.done, scan.total)}
                <span className="text-tertiary"> · {t.etaLeft(formatEta(etaMs))}</span>
              </span>
            )}
          </div>

          {/* Progress hairline flush to the banner's bottom edge. */}
          <div className="px-6 pb-2">
            <ProgressBar progress={pct} thickness={4} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
