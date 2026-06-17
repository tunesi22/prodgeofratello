'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import { Button, ProgressBar } from '@/components/ui'
import { PageContainer, Card, ErrorBanner, Skeleton } from '@/components/dashboard/primitives'
import { DeltaBadge } from '@/components/dashboard/DeltaBadge'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { useLanguage } from '@/components/providers/LanguageProvider'
import {
  type Analytics,
  modelLabel,
  weekOverWeekDelta,
  aggregateSentiment,
  rateForModel,
  topOpportunities,
} from '@/lib/analytics'

/**
 * Client-facing "AI Visibility Report" (FN-1). Print-optimized, built entirely
 * from GET /brands/{id}/analytics, no backend changes. "Print / Save PDF" uses
 * the browser print dialog; print styles in globals.css hide the app shell.
 */

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
}

const SENTIMENT_COLORS = {
  positive: 'var(--icon-brand)',
  neutral: 'var(--icon-light-gray)',
  negative: 'var(--icon-error)',
} as const

const COPY = {
  id: {
    title: 'Laporan Visibilitas AI',
    generatedOn: (d: string): string => `Dibuat ${d}`,
    print: 'Cetak / Simpan PDF',
    noData: 'Belum ada data scan untuk brand ini. Jalankan scan terlebih dahulu.',
    headline: (rate: number): string => `Brand Anda muncul di ${rate}% jawaban AI`,
    vsLastWeek: 'vs minggu lalu',
    totalQueries: 'Total Pertanyaan',
    totalMentions: 'Total Sebutan',
    bestModel: 'Model Terbaik',
    worstModel: 'Model Terlemah',
    byModel: 'Mention Rate per Model AI',
    rowStats: (m: number, q: number): string => `${m} sebutan dari ${q} pertanyaan`,
    sentiment: 'Sentimen Sebutan',
    positive: 'Positif',
    neutral: 'Netral',
    negative: 'Negatif',
    trend: 'Tren Mention Rate',
    trendSummary: (a: number, b: number, n: number): string =>
      `${a}% menjadi ${b}% dalam ${n} minggu terakhir`,
    opportunities: 'Peluang Konten Teratas',
    opportunitiesHint:
      'Pertanyaan yang jarang menyebut brand Anda. Buat konten untuk topik ini agar lebih sering disebut.',
    footer: 'Dibuat dengan Fratello',
  },
  en: {
    title: 'AI Visibility Report',
    generatedOn: (d: string): string => `Generated ${d}`,
    print: 'Print / Save PDF',
    noData: 'No scan data yet for this brand. Run a scan first.',
    headline: (rate: number): string => `Your brand appears in ${rate}% of AI answers`,
    vsLastWeek: 'vs last week',
    totalQueries: 'Total Questions',
    totalMentions: 'Total Mentions',
    bestModel: 'Best Model',
    worstModel: 'Worst Model',
    byModel: 'Mention Rate by AI Model',
    rowStats: (m: number, q: number): string => `${m} mentions of ${q} questions`,
    sentiment: 'Mention Sentiment',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    trend: 'Mention Rate Trend',
    trendSummary: (a: number, b: number, n: number): string =>
      `${a}% to ${b}% over the last ${n} weeks`,
    opportunities: 'Top Content Opportunities',
    opportunitiesHint:
      'Questions that rarely mention your brand. Create content for these to get mentioned more.',
    footer: 'Made with Fratello',
  },
} as const

function rateText(rate: number): string {
  if (rate >= 60) return 'text-brand-token'
  if (rate >= 40) return 'text-warning-token'
  return 'text-error-token'
}

