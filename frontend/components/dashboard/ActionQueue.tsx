'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { Card, Section } from '@/components/dashboard/primitives'
import { Chip, LoadingCircle } from '@/components/ui'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/cn'
import type { GapRow } from '@/lib/analytics'

/**
 * "Do this next" action queue (FN-3). Composes, CLIENT-SIDE, the highest-leverage
 * actions from three signals the frontend already reaches:
 *   - content gaps (passed in from /analytics)
 *   - failing GEO audit checks (POST /tools/geo-score on the brand website)
 *   - semantic concept gaps (GET /analytics/semantic-proximity)
 * It ranks them by impact and renders one prioritized checklist. No backend
 * change; a scored "do next" endpoint would be a later optimization.
 */

type Impact = 'high' | 'medium' | 'low'

interface GeoCheck {
  label: string
  passed: boolean
  impact: Impact
  recommendation: string
}
interface GeoResult {
  score: number
  checks: GeoCheck[]
}
interface ConceptScore {
  concept: string
}
interface SemanticResult {
  totalMentions: number
  gaps?: ConceptScore[]
}

interface Action {
  id: string
  title: string
  impact: Impact
  href: string
}

const IMPACT_RANK: Record<Impact, number> = { high: 0, medium: 1, low: 2 }
const IMPACT_DOT: Record<Impact, string> = {
  high: 'bg-icon-error',
  medium: 'bg-icon-warning',
  low: 'bg-icon-light-gray',
}
const IMPACT_CHIP: Record<Impact, 'error' | 'warning' | 'neutral'> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
}

const COPY = {
  id: {
    title: 'Lakukan Berikutnya',
    hint: 'Daftar prioritas dari audit halaman, peluang konten, dan celah semantik brand Anda.',
    fixPage: (label: string): string => `Perbaiki halaman: ${label}`,
    createContent: (q: string): string => `Buat konten untuk: ${q}`,
    addConcept: (c: string): string => `Tambahkan konten tentang: ${c}`,
    impact: { high: 'dampak tinggi', medium: 'dampak sedang', low: 'dampak rendah' } as Record<Impact, string>,
    allClear: 'Tidak ada tindakan mendesak. Pertahankan.',
  },
  en: {
    title: 'Do This Next',
    hint: "A prioritized list from your page audit, content opportunities, and semantic gaps.",
    fixPage: (label: string): string => `Fix on-page: ${label}`,
    createContent: (q: string): string => `Create content for: ${q}`,
    addConcept: (c: string): string => `Add content about: ${c}`,
    impact: { high: 'high impact', medium: 'medium impact', low: 'low impact' } as Record<Impact, string>,
    allClear: 'No urgent actions. Keep it up.',
  },
} as const

function mergeActions(prev: Action[], next: Action[]): Action[] {
  const seen = new Set(prev.map((a) => a.id))
  return [...prev, ...next.filter((a) => !seen.has(a.id))]
}

export function ActionQueue({
  brandId,
  website,
  gaps,
}: {
  brandId: string
  website: string
  gaps: GapRow[]
}): ReactElement | null {
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [actions, setActions] = useState<Action[]>([])
  const [enriching, setEnriching] = useState<boolean>(false)
  const [inView, setInView] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Content gaps render immediately (already loaded by the Overview).
  useEffect(() => {
    const gapActions: Action[] = gaps
      .filter((g) => g.text.trim() !== '')
      .slice(0, 5)
      .map((g) => ({
        id: `gap-${g.promptId}`,
        title: t.createContent(g.text),
        impact: (g.mentionRate < 10 ? 'high' : 'medium') as Impact,
        href: `/brands/${brandId}/articles?promptId=${g.promptId}`,
      }))
    setActions(gapActions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, gaps, lang])

  // The audit + semantic-proximity calls are among the slowest backend
  // endpoints, so defer them until this section scrolls into view.
  useEffect(() => {
    const el = containerRef.current
    if (el == null || inView) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  // 2) + 3) Audit + semantic stream in (once visible) as they resolve.
  useEffect(() => {
    if (!inView) return
    let cancelled = false
    setEnriching(true)

    const auditPromise = website
      ? apiFetch<GeoResult>(`/brands/${brandId}/articles/tools/geo-score`, {
          method: 'POST',
          body: JSON.stringify({ url: website }),
        })
          .then((r) => {
            if (cancelled) return
            const auditActions: Action[] = r.checks
              .filter((c) => !c.passed)
              .map((c) => ({
                id: `audit-${c.label}`,
                title: t.fixPage(c.label),
                impact: c.impact,
                href: `/brands/${brandId}/tools`,
              }))
            setActions((prev) => mergeActions(prev, auditActions))
          })
          .catch(() => {})
      : Promise.resolve()

    const semanticPromise = apiFetch<SemanticResult>(`/brands/${brandId}/analytics/semantic-proximity`)
      .then((r) => {
        if (cancelled) return
        const conceptActions: Action[] = (r.gaps ?? []).slice(0, 4).map((c) => ({
          id: `concept-${c.concept}`,
          title: t.addConcept(c.concept),
          impact: 'low' as Impact,
          href: `/brands/${brandId}/semantic`,
        }))
        setActions((prev) => mergeActions(prev, conceptActions))
      })
      .catch(() => {})

    Promise.allSettled([auditPromise, semanticPromise]).then(() => {
      if (!cancelled) setEnriching(false)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, brandId, website, lang])

  const ranked = [...actions].sort((a, b) => IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact]).slice(0, 8)

  return (
    <div ref={containerRef} className="w-full">
      <Section
        title={t.title}
        help={t.hint}
        right={enriching ? <LoadingCircle size="sm" /> : undefined}
      >
        <Card className="flex flex-col divide-y divide-neutral-primary">
          {ranked.length === 0 && !enriching && inView ? (
            <div className="px-5 py-4 text-paragraph-medium text-tertiary">{t.allClear}</div>
          ) : (
            ranked.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className="group flex items-center gap-3 px-5 py-3 outline-none transition-colors duration-200 ease-standard hover:bg-secondary focus-visible:bg-secondary"
              >
                <span className={cn('size-2 shrink-0 rounded-circle', IMPACT_DOT[a.impact])} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-paragraph-medium text-primary">{a.title}</span>
                <Chip type={IMPACT_CHIP[a.impact]} size="sm" shape="rounded" className="shrink-0">
                  {t.impact[a.impact]}
                </Chip>
                <ArrowRight
                  className="size-4 shrink-0 text-tertiary transition-colors duration-200 ease-standard group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            ))
          )}
        </Card>
      </Section>
    </div>
  )
}
