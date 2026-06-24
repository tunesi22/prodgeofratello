'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MagnifyingGlass,
  DownloadSimple,
  X as PhosphorX,
  Plus,
  CaretDown,
  ArrowsClockwise,
  PencilSimple,
} from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp, transitionEnter, transitionExit } from '@/lib/motion'
import { Button, Checkbox, Chip, IconButton, Input, LoadingCircle } from '@/components/ui'
import { GlobeIcon } from '@/components/onboarding/icons'
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { SortableTable, type Column } from '@/components/dashboard/SortableTable'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { PromptsIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useTopLoading } from '@/components/providers/TopLoadingBar'
import { categoryMeta, CATEGORY_ORDER } from '@/lib/categories'
import { cn } from '@/lib/cn'

/**
 * Prompts page, prompt-tracking TABLE (Peec-style), full-bleed. One row per
 * prompt; clicking a row opens a right-side detail panel. Per-prompt metrics
 * (Avg. Vis., Sentiment, Brand Mentions, per-model + trend) are aggregated
 * CLIENT-SIDE from `/results` (no per-prompt stats endpoint). No backend change.
 * Volume / Difficulty / Tags from the reference are omitted (no data yet).
 */

interface Prompt {
  _id: string
  text: string
  category: string
  isActive: boolean
  createdAt: string
}

interface PromptsResponse {
  count: number
  prompts: Prompt[]
}

/** Minimal shape we read off /results for the client-side roll-up. */
interface ResultLite {
  promptId: { _id: string } | string | null
  model: string
  mentioned: boolean
  sentiment: string
  queriedAt: string
  response: string
}

interface Agg {
  total: number
  mentioned: number
  models: string[]
  pos: number
  neu: number
  neg: number
}

interface PromptRow extends Prompt {
  vis: number
  total: number
  mentioned: number
  /** 0..1 net sentiment among mentions, or null when never mentioned. */
  sentScore: number | null
  models: string[]
  pos: number
  neu: number
  neg: number
}

const METRICS_LIMIT = 1000
const MODEL_ORDER = ['openai', 'gemini', 'perplexity', 'anthropic']
const MODEL_LABELS: Record<string, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  anthropic: 'Claude',
}

/** Distinct-ish DS token colours for the Types bar; the legend carries the real
 *  distinction (categories are told apart by name, not colour). */
