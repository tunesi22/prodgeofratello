'use client'

import { Fragment, useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line, ReferenceLine,
} from 'recharts'
import { ArrowRight, SmileyBlank } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import {
  PageContainer, PageHeader, Section, Card, StatCard, EmptyState, ErrorBanner, Skeleton,
} from '@/components/dashboard/primitives'
import { SortableTable, type Column } from '@/components/dashboard/SortableTable'
import { DeltaBadge } from '@/components/dashboard/DeltaBadge'
import { DataFreshness } from '@/components/dashboard/DataFreshness'
import { ModelLogo, modelKeyByLabel, getModelMark } from '@/components/dashboard/ModelLogo'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button, Chip, Popover } from '@/components/ui'
import { LockIcon } from '@/components/onboarding/icons'
import { categoryMeta } from '@/lib/categories'
import { ChartBarsIcon } from '@/components/dashboard/nav-icons'
import { fadeUp } from '@/lib/motion'
import { useLanguage } from '@/components/providers/LanguageProvider'
import {
  type Analytics, type GapRow, type TrendPoint, type ProjectedSeries,
  modelLabel, weekOverWeekDelta, aggregateSentiment, sentimentByModel, modelGap, rateForModel,
  projectCompetitorTrends, formatNum,
} from '@/lib/analytics'

// Categorical line palette for the competitor comparison: DS CSS vars only
// (theme-aware, no hex literals). Index 0 is the brand's own hero line (green);
// competitors take distinct hues that read clearly against it.
const LINE_COLORS: string[] = [
  'var(--icon-brand)',        // your brand (hero green)
  'var(--color-warning-500)', // competitor — orange
  'var(--color-neutral-400)', // competitor — gray
  'var(--color-error-500)',   // competitor — red
  'var(--color-brand-300)',   // competitor — sage
]
const lineColor = (i: number): string => LINE_COLORS[i % LINE_COLORS.length]

/** Recharts dataKey for a brand's dashed projection segment (last real → next). */
const projKey = (brandId: string): string => `${brandId}::proj`
const SENTIMENT_COLORS = {
  positive: 'var(--icon-brand)',
  neutral: 'var(--icon-light-gray)',
  negative: 'var(--icon-error)',
} as const

const CHART_HEIGHT = 220
// Competitor comparison is full width, so it gets more vertical room too.
const COMPARE_HEIGHT = 300

const AXIS_TICK = { fontSize: 13, fill: 'var(--text-tertiary)' }
const AXIS_TICK_SM = { fontSize: 13, fill: 'var(--text-tertiary)' }
const AXIS_LINE = { stroke: 'var(--border-neutral-primary)' }
const GRID_STROKE = 'var(--border-neutral-primary)'
const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-neutral-primary)',
  color: 'var(--text-primary)',
  borderRadius: 12,
}
const TOOLTIP_LABEL_STYLE = { color: 'var(--text-primary)' }
const TOOLTIP_ITEM_STYLE = { color: 'var(--text-secondary)' }
const BAR_CURSOR = { fill: 'var(--display-neutral)', fillOpacity: 0.35 }
const percentFormatter = (value: number | string): string => `${value}%`

// ── Trend axis: turn ISO week+year into real, human dates ──────────────────────
// The backend labels weeks as "W20 2026" (ISO week), which users do not read as a
// date. We convert to the week's Monday and show "12 Mei" / "May 12" instead.
function isoWeekStart(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const day = jan4.getUTCDay() || 7 // Mon=1..Sun=7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - (day - 1) + (week - 1) * 7)
  return monday
}

function localeFor(lang: 'id' | 'en'): string {
  return lang === 'id' ? 'id-ID' : 'en-US'
}

/** Short axis label, e.g. "12 Mei" / "May 12". Falls back to the raw label.
 *  Structural param so it serves both trend points and competitor periods. */
function weekDateShort(point: { label: string; week?: number; year?: number }, lang: 'id' | 'en'): string {
  if (point.year == null || point.week == null) return point.label
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(isoWeekStart(point.year, point.week))
}