/** Tiny pure-SVG sparkline of the weekly mention rate (print-safe, no recharts). */
function Sparkline({ points }: { points: number[] }): ReactElement | null {
  if (points.length < 2) return null
  const w = 240
  const h = 48
  const pad = 4
  const step = (w - pad * 2) / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = pad + i * step
    const y = h - pad - (Math.min(100, Math.max(0, p)) / 100) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-60 shrink-0" role="img" aria-hidden="true">
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke="var(--icon-brand)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ReportPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [brand, setBrand] = useState<Brand | null>(null)
  const [data, setData] = useState<Analytics | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<Brand>(`/brands/${id}`),
      apiFetch<Analytics>(`/brands/${id}/analytics`),
    ])
      .then(([b, a]) => {
        setBrand(b)
        setData(a)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const reportDate = new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (loading) {
    return (
      <PageContainer wide>
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    )
  }

  if (error !== '' || brand == null || data == null) {
    return (
      <PageContainer wide>
        <ErrorBanner message={error || t.noData} />
      </PageContainer>
    )
  }

  const hasData = data.overall.totalQueries > 0
  const wow = hasData ? weekOverWeekDelta(data.trends) : null
  const sentiment = hasData ? aggregateSentiment(data.sentiment) : null
  const opportunities = hasData
    ? topOpportunities(data.gaps, 5).filter((g) => g.text.trim() !== '')
    : []
  const trendRates = data.trends.map((p) => p.mentionRate)
  const sentPct = (n: number): number =>
    sentiment != null && sentiment.total > 0 ? Math.round((n / sentiment.total) * 100) : 0

  return (
    <PageContainer wide>
      {/* Report header */}
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <FratelloLogo className="h-8 w-[52px] text-icon-brand" />
          <div className="flex flex-col">
            <h1 className="text-h4 font-semibold text-primary">{t.title}</h1>
            <span className="text-paragraph-medium text-tertiary">{t.generatedOn(reportDate)}</span>
          </div>
        </div>
        <Button type="primary-outlined" size="sm" onClick={() => window.print()} className="print:hidden">
          {t.print}
        </Button>
      </div>

      {/* Brand identity */}
      <Card variant="brand" className="flex flex-col gap-1 p-6">
        <span className="text-h5 font-semibold text-primary">{brand.name}</span>
        <span className="text-paragraph-medium text-secondary">
          {brand.website} · {brand.industry}
        </span>
      </Card>

      {!hasData ? (
        <Card className="p-6 text-paragraph-medium text-tertiary">{t.noData}</Card>
      ) : (
        <>
          {/* Headline */}
          <Card className="flex flex-col gap-2 p-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-h3 font-semibold text-primary">{t.headline(data.overall.mentionRate)}</h2>
              {wow != null && wow.value != null && <DeltaBadge delta={wow} suffix={t.vsLastWeek} />}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              <ReportStat label={t.totalQueries} value={`${data.overall.totalQueries}`} />
              <ReportStat label={t.totalMentions} value={`${data.overall.mentionCount}`} />
              <ReportStat
                label={t.bestModel}
                value={modelLabel(data.bestModel)}
                caption={(() => {
                  const r = rateForModel(data.byModel, data.bestModel)
                  return r != null ? `${r}%` : undefined
                })()}
              />
              <ReportStat
                label={t.worstModel}
                value={modelLabel(data.worstModel)}
                caption={(() => {
                  const r = rateForModel(data.byModel, data.worstModel)
                  return r != null ? `${r}%` : undefined
                })()}
              />
            </div>
          </Card>

          {/* By-model + sentiment + trend */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="flex flex-col gap-3 p-5">
              <span className="text-label-big font-medium text-primary">{t.byModel}</span>
              <div className="flex flex-col gap-3">
                {data.byModel.map((row) => (
                  <div key={row.model} className="flex flex-wrap items-center gap-3">
                    <span className="flex w-28 shrink-0 items-center gap-2 text-label-medium font-medium text-primary">
                      <ModelLogo model={row.model} className="size-4" />
                      {modelLabel(row.model)}
                    </span>
                    <div className="min-w-24 flex-1">
                      <ProgressBar progress={row.mentionRate} thickness={4} />
                    </div>
                    <span className={`shrink-0 text-label-medium font-semibold tabular-nums ${rateText(row.mentionRate)}`}>
                      {row.mentionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <span className="text-label-big font-medium text-primary">{t.sentiment}</span>
              {sentiment != null && sentiment.total > 0 ? (
                <>
                  <div className="flex h-3 w-full overflow-hidden rounded-circle bg-secondary">
                    <span style={{ width: `${sentPct(sentiment.positive)}%`, background: SENTIMENT_COLORS.positive }} />
                    <span style={{ width: `${sentPct(sentiment.neutral)}%`, background: SENTIMENT_COLORS.neutral }} />
                    <span style={{ width: `${sentPct(sentiment.negative)}%`, background: SENTIMENT_COLORS.negative }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: t.positive, value: sentiment.positive, color: SENTIMENT_COLORS.positive },
                      { label: t.neutral, value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
                      { label: t.negative, value: sentiment.negative, color: SENTIMENT_COLORS.negative },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className="size-3 shrink-0 rounded-circle" style={{ background: s.color }} aria-hidden="true" />
                        <span className="flex-1 text-paragraph-medium text-secondary">{s.label}</span>
                        <span className="text-label-medium font-medium text-primary tabular-nums">
                          {sentPct(s.value)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-paragraph-medium text-tertiary">{t.noData}</span>
              )}
            </Card>
          </div>

          {/* Trend */}
          {trendRates.length > 1 && (
            <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex flex-col gap-1">
                <span className="text-label-big font-medium text-primary">{t.trend}</span>
                <span className="text-paragraph-medium text-tertiary">
                  {t.trendSummary(trendRates[0], trendRates[trendRates.length - 1], trendRates.length)}
                </span>
              </div>
              <Sparkline points={trendRates} />
            </Card>
          )}

          {/* Opportunities */}
          {opportunities.length > 0 && (
            <Card className="flex flex-col gap-3 p-5">
              <div className="flex flex-col gap-1">
                <span className="text-label-big font-medium text-primary">{t.opportunities}</span>
                <span className="text-paragraph-medium text-tertiary">{t.opportunitiesHint}</span>
              </div>
              <div className="flex flex-col divide-y divide-neutral-primary">
                {opportunities.map((g) => (
                  <div key={g.promptId} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0 flex-1 text-paragraph-medium text-primary">{g.text}</span>
                    <span className="shrink-0 text-label-medium font-semibold tabular-nums text-error-token">
                      {g.mentionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="flex w-full items-center gap-2 pt-2 text-label-medium text-tertiary">
        <FratelloLogo className="h-4 w-[26px] text-icon-light-gray" />
        {t.footer} · {reportDate}
      </div>
    </PageContainer>
  )
}

function ReportStat({
  label,
  value,
  caption,
}: {
  label: string
  value: string
  caption?: string
}): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label-medium font-medium text-tertiary">{label}</span>
      <span className="text-h5 font-semibold text-primary">{value}</span>
      {caption != null && <span className="text-paragraph-medium text-secondary">{caption}</span>}
    </div>
  )
}
