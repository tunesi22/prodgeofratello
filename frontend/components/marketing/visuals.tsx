'use client'

import type { ReactElement, ReactNode } from 'react'
import {
  TrendUp,
  TrendDown,
  CheckCircle,
  CircleNotch,
  Sparkle,
  LinkSimple,
  Warning,
} from '@phosphor-icons/react/dist/ssr'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { cn } from '@/lib/cn'

/**
 * Marketing product mockups — the "imagery" of the landing page.
 *
 * Token-built panels that mirror the actual Fratello dashboard (mention-rate
 * cards, 4-model rows, share-of-voice bars, GEO gauge, citations, article
 * preview). Client components: their labels follow the site language toggle via
 * MOCKUP_COPY, so the whole example switches to English when EN is selected.
 *
 * Marketing surface — free to use richer custom shadows/gradients than the
 * strict app DS, while staying on the Fratello green identity.
 */

const MODELS = [
  { id: 'openai', label: 'ChatGPT', rate: 71 },
  { id: 'perplexity', label: 'Perplexity', rate: 58 },
  { id: 'gemini', label: 'Gemini', rate: 64 },
  { id: 'anthropic', label: 'Claude', rate: 55 },
] as const

const MOCKUP_COPY = {
  id: {
    dashboard: 'Dasbor · Solea',
    analytics: 'Analitik · Solea',
    trackingQueue: 'Pelacakan · Antrian',
    live: 'Live',
    running: 'Berjalan',
    auto: 'Otomatis',
    mentionRate: 'Tingkat Penyebutan',
    totalQueries: 'Total Kueri',
    vsLastWeek: 'vs minggu lalu',
    tested5x: 'diuji 5x per model',
    shareOfVoice: 'Pangsa Suara',
    competitors: '5 kompetitor',
    competitorA: 'Kompetitor A',
    competitorB: 'Kompetitor B',
    others: 'Lainnya',
    perModel: 'Per model',
    scannedDone: 'Pemindaian 4 dari 4 model selesai',
    prompts: ['sepatu lari terbaik untuk pemula', 'rekomendasi sneakers harian pria', 'sepatu olahraga awet dan murah', 'brand sepatu lokal terbaik'],
    sentiment: 'Sentimen',
    positive: 'Positif',
    neutral: 'Netral',
    negative: 'Negatif',
    weeklyTrend: 'Tren mingguan',
    cited: 'dirujuk',
    articleTitle: 'Panduan memilih sepatu lari',
    markdown: 'Markdown',
    readyPublish: 'Siap terbit',
    yourBrand: 'Brand Anda',
    concepts: ['nyaman', 'tahan lama', 'sepatu lari', 'desain modern'],
    auditScore: 'Skor GEO',
    auditGood: 'Baik',
    auditPassed: '5 dari 6 lolos',
    auditItems: ['File llms.txt', 'Konfigurasi bot AI (Nginx)', 'Data terstruktur', 'Struktur heading', 'Kecepatan halaman', 'Sitemap & robots'],
    semanticHeader: 'Kedekatan semantik',
    gap: 'Celah',
    distImpact: 'Dampak visibilitas',
    published: 'Terbit',
    scheduled: 'Terjadwal',
    draft: 'Draf',
    mentions: 'sebutan',
    forum: 'Forum komunitas',
    articleWords: '1.200 kata',
    articleReadTime: '6 mnt baca',
    articleOutline: ['Pendahuluan', 'Cara memilih sepatu lari', 'Rekomendasi terbaik 2026', 'Kesimpulan'],
    articleTarget: 'Target pertanyaan',
  },
  en: {
    dashboard: 'Dashboard · Solea',
    analytics: 'Analytics · Solea',
    trackingQueue: 'Tracking · Queue',
    live: 'Live',
    running: 'Running',
    auto: 'Automatic',
    mentionRate: 'Mention Rate',
    totalQueries: 'Total Queries',
    vsLastWeek: 'vs last week',
    tested5x: 'tested 5x per model',
    shareOfVoice: 'Share of Voice',
    competitors: '5 competitors',
    competitorA: 'Competitor A',
    competitorB: 'Competitor B',
    others: 'Others',
    perModel: 'Per model',
    scannedDone: 'Scanned 4 of 4 models',
    prompts: ['best running shoes for beginners', 'everyday sneaker recommendations', 'durable affordable sport shoes', 'best local shoe brands'],
    sentiment: 'Sentiment',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    weeklyTrend: 'Weekly trend',
    cited: 'cited',
    articleTitle: 'How to choose running shoes',
    markdown: 'Markdown',
    readyPublish: 'Ready to publish',
    yourBrand: 'Your brand',
    concepts: ['comfortable', 'durable', 'running shoes', 'modern design'],
    auditScore: 'GEO score',
    auditGood: 'Good',
    auditPassed: '5 of 6 passed',
    auditItems: ['llms.txt file', 'AI bot config (Nginx)', 'Structured data', 'Heading structure', 'Page speed', 'Sitemap & robots'],
    semanticHeader: 'Semantic proximity',
    gap: 'Gap',
    distImpact: 'Visibility impact',
    published: 'Published',
    scheduled: 'Scheduled',
    draft: 'Draft',
    mentions: 'mentions',
    forum: 'Community forum',
    articleWords: '1,200 words',
    articleReadTime: '6 min read',
    articleOutline: ['Introduction', 'How to choose running shoes', 'Top picks for 2026', 'Conclusion'],
    articleTarget: 'Target question',
  },
}