/** Full date for the tooltip, e.g. "12 Mei 2026" / "May 12, 2026". */
function weekDateLong(point: TrendPoint, lang: 'id' | 'en'): string {
  if (point.year == null || point.week == null) return point.label
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(isoWeekStart(point.year, point.week))
}

/** Custom trend tooltip: human week date + mention rate + mentioned/total. */
function TrendTooltip({
  active,
  payload,
  lang,
  t,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: TrendPoint }>
  lang: 'id' | 'en'
  t: {
    weekOf: (d: string) => string
    tipRateLabel: string
    tipMentions: (mentioned: number, total: number) => string
  }
}): ReactElement | null {
  const point = active ? payload?.[0]?.payload : undefined
  if (point == null) return null
  return (
    <div className="flex flex-col gap-0.5 rounded-token-12 border border-neutral-primary bg-card px-3 py-2 shadow-regular-md">
      <span className="text-label-medium font-medium text-primary">{t.weekOf(weekDateLong(point, lang))}</span>
      <span className="text-paragraph-medium text-secondary">
        <span className="font-semibold tabular-nums text-brand-token">{formatNum(point.mentionRate)}%</span> {t.tipRateLabel}
      </span>
      <span className="text-paragraph-medium tabular-nums text-tertiary">
        {t.tipMentions(point.mentioned, point.total)}
      </span>
    </div>
  )
}

/**
 * Multi-series tooltip for the competitor comparison. Reads the hovered row once
 * and lists every brand's value (whether it came from the solid history line or
 * the dashed projection line), brand-colored, marking the user's own brand.
 */
function CompareTooltip({
  active,
  payload,
  series,
  t,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: Record<string, number | string | null> }>
  series: ProjectedSeries[]
  t: { youTag: string }
}): ReactElement | null {
  const row = active ? payload?.[0]?.payload : undefined
  if (row == null) return null
  return (
    <div className="flex min-w-[180px] flex-col gap-1 rounded-token-12 border border-neutral-primary bg-card px-3 py-2 shadow-regular-md">
      <span className="text-label-medium font-medium text-primary">{String(row.x)}</span>
      {series.map((s, i) => {
        const value = row[s.brandId] ?? row[projKey(s.brandId)]
        if (value == null) return null
        return (
          <span key={s.brandId} className="flex items-center justify-between gap-4 text-paragraph-medium">
            <span className="flex items-center gap-2 text-secondary">
              <span
                className="size-2.5 shrink-0 rounded-circle"
                style={{ background: lineColor(i) }}
                aria-hidden="true"
              />
              {s.name}
              {s.isMain ? ` (${t.youTag})` : ''}
            </span>
            <span className="font-semibold tabular-nums text-primary">{value}%</span>
          </span>
        )
      })}
    </div>
  )
}