const CAT_BAR_COLORS = [
  'var(--icon-brand)',
  'var(--icon-warning)',
  'var(--icon-error)',
  'var(--icon-dark-gray)',
  'var(--color-brand-300)',
  'var(--icon-light-gray)',
]

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Prompts',
    subtitle: 'Buat dan kelola prompt Anda.',
    createPrompts: 'Buat Prompt',
    research: 'Riset pertanyaan asli',
    researchLink: 'Riset pertanyaan asli →',
    generate: 'Buat dengan AI',
    generating: 'Membuat...',
    regenerate: 'Buat Ulang',
    regenerating: 'Membuat ulang...',
    confirmAria: 'Konfirmasi buat ulang',
    confirmText:
      'Buat ulang akan mengganti semua prompt AI Anda dengan yang baru. Prosesnya sekitar 10 detik.',
    confirmYes: 'Ya, buat ulang',
    cancel: 'Batal',
    generatingBanner: 'Sedang membuat prompt dengan Claude... sekitar 10 detik',
    emptyTitle: 'Belum ada prompt',
    emptyDesc: 'Buat dengan AI, atau ambil pertanyaan asli dari internet melalui Riset Pertanyaan.',
    requestFailed: 'Permintaan gagal',
    filterPlaceholder: 'Filter berdasarkan nama...',
    filterAria: 'Filter prompt berdasarkan nama',
    typeAll: 'Semua',
    export: 'Export',
    colVis: 'Visibilitas',
    colPrompt: 'Prompt',
    colType: 'Tipe',
    colSentiment: 'Sentimen',
    colMentions: 'Penyebutan',
    colCreated: 'Dibuat',
    helpVis: 'Rata-rata visibilitas: seberapa sering brand Anda muncul di jawaban AI untuk prompt ini.',
    helpPrompt: 'Pertanyaan yang kami ajukan ke AI untuk memeriksa brand Anda.',
    helpType: 'Kategori prompt berdasarkan maksud pertanyaannya.',
    helpSentiment: 'Skala dari negatif (kiri) ke positif (kanan) saat brand Anda disebut.',
    helpMentions: 'Model AI yang menyebut brand Anda untuk prompt ini.',
    helpCreated: 'Tanggal prompt ini dibuat.',
    summaryTypes: 'Tipe',
    summaryVis: 'Visibilitas',
    visHigh: 'Tinggi',
    visMid: 'Sedang',
    visLow: 'Rendah',
    visNone: 'Belum di-scan',
    typesFilter: 'Tipe',
    promptTypes: 'Tipe Prompt',
    responsesLabel: 'Jawaban AI',
    mentionedYes: 'Disebut',
    mentionedNo: 'Tidak disebut',
    addManual: 'Tambah manual',
    manualTitle: 'Tambah prompt manual',
    manualPlaceholder: 'Tulis pertanyaan yang ingin Anda lacak...',
    manualCatLabel: 'Kategori',
    manualAdd: 'Tambah',
    manualAdding: 'Menambahkan...',
    visAria: (v: number): string => `Visibilitas ${v} persen`,
    noMatch: 'Tidak ada prompt yang cocok dengan filter.',
    pageOf: (p: number, total: number): string => `Halaman ${p} dari ${total}`,
    prev: 'Sebelumnya',
    next: 'Berikutnya',
    // sentiment tooltip
    sentTipTitle: 'Sentimen',
    sentTipBody: 'Skala dari negatif (kiri) ke positif (kanan). Penanda menunjukkan rata-rata sentimen saat brand Anda disebut.',
    sentBreakdown: (p: number, n: number, g: number): string => `${p} positif, ${n} netral, ${g} negatif`,
    // detail panel
    panelAria: 'Detail prompt',
    promptLabel: 'Prompt',
    closeAria: 'Tutup panel',
    createdLabel: 'Dibuat',
    avgVisLabel: 'Rata-rata visibilitas',
    visSummary: (m: number, total: number): string => `${m} dari ${total} jawaban menyebut brand Anda`,
    notScannedPanel: 'Prompt ini belum di-scan. Jalankan scan untuk mengumpulkan data.',
    trendLabel: 'Tren visibilitas',
    trendEmpty: 'Belum cukup data untuk tren (butuh beberapa scan).',
    perModelLabel: 'Visibilitas per model',
    sentimentPanelLabel: 'Sentimen saat disebut',
    noMentions: 'Brand Anda belum disebut pada prompt ini.',
    sentPos: 'Positif',
    sentNeu: 'Netral',
    sentNeg: 'Negatif',
  },
  en: {
    title: 'Prompts',
    subtitle: 'Create and manage your prompts.',
    createPrompts: 'Create Prompts',
    research: 'Research real questions',
    researchLink: 'Research real questions →',
    generate: 'Generate with AI',
    generating: 'Generating...',
    regenerate: 'Regenerate',
    regenerating: 'Regenerating...',
    confirmAria: 'Confirm regenerate',
    confirmText:
      'Regenerating replaces your current AI prompts with a fresh set. This takes about 10 seconds.',
    confirmYes: 'Yes, regenerate',
    cancel: 'Cancel',
    generatingBanner: 'Generating prompts via Claude... this takes about 10 seconds',
    emptyTitle: 'No prompts yet',
    emptyDesc: 'Generate with AI, or import real questions from the internet via AI Prompt Research.',
    requestFailed: 'Request failed',
    filterPlaceholder: 'Filter by name...',
    filterAria: 'Filter prompts by name',
    typeAll: 'All',
    export: 'Export',
    colVis: 'Avg. Vis.',
    colPrompt: 'Prompt',
    colType: 'Type',
    colSentiment: 'Sentiment',
    colMentions: 'Brand Mentions',
    colCreated: 'Created',
    helpVis: 'Average visibility: how often your brand appears in AI answers for this prompt.',
    helpPrompt: 'The question we ask the AI to check for your brand.',
    helpType: 'The prompt category, by the intent of the question.',
    helpSentiment: 'Scale from negative (left) to positive (right) when your brand is mentioned.',
    helpMentions: 'The AI models that mentioned your brand for this prompt.',
    helpCreated: 'When this prompt was created.',
    summaryTypes: 'Types',
    summaryVis: 'Visibility',
    visHigh: 'High',
    visMid: 'Medium',
    visLow: 'Low',
    visNone: 'Not scanned',
    typesFilter: 'Types',
    promptTypes: 'Prompt Types',
    responsesLabel: 'AI Responses',
    mentionedYes: 'Mentioned',
    mentionedNo: 'Not mentioned',
    addManual: 'Add manually',
    manualTitle: 'Add a prompt manually',
    manualPlaceholder: 'Write the question you want to track...',
    manualCatLabel: 'Category',
    manualAdd: 'Add',
    manualAdding: 'Adding...',
    visAria: (v: number): string => `Visibility ${v} percent`,
    noMatch: 'No prompts match the filter.',
    pageOf: (p: number, total: number): string => `Page ${p} of ${total}`,
    prev: 'Prev',
    next: 'Next',
    sentTipTitle: 'Sentiment',
    sentTipBody: 'Scale from negative (left) to positive (right). The marker shows the average sentiment when your brand is mentioned.',
    sentBreakdown: (p: number, n: number, g: number): string => `${p} positive, ${n} neutral, ${g} negative`,
    panelAria: 'Prompt detail',
    promptLabel: 'Prompt',
    closeAria: 'Close panel',
    createdLabel: 'Created',
    avgVisLabel: 'Average visibility',
    visSummary: (m: number, total: number): string => `${m} of ${total} answers mentioned your brand`,
    notScannedPanel: 'This prompt has not been scanned yet. Run a scan to collect data.',
    trendLabel: 'Visibility trend',
    trendEmpty: 'Not enough data for a trend yet (needs multiple scans).',
    perModelLabel: 'Visibility by model',
    sentimentPanelLabel: 'Sentiment when mentioned',
    noMentions: 'Your brand has not been mentioned for this prompt yet.',
    sentPos: 'Positive',
    sentNeu: 'Neutral',
    sentNeg: 'Negative',
  },
} as const