function useMockup(): (typeof MOCKUP_COPY)['id'] {
  const { lang } = useMarketingLang()
  return MOCKUP_COPY[lang]
}

/** Soft radial glow blob for atmosphere behind panels/sections. */
export function Glow({ className }: { className?: string }): ReactElement {
  return <div aria-hidden="true" className={cn('pointer-events-none absolute -z-10 rounded-full blur-3xl', className)} />
}

/** Small status / attribute pill used inside mockups. */
export function MockChip({
  children,
  tone = 'brand',
  dot,
}: {
  children: ReactNode
  tone?: 'brand' | 'neutral' | 'error'
  dot?: boolean
}): ReactElement {
  const tones = {
    brand: 'bg-display-brand text-brand-token',
    neutral: 'bg-display-neutral text-secondary',
    error: 'bg-display-error text-error-token',
  } as const
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold', tones[tone])}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/** App-window chrome wrapper: titlebar with traffic-light dots + label + slot. */
export function BrowserChrome({
  label,
  status,
  children,
  className,
}: {
  label: string
  status?: ReactNode
  children: ReactNode
  className?: string
}): ReactElement {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[20px] border border-neutral-primary bg-card',
        'shadow-[0_30px_80px_-20px_rgba(2,18,11,0.35)] ring-1 ring-black/5',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-neutral-primary bg-secondary px-4 py-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-neutral-100" />
          <span className="size-2.5 rounded-full bg-neutral-100" />
          <span className="size-2.5 rounded-full bg-neutral-100" />
        </span>
        <span className="text-[12px] font-medium text-neutral-500">{label}</span>
        {status && <span className="ml-auto">{status}</span>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

/** A tiny rising area/line sparkline (SVG, token colors). */
export function TrendSparkline({ className }: { className?: string }): ReactElement {
  const line = '0,34 18,30 36,31 54,24 72,25 90,16 108,14 126,7'
  return (
    <svg viewBox="0 0 126 40" preserveAspectRatio="none" className={cn('h-10 w-full', className)} aria-hidden="true">
      <polyline points={`0,40 ${line} 126,40`} className="fill-brand-10" />
      <polyline points={line} fill="none" className="stroke-brand-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The signature 4-model row with per-model mention-rate bars. */
export function ModelRow(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-3">
      {MODELS.map((m) => (
        <div key={m.id} className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-neutral-primary bg-card">
            <ModelLogo model={m.id} className="size-4" />
          </span>
          <span className="w-20 shrink-0 truncate text-[13px] font-medium text-secondary">{m.label}</span>
          <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-tertiary">
            <span className="absolute inset-y-0 left-0 rounded-full bg-brand-600" style={{ width: `${m.rate}%` }} />
          </span>
          <span className="w-9 shrink-0 text-right text-[13px] font-semibold text-primary tabular-nums">{m.rate}%</span>
        </div>
      ))}
    </div>
  )
}

/** Tracking-queue mockup. */
export function TrackingPanel(): ReactElement {
  const c = useMockup()
  const rows = [
    { id: 'openai', done: true },
    { id: 'gemini', done: true },
    { id: 'perplexity', done: true },
    { id: 'anthropic', done: false },
  ] as const
  return (
    <BrowserChrome label={c.trackingQueue} status={<MockChip dot>{c.running}</MockChip>}>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-neutral-primary bg-card px-3 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-neutral-primary bg-secondary">
              <ModelLogo model={r.id} className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-primary">{c.prompts[i]}</span>
            <span className="shrink-0 text-[12px] font-medium text-neutral-500">{r.done ? '5/5' : '3/5'}</span>
            {r.done ? (
              <CheckCircle className="size-5 shrink-0 text-icon-brand" weight="fill" />
            ) : (
              <CircleNotch className="size-5 shrink-0 animate-spin text-brand-300" />
            )}
          </div>
        ))}
      </div>
    </BrowserChrome>
  )
}

/** Analytics mockup. */
export function AnalyticsPanel(): ReactElement {
  const c = useMockup()
  return (
    <BrowserChrome label={c.analytics} status={<MockChip dot>{c.live}</MockChip>}>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-neutral-primary bg-card p-4">
          <span className="text-[13px] font-medium text-neutral-500">{c.shareOfVoice}</span>
          <div className="mt-3 flex flex-col gap-2.5">
            <SovBar label="Solea" value={41} color="bg-brand-600" strong />
            <SovBar label={c.competitorA} value={33} color="bg-brand-300" />
            <SovBar label={c.competitorB} value={26} color="bg-neutral-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-primary bg-card p-4">
            <span className="text-[13px] font-medium text-neutral-500">{c.sentiment}</span>
            <div className="mt-3 flex flex-wrap gap-2">
              <MockChip>{c.positive} 58%</MockChip>
              <MockChip tone="neutral">{c.neutral} 31%</MockChip>
              <MockChip tone="error">{c.negative} 11%</MockChip>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-primary bg-card p-4">
            <span className="text-[13px] font-medium text-neutral-500">{c.weeklyTrend}</span>
            <TrendSparkline className="mt-3 h-12" />
          </div>
        </div>
      </div>
    </BrowserChrome>
  )
}

function SovBar({ label, value, color, strong }: { label: string; value: number; color: string; strong?: boolean }): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('w-28 shrink-0 truncate text-[13px]', strong ? 'font-semibold text-primary' : 'text-secondary')}>{label}</span>
      <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-tertiary">
        <span className={cn('absolute inset-y-0 left-0 rounded-full', color)} style={{ width: `${value}%` }} />
      </span>
      <span className="w-9 shrink-0 text-right text-[13px] font-semibold text-primary tabular-nums">{value}%</span>
    </div>
  )
}