const COPY = {
  id: {
    title: 'Analitik AI',
    subtitle: 'Seberapa sering AI menyebut brand Anda dan bagaimana sentimennya.',
    emptyTitle: 'Belum ada data',
    emptyDesc: 'Jalankan scan terlebih dahulu, hasil analitiknya akan muncul di sini.',
    statOverall: 'Mention Rate Keseluruhan',
    statQueries: 'Total Pertanyaan Dicek',
    statBest: 'Model Terbaik',
    statWorst: 'Model Terlemah',
    vsLastWeek: 'vs minggu lalu',
    reportButton: 'Buat Laporan',
    gapSuffix: (g: number): string => `selisih ${g}% antar model`,
    secByModel: 'Mention Rate per Model',
    secByModelHint: 'Seberapa sering brand Anda disebut dalam jawaban tiap model AI.',
    secCompare: 'Perbandingan Kompetitor',
    secCompareHint: 'Bandingkan mention rate brand Anda dengan kompetitor dari waktu ke waktu, lengkap dengan proyeksi arah tiap brand di periode berikutnya.',
    compareFallback: 'Butuh minimal dua brand dengan data beberapa minggu untuk membandingkan kompetitor. Tambahkan project untuk tiap brand kompetitor lalu jalankan scan.',
    projectedLabel: 'Proyeksi',
    youTag: 'Anda',
    secTrend: 'Mention Rate dari Waktu ke Waktu',
    secTrendHint: 'Perubahan seberapa sering brand Anda disebut dari minggu ke minggu.',
    secSentiment: 'Sentimen Keseluruhan',
    secSentimentHint:
      'Positif berarti AI merekomendasikan brand Anda, netral berarti hanya menyebut tanpa penilaian, negatif berarti AI menilai kurang baik. Targetnya memperbanyak yang positif.',
    sentByModel: 'Sentimen per Model',
    totalMentionsLabel: 'sebutan',
    sentEmptyTitle: 'Belum ada data sentimen',
    sentEmptyDesc: 'Jalankan scan supaya kami bisa menganalisis bagaimana AI membicarakan brand Anda.',
    sentPositive: 'Positif',
    sentNeutral: 'Netral',
    sentNegative: 'Negatif',
    sentMentions: (n: number): string => `${n} sebutan`,
    secGaps: 'Peluang Konten',
    gapsChip: (n: number): string => `${n} peluang`,
    gapsHint:
      'Pertanyaan yang jawaban AI-nya jarang menyebut brand Anda (di bawah 20%). Ini topik terbaik untuk konten baru agar brand Anda lebih sering disebut.',
    thPrompt: 'Pertanyaan',
    thCategory: 'Kategori',
    thQueries: 'Jumlah Cek',
    thRate: 'Mention Rate',
    thAction: 'Aksi',
    generate: 'Buat konten',
    pageOf: (p: number, t: number): string => `Halaman ${p} dari ${t}`,
    prev: 'Sebelumnya',
    next: 'Berikutnya',
    seriesMentionRate: 'Mention Rate',
    trendFallback: 'Butuh data dari beberapa minggu untuk menampilkan tren.',
    weekOf: (d: string): string => `Pekan ${d}`,
    tipRateLabel: 'mention rate',
    tipMentions: (mentioned: number, total: number): string =>
      `${mentioned} dari ${total} pertanyaan menyebut brand Anda`,
    tfLabel: 'Rentang waktu',
    tfDaily: 'Harian',
    tfWeekly: 'Mingguan',
    tfMonthly: 'Bulanan',
    tfSoon: 'Segera hadir',
  },
  en: {
    title: 'Agents Insights',
    subtitle: 'How often AI mentions your brand and the sentiment behind it.',
    emptyTitle: 'No data yet',
    emptyDesc: 'Run a scan first and your analytics will show up here.',
    statOverall: 'Overall Mention Rate',
    statQueries: 'Total Queries Checked',
    statBest: 'Best Model',
    statWorst: 'Worst Model',
    vsLastWeek: 'vs last week',
    reportButton: 'Generate Report',
    gapSuffix: (g: number): string => `${g}% spread across models`,
    secByModel: 'Mention Rate by Model',
    secByModelHint: 'How often your brand shows up in the answers from each AI model.',
    secCompare: 'Competitor Comparison',
    secCompareHint: 'How your mention rate stacks up against competitors over time, with a projection of where each brand is heading next.',
    compareFallback: 'Need at least two brands with a few weeks of data to compare competitors. Add a project for each competitor brand and run a scan.',
    projectedLabel: 'Projected',
    youTag: 'You',
    secTrend: 'Mention Rate Over Time',
    secTrendHint: 'How often your brand gets mentioned, week by week.',
    secSentiment: 'Overall Sentiment',
    secSentimentHint:
      'Positive means AI recommends your brand, neutral means it just mentions you, negative means AI rates you poorly. The goal is to grow the positive share.',
    sentByModel: 'Sentiment by Model',
    totalMentionsLabel: 'mentions',
    sentEmptyTitle: 'No sentiment data yet',
    sentEmptyDesc: 'Run a scan so we can analyze how AI talks about your brand.',
    sentPositive: 'Positive',
    sentNeutral: 'Neutral',
    sentNegative: 'Negative',
    sentMentions: (n: number): string => `${n} mentions`,
    secGaps: 'Content Opportunities',
    gapsChip: (n: number): string => `${n} ${n === 1 ? 'opportunity' : 'opportunities'}`,
    gapsHint:
      'Questions where AI rarely mentions your brand (under 20%). These are the best topics for new content that helps AI mention you more often.',
    thPrompt: 'Question',
    thCategory: 'Category',
    thQueries: 'Queries',
    thRate: 'Mention Rate',
    thAction: 'Action',
    generate: 'Create content',
    pageOf: (p: number, t: number): string => `Page ${p} of ${t}`,
    prev: 'Previous',
    next: 'Next',
    seriesMentionRate: 'Mention Rate',
    trendFallback: 'Need data from multiple weeks to show the trend.',
    weekOf: (d: string): string => `Week of ${d}`,
    tipRateLabel: 'mention rate',
    tipMentions: (mentioned: number, total: number): string =>
      `${mentioned} of ${total} questions mention your brand`,
    tfLabel: 'Timeframe',
    tfDaily: 'Daily',
    tfWeekly: 'Weekly',
    tfMonthly: 'Monthly',
    tfSoon: 'Coming soon',
  },
} as const