// ─── Visibility ring (tier-coloured, unlike the brand-only ProgressRing) ───────
function visTier(v: number): 'high' | 'mid' | 'low' {
  return v >= 85 ? 'high' : v >= 35 ? 'mid' : 'low'
}
const RING_STROKE: Record<'high' | 'mid' | 'low', string> = {
  high: 'stroke-[var(--icon-brand)]',
  mid: 'stroke-[var(--icon-warning)]',
  low: 'stroke-[var(--icon-error)]',
}
const VIS_TEXT: Record<'high' | 'mid' | 'low', string> = {
  high: 'text-brand-token',
  mid: 'text-warning-token',
  low: 'text-error-token',
}

function VisibilityRing({
  value,
  label,
  muted,
  size = 22,
}: {
  value: number
  label: string
  muted?: boolean
  size?: number
}): ReactElement {
  const stroke = size >= 40 ? 4 : 3
  const r = (size - stroke) / 2
  const c = size / 2
  const circ = 2 * Math.PI * r
  const tier = visTier(value)
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
        className="-rotate-90 shrink-0"
        role="img"
        aria-label={label}
      >
        <circle cx={c} cy={c} r={r} fill="none" className="stroke-[var(--border-neutral-primary)]" strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          className={cn('transition-[stroke-dashoffset] duration-400 ease-standard', RING_STROKE[tier])}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - value / 100)}
        />
      </svg>
      <span
        className={cn(
          'font-medium tabular-nums',
          size >= 40 ? 'text-h6' : 'text-label-medium',
          muted ? 'text-tertiary' : VIS_TEXT[tier],
        )}
      >
        {value}%
      </span>
    </span>
  )
}

/** Green-shade sentiment scale (pale → brand green) with a marker; muted bar when no data. */
function SentimentBar({ score }: { score: number | null }): ReactElement {
  if (score == null) {
    return <span className="block h-2 w-24 rounded-circle bg-secondary" aria-hidden="true" />
  }
  const pct = Math.round(score * 100)
  return (
    <span
      className="relative block h-2 w-24 rounded-circle"
      style={{ backgroundImage: 'linear-gradient(90deg, var(--color-brand-100), var(--color-brand-300), var(--icon-brand))' }}
      aria-hidden="true"
    >
      <span
        className="absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-circle"
        style={{ left: `${pct}%`, background: 'var(--text-primary)' }}
      />
    </span>
  )
}

/** Logos of the models that mentioned the brand, in canonical order. */
function BrandMentions({ models }: { models: string[] }): ReactElement {
  if (models.length === 0) return <span className="text-tertiary">-</span>
  const ordered = [...models].sort((a, b) => MODEL_ORDER.indexOf(a) - MODEL_ORDER.indexOf(b))
  return (
    <span className="inline-flex items-center gap-1">
      {ordered.map((m) => (
        <ModelLogo key={m} model={m} className="size-4" />
      ))}
    </span>
  )
}

/** Tiny visibility-over-time line (one point per scan day). */
function Sparkline({ points }: { points: number[] }): ReactElement {
  const w = 260
  const h = 56
  const pad = 4
  const stepX = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0
  const coords = points.map((v, i) => [pad + i * stepX, h - pad - (v / 100) * (h - pad * 2)] as const)
  const dPath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" role="img" aria-hidden="true">
      <path d={dPath} fill="none" className="stroke-[var(--icon-brand)]" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c[0]} cy={c[1]} r={2.5} className="fill-[var(--icon-brand)]" />
      ))}
    </svg>
  )
}

/** Build the per-prompt roll-up from a page of /results. */
function aggregate(results: ResultLite[]): Record<string, Agg> {
  const map: Record<string, Agg> = {}
  for (const r of results) {
    const pid = typeof r.promptId === 'string' ? r.promptId : r.promptId?._id
    if (!pid) continue
    const e = map[pid] ?? (map[pid] = { total: 0, mentioned: 0, models: [], pos: 0, neu: 0, neg: 0 })
    e.total++
    if (r.mentioned) {
      e.mentioned++
      if (!e.models.includes(r.model)) e.models.push(r.model)
      if (r.sentiment === 'positive') e.pos++
      else if (r.sentiment === 'negative') e.neg++
      else e.neu++
    }
  }
  return map
}