/** 3/4-circle GEO readiness gauge (SVG, token colors). */
export function GeoGauge({ score = 82 }: { score?: number }): ReactElement {
  const r = 52
  const c = 64
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const offset = arc * (1 - score / 100)
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 128 128" className="size-36 -rotate-[135deg]" aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" className="stroke-neutral-100" strokeWidth={10} strokeLinecap="round" strokeDasharray={`${arc} ${circ}`} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          className="stroke-brand-600"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[34px] font-semibold leading-none text-primary">{score}</span>
        <span className="text-[12px] font-medium text-neutral-500">/ 100</span>
      </div>
    </div>
  )
}

/** GEO audit result mockup: score gauge + a checklist of audited items. */
export function GeoAuditPanel(): ReactElement {
  const c = useMockup()
  const passed = [true, true, true, false, true, true]
  return (
    <div className="rounded-2xl border border-neutral-primary bg-card p-5">
      <div className="flex items-center gap-5">
        <GeoGauge score={82} />
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-neutral-500">{c.auditScore}</span>
          <MockChip dot>{c.auditGood}</MockChip>
          <span className="text-[12px] text-neutral-500">{c.auditPassed}</span>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-primary pt-4">
        {c.auditItems.map((item, i) => (
          <div key={item} className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-secondary">{item}</span>
            {passed[i] ? (
              <CheckCircle className="size-5 shrink-0 text-icon-brand" weight="fill" />
            ) : (
              <Warning className="size-5 shrink-0 text-warning-token" weight="fill" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Distribution mockup: channels with publish status + visibility impact. */
export function DistributionPanel(): ReactElement {
  const c = useMockup()
  const items: { source: string; status: string; tone: 'brand' | 'neutral'; gain?: string }[] = [
    { source: 'reddit.com/r/sneakers', status: c.published, tone: 'brand', gain: '+8' },
    { source: 'medium.com', status: c.published, tone: 'brand', gain: '+5' },
    { source: c.forum, status: c.scheduled, tone: 'neutral' },
    { source: 'quora.com', status: c.draft, tone: 'neutral' },
  ]
  return (
    <div className="rounded-2xl border border-neutral-primary bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] font-medium text-neutral-500">{c.distImpact}</span>
        <MockChip dot>+13%</MockChip>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((it) => (
          <div key={it.source} className="flex items-center gap-3 rounded-xl border border-neutral-primary bg-card px-3 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-icon-brand">
              <LinkSimple className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary">{it.source}</span>
            {it.gain != null && (
              <span className="shrink-0 text-[12px] font-semibold text-brand-token">
                {it.gain} {c.mentions}
              </span>
            )}
            <MockChip tone={it.tone}>{it.status}</MockChip>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Citations list mockup. */
export function CitationsList(): ReactElement {
  const c = useMockup()
  const rows = [
    { domain: 'kompas.com', n: '5' },
    { domain: 'reddit.com/r/sneakers', n: '3' },
    { domain: 'medium.com', n: '2' },
  ]
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.domain} className="flex items-center gap-3 rounded-xl border border-neutral-primary bg-card px-3 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-icon-brand">
            <LinkSimple className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary">{r.domain}</span>
          <MockChip tone="neutral">
            {c.cited} {r.n}x
          </MockChip>
        </div>
      ))}
    </div>
  )
}

/** AI-article preview mockup: title, meta, outline, and target question. */
export function ArticlePreview(): ReactElement {
  const c = useMockup()
  return (
    <div className="rounded-2xl border border-neutral-primary bg-card p-5">
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-display-brand text-icon-brand">
          <Sparkle className="size-4" weight="fill" />
        </span>
        <span className="text-[14px] font-semibold leading-snug text-primary">{c.articleTitle}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <MockChip tone="neutral">{c.markdown}</MockChip>
        <MockChip tone="neutral">{c.articleWords}</MockChip>
        <MockChip tone="neutral">{c.articleReadTime}</MockChip>
        <MockChip dot>{c.readyPublish}</MockChip>
      </div>
      <div className="mt-4 flex flex-col gap-2 border-t border-neutral-primary pt-4">
        {c.articleOutline.map((s, i) => (
          <div key={s} className="flex items-center gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-brand-token">
              {i + 1}
            </span>
            <span className="text-[13px] text-secondary">{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-secondary p-3">
        <span className="text-[11px] font-medium text-neutral-500">{c.articleTarget}</span>
        <p className="mt-0.5 text-[13px] font-medium text-primary">{c.prompts[0]}</p>
      </div>
    </div>
  )
}

/** Semantic-proximity mockup: how close the brand sits to related concepts. */
export function SemanticGraph(): ReactElement {
  const c = useMockup()
  const prox = [92, 84, 73, 38]
  return (
    <div className="rounded-2xl border border-neutral-primary bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] font-medium text-neutral-500">{c.semanticHeader}</span>
        <span className="rounded-full bg-brand-600 px-3 py-1 text-[12px] font-semibold text-white-remain">{c.yourBrand}</span>
      </div>
      <div className="flex flex-col gap-3">
        {c.concepts.map((concept, i) => {
          const gap = prox[i] < 50
          return (
            <div key={concept} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-[13px] text-secondary">{concept}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-tertiary">
                <span
                  className={cn('absolute inset-y-0 left-0 rounded-full', gap ? 'bg-warning-500' : 'bg-brand-600')}
                  style={{ width: `${prox[i]}%` }}
                />
              </span>
              {gap ? (
                <span className="inline-flex w-16 shrink-0 items-center justify-end gap-1 text-[12px] font-semibold text-warning-token">
                  <Warning className="size-3.5" weight="fill" />
                  {c.gap}
                </span>
              ) : (
                <span className="w-16 shrink-0 text-right text-[13px] font-semibold tabular-nums text-primary">{prox[i]}%</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