/**
 * Timeframe segmented control. "Weekly" is the working view (the backend
 * aggregates trends by ISO week); Daily/Monthly are shown locked with a
 * "coming soon" popover until the backend supports other granularities.
 */
function TimeframeSelector({
  t,
}: {
  t: { tfLabel: string; tfDaily: string; tfWeekly: string; tfMonthly: string; tfSoon: string }
}): ReactElement {
  const locked = 'inline-flex items-center gap-1 rounded-token-4 px-2.5 py-1 text-label-medium font-medium'
  return (
    <div
      role="group"
      aria-label={t.tfLabel}
      className="inline-flex items-center gap-0.5 rounded-token-8 border border-neutral-primary bg-card p-0.5"
    >
      <Popover label={t.tfDaily} content={t.tfSoon} side="bottom">
        <span className={locked}>
          <LockIcon className="size-3.5" />
          {t.tfDaily}
        </span>
      </Popover>
      <span className="rounded-token-4 bg-display-brand px-2.5 py-1 text-label-medium font-medium text-brand-token">
        {t.tfWeekly}
      </span>
      <Popover label={t.tfMonthly} content={t.tfSoon} side="bottom">
        <span className={locked}>
          <LockIcon className="size-3.5" />
          {t.tfMonthly}
        </span>
      </Popover>
    </div>
  )
}

function ChartFallback({ message }: { message: string }): ReactElement {
  return (
    <div className="flex h-[220px] w-full items-center justify-center text-paragraph-medium text-tertiary">
      {message}
    </div>
  )
}

/**
 * Custom recharts X-axis tick: provider brand logo to the left of the model
 * name. Rendered as raw <path>/<text> (not a nested <svg>, which recharts will
 * not place) via the function form `tick={renderModelAxisTick}`.
 */
function renderModelAxisTick(props: {
  x?: number | string
  y?: number | string
  payload?: { value?: string | number }
}): ReactElement {
  const x = Number(props.x ?? 0)
  const y = Number(props.y ?? 0)
  const label = String(props.payload?.value ?? '')
  const key = modelKeyByLabel(label)
  const mark = key != null ? getModelMark(key) : null
  const logoSize = 15
  const gap = 6
  const scale = logoSize / 24
  // Center the [logo + gap + label] block under the bar (approx text width).
  const blockWidth = (mark != null ? logoSize + gap : 0) + label.length * 7.2
  const startX = x - blockWidth / 2
  const isGradient = mark?.color === 'gemini-gradient'
  const gradientId = `axis-gemini-${key ?? 'x'}`
  const fill =
    mark == null
      ? undefined
      : isGradient
        ? `url(#${gradientId})`
        : mark.color === 'currentColor'
          ? 'var(--text-primary)'
          : mark.color
  return (
    <g>
      {mark != null && (
        <>
          {isGradient && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#4285F4" />
                <stop offset="0.52" stopColor="#9B72CB" />
                <stop offset="1" stopColor="#D96570" />
              </linearGradient>
            </defs>
          )}
          <path d={mark.path} transform={`translate(${startX}, ${y + 2}) scale(${scale})`} fill={fill} />
        </>
      )}
      <text
        x={mark != null ? startX + logoSize + gap : x}
        y={y + 14}
        textAnchor={mark != null ? 'start' : 'middle'}
        fontSize={13}
        fill="var(--text-tertiary)"
      >
        {label}
      </text>
    </g>
  )
}