/** Detail computed on demand for the slide-over panel. */
function panelData(row: PromptRow, results: ResultLite[]): {
  perModel: { model: string; total: number; mentioned: number; vis: number }[]
  pos: number
  neu: number
  neg: number
  mentionedCount: number
  trend: number[]
  responses: ResultLite[]
} {
  const mine = results.filter((r) => (typeof r.promptId === 'string' ? r.promptId : r.promptId?._id) === row._id)
  const perModel = MODEL_ORDER.map((m) => {
    const ms = mine.filter((r) => r.model === m)
    const total = ms.length
    const mentioned = ms.filter((r) => r.mentioned).length
    return { model: m, total, mentioned, vis: total > 0 ? Math.round((mentioned / total) * 100) : 0 }
  }).filter((pm) => pm.total > 0)
  const mentionedR = mine.filter((r) => r.mentioned)
  const pos = mentionedR.filter((r) => r.sentiment === 'positive').length
  const neg = mentionedR.filter((r) => r.sentiment === 'negative').length
  const neu = mentionedR.length - pos - neg
  const byDay: Record<string, { total: number; mentioned: number }> = {}
  for (const r of mine) {
    const key = new Date(r.queriedAt).toISOString().slice(0, 10)
    const e = byDay[key] ?? (byDay[key] = { total: 0, mentioned: 0 })
    e.total++
    if (r.mentioned) e.mentioned++
  }
  const trend = Object.keys(byDay)
    .sort()
    .map((k) => Math.round((byDay[k].mentioned / byDay[k].total) * 100))
  return { perModel, pos, neu, neg, mentionedCount: mentionedR.length, trend, responses: mine }
}

function fmtDate(dateStr: string, lang: 'id' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }).format(
    new Date(dateStr),
  )
}

function csvCell(s: string): string {
  return `"${s.replace(/"/g, '""')}"`
}

/** Sentiment donut: positive (green) / neutral (gray) / negative (red) arcs. */
function SentimentDonut({ pos, neu, neg }: { pos: number; neu: number; neg: number }): ReactElement {
  const total = pos + neu + neg || 1
  const size = 116
  const stroke = 18
  const r = (size - stroke) / 2
  const c = size / 2
  const circ = 2 * Math.PI * r
  const segs = [
    { v: pos, color: 'var(--icon-brand)' },
    { v: neu, color: 'var(--icon-light-gray)' },
    { v: neg, color: 'var(--icon-error)' },
  ].filter((s) => s.v > 0)
  let offset = 0
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: size, height: size }}
      className="-rotate-90 shrink-0"
      role="img"
      aria-hidden="true"
    >
      <circle cx={c} cy={c} r={r} fill="none" className="stroke-[var(--border-neutral-primary)]" strokeWidth={stroke} />
      {segs.map((s, i) => {
        const len = (s.v / total) * circ
        const node = (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            style={{ stroke: s.color }}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
          />
        )
        offset += len
        return node
      })}
    </svg>
  )
}

interface BarSeg {
  label: string
  count: number
  color: string
}

/** Generic donut chart from value/colour segments (the summary-card viz). */
function Donut({
  segments,
  size = 92,
  stroke = 14,
}: {
  segments: { value: number; color: string }[]
  size?: number
  stroke?: number
}): ReactElement {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - stroke) / 2
  const c = size / 2
  const circ = 2 * Math.PI * r
  const shown = segments.filter((s) => s.value > 0)
  let offset = 0
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: size, height: size }}
      className="-rotate-90 shrink-0"
      role="img"
      aria-hidden="true"
    >
      <circle cx={c} cy={c} r={r} fill="none" className="stroke-[var(--border-neutral-primary)]" strokeWidth={stroke} />
      {shown.map((s, i) => {
        const len = (s.value / total) * circ
        const node = (
          <circle
            key={i}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            style={{ stroke: s.color }}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
          />
        )
        offset += len
        return node
      })}
    </svg>
  )
}

