'use client'

import { useEffect, useState, type ReactElement } from 'react'
import { Clock } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { Popover } from '@/components/ui'
import { QuestionIcon } from '@/components/onboarding/icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * Data-freshness indicator. The dashboard numbers are NOT live: they are a
 * snapshot from scheduled scans (daily or weekly depending on plan) plus manual
 * scans. This surfaces a concrete "Updated X ago" from the most recent stored
 * result, with a tooltip spelling out the cadence, so "realtime" is never
 * implied. Renders nothing until a scan exists.
 */

const COPY = {
  id: {
    updated: (rel: string): string => `Diperbarui ${rel}`,
    helpLabel: 'Tentang kesegaran data',
    tooltip:
      'Angka ini snapshot dari scan, bukan data langsung. Scan berjalan terjadwal (harian atau mingguan tergantung paket) dan saat Anda menjalankannya manual.',
    justNow: 'baru saja',
    min: (n: number): string => `${n} menit lalu`,
    hour: (n: number): string => `${n} jam lalu`,
    day: (n: number): string => `${n} hari lalu`,
    week: (n: number): string => `${n} minggu lalu`,
  },
  en: {
    updated: (rel: string): string => `Updated ${rel}`,
    helpLabel: 'About data freshness',
    tooltip:
      'These numbers are a snapshot, not live data. Scans run on a schedule (daily or weekly depending on your plan) and whenever you run one manually.',
    justNow: 'just now',
    min: (n: number): string => `${n} minute${n === 1 ? '' : 's'} ago`,
    hour: (n: number): string => `${n} hour${n === 1 ? '' : 's'} ago`,
    day: (n: number): string => `${n} day${n === 1 ? '' : 's'} ago`,
    week: (n: number): string => `${n} week${n === 1 ? '' : 's'} ago`,
  },
} as const

/** Coarse relative time (minutes/hours/days/weeks) in the active language. */
function formatRelative(dateStr: string, t: (typeof COPY)['id' | 'en']): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.max(0, Math.floor(diffMs / 60_000))
  if (mins < 1) return t.justNow
  if (mins < 60) return t.min(mins)
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t.hour(hours)
  const days = Math.floor(hours / 24)
  if (days < 7) return t.day(days)
  return t.week(Math.floor(days / 7))
}

export function DataFreshness({ brandId }: { brandId: string }): ReactElement | null {
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ results: { queriedAt: string }[] }>(`/brands/${brandId}/results?page=1&limit=1`)
      .then((r) => {
        if (!cancelled) setUpdatedAt(r.results[0]?.queriedAt ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId])

  if (!updatedAt) return null

  return (
    <span className="inline-flex items-center gap-1.5 text-label-medium font-medium text-tertiary transition-colors duration-200 ease-standard">
      <Clock className="size-4 shrink-0" aria-hidden="true" />
      <span>{t.updated(formatRelative(updatedAt, t))}</span>
      <Popover label={t.helpLabel} content={t.tooltip} side="bottom">
        <QuestionIcon className="size-4" />
      </Popover>
    </span>
  )
}