export default function AgentsInsightsPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    apiFetch<Analytics>(`/brands/${id}/analytics`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Filters + report only make sense once there is data to filter/report on.
  const hasData = data != null && data.overall.totalQueries > 0
  const header = (
    <PageHeader
      title={t.title}
      subtitle={t.subtitle}
      actions={
        hasData ? (
          <>
            <DataFreshness brandId={id} />
            <Button
              type="primary-outlined"
              size="sm"
              onClick={() => router.push(`/brands/${id}/report`)}
            >
              {t.reportButton}
            </Button>
          </>
        ) : undefined
      }
    />
  )

  if (loading) {
    return (
      <PageContainer wide>
        {header}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </motion.div>
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[280px] w-full" />)}
        </motion.div>
        <motion.div variants={fadeUp}><Skeleton className="h-[260px] w-full" /></motion.div>
      </PageContainer>
    )
  }

  if (error !== '') {
    return (
      <PageContainer wide>
        {header}
        <motion.div variants={fadeUp}><ErrorBanner message={error} /></motion.div>
      </PageContainer>
    )
  }

  if (data == null || data.overall.totalQueries === 0) {
    return (
      <PageContainer wide>
        {header}
        <EmptyState icon={<ChartBarsIcon />} title={t.emptyTitle} description={t.emptyDesc} />
      </PageContainer>
    )
  }

  const wow = weekOverWeekDelta(data.trends)
  const gap = modelGap(data.byModel)
  const bestRate = rateForModel(data.byModel, data.bestModel)
  const worstRate = rateForModel(data.byModel, data.worstModel)
  const sentiment = aggregateSentiment(data.sentiment)
  const sentByModel = sentimentByModel(data.sentiment)

  const mentionRateData = data.byModel.map((r) => ({
    name: modelLabel(r.model),
    [t.seriesMentionRate]: r.mentionRate,
  }))

  // Competitor comparison: forecast each brand's next-period mention rate, then
  // build multi-line chart rows (solid history + a dashed projection tail).
  const compareSeries = projectCompetitorTrends(data.competitorTrends ?? [])
  const compareReady = compareSeries.length >= 2 && compareSeries.some((s) => s.points.length >= 2)

  // Time axis = union of all brands' periods, ordered by (year, week).
  const periodKeyOf = (p: { label: string; week?: number; year?: number }): string =>
    p.week != null && p.year != null ? `${p.year}-${p.week}` : p.label
  const periodMap = new Map<string, { label: string; week?: number; year?: number }>()
  for (const s of compareSeries) {
    for (const p of s.points) {
      const key = periodKeyOf(p)
      if (!periodMap.has(key)) periodMap.set(key, { label: p.label, week: p.week, year: p.year })
    }
  }
  const periods = [...periodMap.entries()]
    .map(([key, p]) => ({ key, ...p }))
    .sort((a, b) => (a.year ?? 0) - (b.year ?? 0) || (a.week ?? 0) - (b.week ?? 0))
  const lastKey = periods[periods.length - 1]?.key
  const lastRealLabel = periods.length > 0 ? weekDateShort(periods[periods.length - 1], lang) : ''

  // One row per real period (each brand's rate). The projection line carries a
  // value only at the last real period (to anchor the dash) and the final
  // "Projected" row, so it renders as a single dashed tail off each line.
  const compareRows: Array<Record<string, number | string | null>> = periods.map((period) => {
    const row: Record<string, number | string | null> = { x: weekDateShort(period, lang) }
    for (const s of compareSeries) {
      const point = s.points.find((p) => periodKeyOf(p) === period.key)
      row[s.brandId] = point != null ? point.mentionRate : null
      row[projKey(s.brandId)] = period.key === lastKey ? s.current : null
    }
    return row
  })
  if (compareReady) {
    const projRow: Record<string, number | string | null> = { x: t.projectedLabel }
    for (const s of compareSeries) {
      projRow[s.brandId] = null
      projRow[projKey(s.brandId)] = s.projected
    }
    compareRows.push(projRow)
  }

  // Trend points with a human date label for the X axis (replaces "W20 2026").
  const trendData = data.trends.map((point) => ({ ...point, dateLabel: weekDateShort(point, lang) }))

  const sentimentDonut = [
    { name: t.sentPositive, value: sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: t.sentNeutral, value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: t.sentNegative, value: sentiment.negative, color: SENTIMENT_COLORS.negative },
  ].filter((s) => s.value > 0)

  const gapColumns: Column<GapRow>[] = [
    {
      key: 'text',
      header: t.thPrompt,
      className: 'min-w-[220px]',
      render: (g) => <p className="line-clamp-2 max-w-md text-paragraph-medium text-primary">{g.text}</p>,
    },
    {
      key: 'category',
      header: t.thCategory,
      sortValue: (g) => categoryMeta(g.category).label[lang],
      render: (g) => {
        const m = categoryMeta(g.category)
        return (
          <Chip type={m.tone} size="sm" shape="rounded">
            {m.label[lang]}
          </Chip>
        )
      },
    },
    {
      key: 'total',
      header: t.thQueries,
      align: 'right',
      sortValue: (g) => g.total,
      render: (g) => <span className="text-paragraph-medium text-secondary tabular-nums">{g.total}</span>,
    },
    {
      key: 'rate',
      header: t.thRate,
      align: 'right',
      sortValue: (g) => g.mentionRate,
      render: (g) => (
        <Chip type="warning" size="sm" shape="rounded" className="tabular-nums">
          {g.mentionRate}%
        </Chip>
      ),
    },
    {
      key: 'action',
      header: t.thAction,
      align: 'right',
      render: (g) => (
        <Link
          href={`/brands/${id}/articles?promptId=${g.promptId}`}
          className="inline-flex items-center gap-1 text-action-small font-medium text-brand-token underline-offset-2 transition-colors duration-200 ease-standard hover:underline"
        >
          {t.generate}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ),
    },
  ]

  return (
    <PageContainer wide>
      {header}

      {/* Stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t.statOverall}
          value={<span className="text-brand-token tabular-nums">{formatNum(data.overall.mentionRate)}%</span>}
          caption={<DeltaBadge delta={wow} suffix={t.vsLastWeek} />}
        />
        <StatCard label={t.statQueries} value={<span className="tabular-nums">{data.overall.totalQueries}</span>} />
        <StatCard
          label={t.statBest}
          value={
            <span className="inline-flex items-center gap-2">
              {data.bestModel != null && <ModelLogo model={data.bestModel} className="size-5" />}
              {modelLabel(data.bestModel)}
            </span>
          }
          caption={
            bestRate != null
              ? `${formatNum(bestRate)}%${gap != null ? ` · ${t.gapSuffix(gap)}` : ''}`
              : undefined
          }
        />
        <StatCard
          label={t.statWorst}
          value={
            <span className="inline-flex items-center gap-2">
              {data.worstModel != null && <ModelLogo model={data.worstModel} className="size-5" />}
              {modelLabel(data.worstModel)}
            </span>
          }
          caption={worstRate != null ? `${formatNum(worstRate)}%` : undefined}
        />
      </motion.div>

      {/* Trend (full width). The timeframe control lives here, next to the time
          chart it drives, instead of crowding the page header. */}
      <Section
        title={t.secTrend}
        help={t.secTrendHint}
        right={
          <div className="flex flex-wrap items-center gap-3">
            {wow.value != null && <DeltaBadge delta={wow} suffix={t.vsLastWeek} />}
            <TimeframeSelector t={t} />
          </div>
        }
      >
        <Card className="p-4">
          {data.trends.length > 1 ? (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <AreaChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  {/* Modern gradient fade under the line (brand green -> transparent). */}
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--icon-brand)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--icon-brand)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                {/* Horizontal-only guides; no hard axis lines for a cleaner look. */}
                <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={AXIS_TICK_SM}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  minTickGap={24}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={percentFormatter}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--border-neutral-secondary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={(props) => (
                    <TrendTooltip
                      active={props.active}
                      payload={props.payload as unknown as ReadonlyArray<{ payload?: TrendPoint }> | undefined}
                      lang={lang}
                      t={t}
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="mentionRate"
                  name={t.seriesMentionRate}
                  stroke="var(--icon-brand)"
                  strokeWidth={2.5}
                  fill="url(#trendFill)"
                  fillOpacity={1}
                  dot={{ r: 2.5, fill: 'var(--icon-brand)', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'var(--icon-brand)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartFallback message={t.trendFallback} />
          )}
        </Card>
      </Section>

      {/* Competitor comparison — full width and stretched; the multi-line chart
          plus projection needs the room (it was cramped at half width). */}
      <Section title={t.secCompare} help={t.secCompareHint}>
        <Card className="flex flex-col gap-3 p-4">
          {compareReady ? (
            <>
              <ResponsiveContainer width="100%" height={COMPARE_HEIGHT}>
                <LineChart data={compareRows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
                  <XAxis
                    dataKey="x"
                    tick={AXIS_TICK_SM}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={12}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={percentFormatter}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--border-neutral-secondary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={(props) => (
                      <CompareTooltip
                        active={props.active}
                        payload={
                          props.payload as unknown as
                            | ReadonlyArray<{ payload?: Record<string, number | string | null> }>
                            | undefined
                        }
                        series={compareSeries}
                        t={t}
                      />
                    )}
                  />
                  {/* Boundary between measured weeks and the projected tail. */}
                  {lastRealLabel !== '' && (
                    <ReferenceLine x={lastRealLabel} stroke="var(--border-neutral-secondary)" strokeDasharray="3 3" />
                  )}
                  {compareSeries.map((s, i) => (
                    <Fragment key={s.brandId}>
                      <Line
                        type="monotone"
                        dataKey={s.brandId}
                        name={s.name}
                        stroke={lineColor(i)}
                        strokeWidth={s.isMain ? 2.75 : 1.75}
                        dot={{ r: 2.5, fill: lineColor(i), strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: lineColor(i), stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={projKey(s.brandId)}
                        stroke={lineColor(i)}
                        strokeWidth={s.isMain ? 2.75 : 1.75}
                        strokeDasharray="5 5"
                        dot={{ r: 2.5, fill: lineColor(i), strokeWidth: 0 }}
                        activeDot={{ r: 4, fill: lineColor(i), stroke: 'var(--bg-card)', strokeWidth: 2 }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    </Fragment>
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {/* Legend in a responsive grid so it fills the full width. */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-neutral-primary pt-3 sm:grid-cols-2 lg:grid-cols-3">
                {compareSeries.map((s, i) => (
                  <div key={s.brandId} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-paragraph-medium">
                      <span
                        className="size-3 shrink-0 rounded-circle"
                        style={{ background: lineColor(i) }}
                        aria-hidden="true"
                      />
                      <span className={s.isMain ? 'font-semibold text-primary' : 'text-secondary'}>{s.name}</span>
                      {s.isMain && <Chip type="success" size="sm" shape="rounded">{t.youTag}</Chip>}
                    </span>
                    <span className="flex items-center gap-1.5 text-label-medium tabular-nums">
                      <span className="text-tertiary">{formatNum(s.current)}%</span>
                      <ArrowRight className="size-3.5 text-tertiary" aria-hidden="true" />
                      <span className="font-semibold text-primary">{formatNum(s.projected)}%</span>
                      {s.delta !== 0 && (
                        <span className={s.direction === 'up' ? 'text-brand-token' : 'text-error-token'}>
                          {s.delta > 0 ? '+' : ''}{formatNum(s.delta)}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <ChartFallback message={t.compareFallback} />
          )}
        </Card>
      </Section>

      {/* Mention rate by model + overall sentiment — balanced 2-col (even heights). */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title={t.secByModel} help={t.secByModelHint}>
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={mentionRateData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={renderModelAxisTick} axisLine={AXIS_LINE} tickLine={false} interval={0} />
                <YAxis domain={[0, 100]} tickFormatter={percentFormatter} tick={AXIS_TICK} axisLine={AXIS_LINE} tickLine={false} />
                <Tooltip formatter={percentFormatter} contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={BAR_CURSOR} />
                <Bar dataKey={t.seriesMentionRate} fill="var(--icon-brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Section>

        <Section title={t.secSentiment} help={t.secSentimentHint}>
          <Card className={sentiment.total === 0 ? 'flex justify-center p-4' : 'flex items-center gap-6 p-4'}>
            {sentiment.total === 0 ? (
              <EmptyState icon={<SmileyBlank />} title={t.sentEmptyTitle} description={t.sentEmptyDesc} />
            ) : (
              <>
                <div className="relative" style={{ width: '55%' }}>
                  <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <PieChart>
                      <Pie data={sentimentDonut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={84} paddingAngle={2}>
                        {sentimentDonut.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-h4 font-semibold text-primary tabular-nums">{sentiment.total}</span>
                    <span className="text-label-medium text-tertiary">{t.totalMentionsLabel}</span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {sentimentDonut.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="size-3 shrink-0 rounded-circle" style={{ background: s.color }} aria-hidden="true" />
                      <span className="flex-1 text-paragraph-medium text-secondary">{s.name}</span>
                      <span className="text-label-medium font-medium text-primary tabular-nums">
                        {sentiment.total > 0 ? Math.round((s.value / sentiment.total) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Section>
      </div>

      {/* Sentiment by model — full width (stacked bars read better stretched). */}
      <Section title={t.sentByModel} help={t.secByModelHint}>
        <Card className="flex flex-col divide-y divide-neutral-primary">
          {sentByModel.map((m) => (
            <div key={m.model} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-label-medium font-medium text-primary">
                  <ModelLogo model={m.model} className="size-4" />
                  {m.label}
                </span>
                <span className="text-paragraph-medium text-tertiary">{t.sentMentions(m.total)}</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-circle bg-secondary">
                <span style={{ width: `${m.positivePct}%`, background: SENTIMENT_COLORS.positive }} />
                <span style={{ width: `${m.neutralPct}%`, background: SENTIMENT_COLORS.neutral }} />
                <span style={{ width: `${m.negativePct}%`, background: SENTIMENT_COLORS.negative }} />
              </div>
              <div className="flex items-center gap-4 text-paragraph-medium text-tertiary tabular-nums">
                <span className="text-brand-token">{m.positivePct}% {t.sentPositive}</span>
                <span>{m.neutralPct}% {t.sentNeutral}</span>
                <span className="text-error-token">{m.negativePct}% {t.sentNegative}</span>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      {/* Content opportunities (sortable) */}
      {data.gaps.length > 0 && (
        <Section
          title={t.secGaps}
          help={t.gapsHint}
          right={<Chip type="warning" size="sm" shape="rounded">{t.gapsChip(data.gaps.length)}</Chip>}
        >
          <SortableTable
            columns={gapColumns}
            rows={data.gaps}
            rowKey={(g) => g.promptId}
            initialSort={{ key: 'rate', dir: 'asc' }}
            pageSize={8}
            caption={t.secGaps}
            paginationLabels={{ pageOf: t.pageOf, prev: t.prev, next: t.next }}
          />
        </Section>
      )}
    </PageContainer>
  )
}