/** Distribution card: a donut + a legend (label, count, share). */
function SummaryBar({ title, segments, loading }: { title: string; segments: BarSeg[]; loading?: boolean }): ReactElement {
  const total = segments.reduce((sum, s) => sum + s.count, 0)
  const shown = segments.filter((s) => s.count > 0)
  return (
    <Card className="flex flex-col gap-3 p-4">
      <span className="text-label-big font-medium text-primary">{title}</span>
      {loading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="size-[92px] !rounded-circle" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ) : total > 0 ? (
        <div className="flex items-center gap-4">
          <Donut segments={shown.map((s) => ({ value: s.count, color: s.color }))} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {shown.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-paragraph-medium text-secondary">
                <span className="size-2.5 shrink-0 rounded-circle" style={{ background: s.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <span className="shrink-0 font-medium tabular-nums text-primary">{s.count}</span>
                <span className="w-9 shrink-0 text-right tabular-nums text-tertiary">
                  {Math.round((s.count / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <span className="block h-2.5 w-full rounded-circle bg-secondary" aria-hidden="true" />
      )}
    </Card>
  )
}

/** Right-side detail panel: prompt info + visibility line + per-model + sentiment. */
function PromptDetailPanel({
  row,
  results,
  onClose,
}: {
  row: PromptRow
  results: ResultLite[]
  onClose: () => void
}): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const d = useMemo(() => panelData(row, results), [row, results])
  const meta = categoryMeta(row.category)

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionEnter() }}
        exit={{ opacity: 0, transition: transitionExit() }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-overlay"
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.panelAria}
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: transitionEnter() }}
        exit={{ x: '100%', transition: transitionExit() }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col overflow-hidden border-l border-neutral-primary bg-card shadow-regular-xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-neutral-primary px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-label-medium font-medium text-tertiary">{t.promptLabel}</p>
            <p className="text-paragraph-medium font-medium text-primary">{row.text}</p>
          </div>
          <IconButton type="ghost" size="sm" aria-label={t.closeAria} onClick={onClose} className="shrink-0">
            <PhosphorX aria-hidden="true" />
          </IconButton>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-primary bg-secondary px-5 py-3">
          <Chip type={meta.tone} size="sm" outlined>
            {meta.label[lang]}
          </Chip>
          <span className="text-label-medium text-tertiary">
            {t.createdLabel} {fmtDate(row.createdAt, lang)}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <VisibilityRing value={row.vis} size={44} label={t.visAria(row.vis)} muted={row.total === 0} />
            <div className="flex min-w-0 flex-col">
              <span className="text-label-medium font-medium text-tertiary">{t.avgVisLabel}</span>
              {row.total > 0 && (
                <span className="text-paragraph-medium text-secondary">{t.visSummary(row.mentioned, row.total)}</span>
              )}
            </div>
          </div>

          {row.total === 0 ? (
            <p className="text-paragraph-medium text-tertiary">{t.notScannedPanel}</p>
          ) : (
            <>
              {/* Visibility trend line */}
              <div className="flex flex-col gap-2">
                <span className="text-label-medium font-medium text-tertiary">{t.trendLabel}</span>
                {d.trend.length >= 2 ? (
                  <Sparkline points={d.trend} />
                ) : (
                  <p className="text-paragraph-medium text-tertiary">{t.trendEmpty}</p>
                )}
              </div>

              {/* Per-model visibility */}
              <div className="flex flex-col gap-2">
                <span className="text-label-medium font-medium text-tertiary">{t.perModelLabel}</span>
                <div className="flex flex-col gap-2">
                  {d.perModel.map((pm) => (
                    <div key={pm.model} className="flex items-center gap-2">
                      <ModelLogo model={pm.model} className="size-4 shrink-0" />
                      <span className="w-20 shrink-0 text-label-medium text-secondary">
                        {MODEL_LABELS[pm.model] ?? pm.model}
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-circle bg-secondary">
                        <span
                          className="block h-full rounded-circle"
                          style={{ width: `${pm.vis}%`, background: 'var(--icon-brand)' }}
                        />
                      </span>
                      <span className="w-10 shrink-0 text-right text-label-medium tabular-nums text-secondary">
                        {pm.vis}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment breakdown (donut + legend) */}
              <div className="flex flex-col gap-3">
                <span className="text-label-medium font-medium text-tertiary">{t.sentimentPanelLabel}</span>
                {d.mentionedCount > 0 ? (
                  <div className="flex items-center gap-5">
                    <SentimentDonut pos={d.pos} neu={d.neu} neg={d.neg} />
                    <div className="flex flex-1 flex-col gap-2">
                      {[
                        { label: t.sentPos, v: d.pos, color: 'var(--icon-brand)' },
                        { label: t.sentNeu, v: d.neu, color: 'var(--icon-light-gray)' },
                        { label: t.sentNeg, v: d.neg, color: 'var(--icon-error)' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2 text-paragraph-medium text-secondary">
                          <span className="size-2.5 shrink-0 rounded-circle" style={{ background: s.color }} aria-hidden="true" />
                          <span className="flex-1">{s.label}</span>
                          <span className="font-medium tabular-nums text-primary">
                            {Math.round((s.v / d.mentionedCount) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-paragraph-medium text-tertiary">{t.noMentions}</p>
                )}
              </div>

              {/* The actual AI responses for this prompt */}
              {d.responses.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-label-medium font-medium text-tertiary">
                    {t.responsesLabel} ({d.responses.length})
                  </span>
                  <div className="flex flex-col gap-2">
                    {d.responses.map((res, i) => (
                      <div key={i} className="flex flex-col gap-1.5 rounded-token-12 border border-neutral-primary p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5">
                            <ModelLogo model={res.model} className="size-4" />
                            <span className="text-label-medium font-medium text-secondary">
                              {MODEL_LABELS[res.model] ?? res.model}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={cn(
                                'size-2 shrink-0 rounded-circle',
                                res.mentioned ? 'bg-icon-brand' : 'bg-icon-light-gray',
                              )}
                              aria-hidden="true"
                            />
                            <span className="text-label-medium text-tertiary">
                              {res.mentioned ? t.mentionedYes : t.mentionedNo}
                            </span>
                          </span>
                        </div>
                        {res.response && (
                          <p className="line-clamp-3 text-paragraph-medium leading-relaxed text-secondary">
                            {res.response}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default function PromptsPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const { start, done } = useTopLoading()
  const t = COPY[lang]

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [metrics, setMetrics] = useState<Record<string, Agg>>({})
  const [rawResults, setRawResults] = useState<ResultLite[]>([])
  const [metricsLoaded, setMetricsLoaded] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [generating, setGenerating] = useState<boolean>(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [selected, setSelected] = useState<PromptRow | null>(null)
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [typesOpen, setTypesOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const typesRef = useRef<HTMLDivElement>(null)
  const [manualOpen, setManualOpen] = useState<boolean>(false)
  const [manualText, setManualText] = useState<string>('')
  const [manualCategory, setManualCategory] = useState<string>('organic')
  const [manualSubmitting, setManualSubmitting] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    apiFetch<PromptsResponse>(`/brands/${id}/prompts`)
      .then((data) => {
        if (!cancelled) setPrompts(data.prompts)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : t.requestFailed)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Per-prompt metrics, rolled up client-side from /results.
  useEffect(() => {
    let cancelled = false
    apiFetch<{ results: ResultLite[] }>(`/brands/${id}/results?page=1&limit=${METRICS_LIMIT}`)
      .then((r) => {
        if (cancelled) return
        setRawResults(r.results)
        setMetrics(aggregate(r.results))
        setMetricsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setMetricsLoaded(true)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, prompts.length])

  // Close the toolbar dropdowns on outside click.
  useEffect(() => {
    function onClickOutside(e: MouseEvent): void {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false)
      if (typesRef.current && !typesRef.current.contains(target)) setTypesOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleGenerate(regenerate: boolean): Promise<void> {
    setGenerating(true)
    setConfirmRegenerate(false)
    setError('')
    start()
    try {
      const url = `/brands/${id}/prompts${regenerate ? '?regenerate=true' : ''}`
      const data = await apiFetch<PromptsResponse>(url, { method: 'POST' })
      setPrompts(data.prompts)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.requestFailed)
    } finally {
      setGenerating(false)
      done()
    }
  }

  const rows: PromptRow[] = useMemo(
    () =>
      prompts.map((p) => {
        const agg = metrics[p._id]
        const total = agg?.total ?? 0
        const mentioned = agg?.mentioned ?? 0
        const vis = total > 0 ? Math.round((mentioned / total) * 100) : 0
        const sentScore = mentioned > 0 ? (agg!.pos + agg!.neu * 0.5) / mentioned : null
        return {
          ...p,
          vis,
          total,
          mentioned,
          sentScore,
          models: agg?.models ?? [],
          pos: agg?.pos ?? 0,
          neu: agg?.neu ?? 0,
          neg: agg?.neg ?? 0,
        }
      }),
    [prompts, metrics],
  )

  const countByCat = useMemo(() => {
    const m: Record<string, number> = {}
    for (const p of prompts) m[p.category] = (m[p.category] ?? 0) + 1
    return m
  }, [prompts])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (typeFilter.length === 0 || typeFilter.includes(r.category)) &&
        (q === '' || r.text.toLowerCase().includes(q)),
    )
  }, [rows, query, typeFilter])

  function toggleType(c: string): void {
    setTypeFilter((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  async function handleAddManual(): Promise<void> {
    const text = manualText.trim()
    if (text === '') return
    setManualSubmitting(true)
    setError('')
    try {
      await apiFetch<{ added: number; total: number }>(`/brands/${id}/prompts/import`, {
        method: 'POST',
        body: JSON.stringify({ queries: [{ text, category: manualCategory }] }),
      })
      const data = await apiFetch<PromptsResponse>(`/brands/${id}/prompts`)
      setPrompts(data.prompts)
      setManualText('')
      setManualOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.requestFailed)
    } finally {
      setManualSubmitting(false)
    }
  }

  // Summary-bar segments (the two cards up top).
  const typeSegments: BarSeg[] = useMemo(
    () =>
      CATEGORY_ORDER.filter((c) => (countByCat[c] ?? 0) > 0).map((c) => ({
        label: categoryMeta(c).label[lang],
        count: countByCat[c],
        color: CAT_BAR_COLORS[CATEGORY_ORDER.indexOf(c) % CAT_BAR_COLORS.length],
      })),
    [countByCat, lang],
  )

  const visSegments: BarSeg[] = useMemo(() => {
    const scanned = rows.filter((r) => r.total > 0)
    return [
      { label: t.visHigh, count: scanned.filter((r) => r.vis >= 85).length, color: 'var(--icon-brand)' },
      { label: t.visMid, count: scanned.filter((r) => r.vis >= 35 && r.vis < 85).length, color: 'var(--icon-warning)' },
      { label: t.visLow, count: scanned.filter((r) => r.vis < 35).length, color: 'var(--icon-error)' },
      { label: t.visNone, count: rows.filter((r) => r.total === 0).length, color: 'var(--icon-light-gray)' },
    ]
  }, [rows, t])

  function exportCsv(): void {
    const headers = ['Prompt', 'Type', 'Avg Vis %', 'Mentioned', 'Total', 'Brand Mentions', 'Created']
    const lines = filteredRows.map((r) =>
      [
        csvCell(r.text),
        categoryMeta(r.category).label.en,
        String(r.vis),
        String(r.mentioned),
        String(r.total),
        r.models.join(' '),
        new Date(r.createdAt).toISOString().slice(0, 10),
      ].join(','),
    )
    const csv = [headers.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompts-${id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showList = !loading && !generating && prompts.length > 0
  const showEmpty = !loading && !generating && prompts.length === 0

  const columns: Column<PromptRow>[] = [
    {
      key: 'vis',
      header: t.colVis,
      className: 'w-[150px]',
      help: t.helpVis,
      sortValue: (r) => r.vis,
      render: (r) =>
        !metricsLoaded ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <VisibilityRing value={r.vis} label={t.visAria(r.vis)} muted={r.total === 0} />
        ),
    },
    {
      key: 'prompt',
      header: t.colPrompt,
      help: t.helpPrompt,
      sortValue: (r) => r.text.toLowerCase(),
      render: (r) => (
        <span className="block truncate text-paragraph-medium font-medium text-primary">{r.text}</span>
      ),
    },
    {
      key: 'type',
      header: t.colType,
      className: 'w-[184px]',
      help: t.helpType,
      sortValue: (r) => r.category,
      render: (r) => {
        const m = categoryMeta(r.category)
        const Icon = m.icon
        return (
          <Chip type={m.tone} size="sm" outlined>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Icon className="size-3.5" />
              {m.label[lang]}
            </span>
          </Chip>
        )
      },
    },
    {
      key: 'sentiment',
      header: t.colSentiment,
      className: 'w-[150px]',
      help: t.helpSentiment,
      sortValue: (r) => r.sentScore ?? -1,
      render: (r) => (!metricsLoaded ? <Skeleton className="h-4 w-20" /> : <SentimentBar score={r.sentScore} />),
    },
    {
      key: 'mentions',
      header: t.colMentions,
      className: 'w-[150px]',
      help: t.helpMentions,
      sortValue: (r) => r.models.length,
      render: (r) => (!metricsLoaded ? <Skeleton className="h-4 w-16" /> : <BrandMentions models={r.models} />),
    },
    {
      key: 'created',
      header: t.colCreated,
      align: 'right',
      className: 'w-[124px]',
      help: t.helpCreated,
      sortValue: (r) => new Date(r.createdAt).getTime(),
      render: (r) => <span className="whitespace-nowrap text-label-medium text-tertiary">{fmtDate(r.createdAt, lang)}</span>,
    },
  ]

  return (
    <PageContainer full>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {error !== '' && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={error} />
        </motion.div>
      )}

      {confirmRegenerate && !generating && (
        <motion.div variants={fadeUp} className="w-full">
          <div
            role="alertdialog"
            aria-label={t.confirmAria}
            className="flex w-full flex-wrap items-center gap-3 rounded-token-12 border border-warning-token bg-display-warning px-4 py-3 transition-colors duration-200 ease-standard"
          >
            <p className="min-w-0 flex-1 text-paragraph-medium text-warning-token">{t.confirmText}</p>
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={() => handleGenerate(true)}>{t.confirmYes}</Button>
              <Button type="ghost" onClick={() => setConfirmRegenerate(false)}>
                {t.cancel}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {generating && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center gap-3 rounded-token-12 border border-brand-token bg-display-brand px-4 py-3 transition-colors duration-200 ease-standard">
            <LoadingCircle size="sm" />
            <p className="text-paragraph-medium text-brand-token">{t.generatingBanner}</p>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </motion.div>
      )}

      {loading && !generating && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </motion.div>
      )}

      {showEmpty && (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<PromptsIcon />}
            title={t.emptyTitle}
            description={t.emptyDesc}
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => handleGenerate(false)}>{t.generate}</Button>
                <Button type="ghost" onClick={() => router.push(`/brands/${id}/research`)}>
                  {t.researchLink}
                </Button>
              </div>
            }
          />
        </motion.div>
      )}

      {/* Summary cards: prompt types + visibility distribution */}
      {showList && (
        <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <SummaryBar title={t.summaryTypes} segments={typeSegments} />
          <SummaryBar title={t.summaryVis} segments={visSegments} loading={!metricsLoaded} />
        </motion.div>
      )}

      {/* Toolbar: one Create-Prompts control + filter + export, then type chips */}
      {showList && (
        <motion.div variants={fadeUp} className="flex w-full flex-wrap items-center gap-3">
          <div ref={menuRef} className="relative shrink-0">
            <Button
              type="primary"
              iconLeft={<Plus className="size-5" aria-hidden="true" />}
              iconRight={<CaretDown className="size-4" aria-hidden="true" />}
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              disabled={generating}
            >
              {t.createPrompts}
            </Button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0, transition: transitionEnter(0.2) }}
                  exit={{ opacity: 0, y: 4, transition: transitionExit() }}
                  className="absolute left-0 top-full z-30 mt-1 w-60 rounded-token-12 border border-neutral-primary bg-card p-1 shadow-regular-md"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setManualOpen(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-action-small font-medium text-primary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
                  >
                    <PencilSimple className="size-4 shrink-0 text-icon-brand" aria-hidden="true" />
                    {t.addManual}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setConfirmRegenerate(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-action-small font-medium text-primary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
                  >
                    <ArrowsClockwise className="size-4 shrink-0 text-icon-brand" aria-hidden="true" />
                    {t.regenerate}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      router.push(`/brands/${id}/research`)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-action-small font-medium text-primary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
                  >
                    <MagnifyingGlass className="size-4 shrink-0 text-icon-brand" aria-hidden="true" />
                    {t.research}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Input
            aria-label={t.filterAria}
            placeholder={t.filterPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            iconLeft={<MagnifyingGlass className="size-5" aria-hidden="true" />}
            className="w-full sm:w-80"
          />
          <div className="ml-auto flex items-center gap-3">
            {/* Types: multi-select category filter (checkbox popover) */}
            <div ref={typesRef} className="relative shrink-0">
              <Button
                type="ghost"
                iconLeft={<GlobeIcon className="size-5" />}
                iconRight={<CaretDown className="size-4" aria-hidden="true" />}
                onClick={() => setTypesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={typesOpen}
              >
                {typeFilter.length > 0 ? `${t.typesFilter} (${typeFilter.length})` : t.typesFilter}
              </Button>
              <AnimatePresence>
                {typesOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: transitionEnter(0.2) }}
                    exit={{ opacity: 0, y: 4, transition: transitionExit() }}
                    className="absolute right-0 top-full z-30 mt-1 w-64 rounded-token-12 border border-neutral-primary bg-card p-1 shadow-regular-md"
                  >
                    <div className="px-2 py-1.5">
                      <span className="text-label-medium font-medium text-tertiary">{t.promptTypes}</span>
                    </div>
                    {CATEGORY_ORDER.filter((cat) => (countByCat[cat] ?? 0) > 0).map((cat) => {
                      const m = categoryMeta(cat)
                      const CatIcon = m.icon
                      const checked = typeFilter.includes(cat)
                      return (
                        <div
                          key={cat}
                          role="menuitemcheckbox"
                          aria-checked={checked}
                          tabIndex={0}
                          onClick={() => toggleType(cat)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleType(cat)
                            }
                          }}
                          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg p-2 outline-none transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed"
                        >
                          <Checkbox checked={checked} tabIndex={-1} aria-hidden className="pointer-events-none shrink-0" />
                          <CatIcon className="size-4 shrink-0 text-icon-dark-gray" />
                          <span className="min-w-0 flex-1 truncate text-left text-action-small font-medium text-primary">
                            {m.label[lang]}
                          </span>
                          <span className="shrink-0 text-label-medium text-tertiary">{countByCat[cat]}</span>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              type="ghost"
              iconLeft={<DownloadSimple className="size-5" aria-hidden="true" />}
              onClick={exportCsv}
              className="shrink-0"
            >
              {t.export}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Add a prompt manually */}
      {manualOpen && (
        <motion.div variants={fadeUp} className="w-full">
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <PencilSimple className="size-5 shrink-0 text-icon-brand" aria-hidden="true" />
              <h3 className="text-label-big font-medium text-primary">{t.manualTitle}</h3>
            </div>
            <Input
              aria-label={t.manualTitle}
              placeholder={t.manualPlaceholder}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label-medium font-medium text-tertiary">{t.manualCatLabel}</span>
              {CATEGORY_ORDER.map((cat) => {
                const m = categoryMeta(cat)
                const CatIcon = m.icon
                const sel = manualCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setManualCategory(cat)}
                    aria-pressed={sel}
                    className="rounded-circle outline-none transition-colors duration-200 ease-standard focus-visible:bg-btn-ghost-pressed"
                  >
                    <Chip type="neutral" shape="rounded" size="sm" outlined={!sel} className="cursor-pointer">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <CatIcon className="size-3.5" />
                        {m.label[lang]}
                      </span>
                    </Chip>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => void handleAddManual()} disabled={manualText.trim() === '' || manualSubmitting}>
                {manualSubmitting ? t.manualAdding : t.manualAdd}
              </Button>
              <Button type="ghost" onClick={() => setManualOpen(false)} disabled={manualSubmitting}>
                {t.cancel}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tracking table (full-bleed, fixed layout: Prompt column flexes) */}
      {showList && (
        <motion.div variants={fadeUp} className="w-full">
          <Card className="overflow-hidden p-0">
            <SortableTable
              columns={columns}
              rows={filteredRows}
              rowKey={(r) => r._id}
              initialSort={{ key: 'vis', dir: 'desc' }}
              pageSize={25}
              layout="fixed"
              onRowClick={(r) => setSelected(r)}
              caption={t.title}
              emptyMessage={t.noMatch}
              paginationLabels={{ pageOf: t.pageOf, prev: t.prev, next: t.next }}
            />
          </Card>
        </motion.div>
      )}

      <AnimatePresence>
        {selected && <PromptDetailPanel row={selected} results={rawResults} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </PageContainer>
  )
}
