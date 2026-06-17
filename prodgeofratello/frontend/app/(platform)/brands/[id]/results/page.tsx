'use client'

import { useEffect, useState } from 'react'
import type { KeyboardEvent, ReactElement, ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X as PhosphorX } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp, transitionEnter, transitionExit } from '@/lib/motion'
import {
  PageContainer,
  PageHeader,
  Section,
  Card,
  StatCard,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { Button, Chip, IconButton, Popover, Tabs } from '@/components/ui'
import type { ChipType, TabItem } from '@/components/ui'
import { CitationsIcon } from '@/components/dashboard/nav-icons'
import { LockIcon } from '@/components/onboarding/icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { categoryMeta } from '@/lib/categories'
import { cn } from '@/lib/cn'

interface QueryResult {
  _id: string
  model: string
  mentioned: boolean
  sentiment: string
  mentionContext: string
  response: string
  queriedAt: string
  promptId: { _id: string; text: string; category: string } | null
}

interface ResultsResponse {
  total: number
  page: number
  results: QueryResult[]
}

type MentionFilter = '' | 'mentioned' | 'not-mentioned'

const PAGE_SIZE = 50

const MODEL_LABELS: Record<string, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  anthropic: 'Claude',
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Jawaban AI',
    subtitleBase: 'Jawaban asli dari AI tempat brand Anda muncul.',
    subtitleWithData: (total: number): string =>
      `Jawaban asli dari AI tempat brand Anda muncul. Total ${total} jawaban terkumpul. Klik baris mana saja untuk melihat jawaban lengkapnya.`,
    allModels: 'Semua Model',
    filterModelAria: 'Filter berdasarkan model',
    modelLocked: 'Tersedia di paket yang lebih tinggi',
    showLabel: 'Tampilkan',
    checkedOn: (d: string): string => `Dicek ${d}`,
    statusNotMentioned: 'Tidak disebut',
    statusPositive: 'Disebut secara positif',
    statusNeutral: 'Disebut secara netral',
    statusNegative: 'Disebut secara negatif',
    filterAll: 'Semua',
    filterMentioned: 'Disebut',
    filterNotMentioned: 'Tidak disebut',
    mentioned: 'Disebut',
    notMentioned: 'Tidak disebut',
    statTotal: 'Total Jawaban',
    statMentioned: 'Total Disebut',
    statNotMentioned: 'Total Tidak Disebut',
    emptyTitle: 'Belum ada hasil',
    emptyDesc: 'Jalankan scan terlebih dahulu untuk mulai mengumpulkan jawaban AI.',
    pageOf: (p: number, total: number): string => `Halaman ${p} dari ${total}`,
    prev: 'Sebelumnya',
    next: 'Berikutnya',
    panelAria: 'Detail jawaban AI',
    promptLabel: 'Prompt',
    closeAria: 'Tutup panel',
    brandContext: 'Bagian yang membahas brand Anda',
    fullResponse: 'Jawaban Lengkap',
    copy: 'Salin',
    copied: 'Tersalin!',
    notStored: 'Jawaban lengkap tidak disimpan',
    notStoredHint: 'Jalankan scan baru untuk menyimpan jawaban lengkap',
    resultId: 'ID Hasil:',
    sentimentLabel: (s: string): string =>
      ({ positive: 'Positif', neutral: 'Netral', negative: 'Negatif' } as Record<string, string>)[
        s
      ] ?? s,
  },
  en: {
    title: 'Citations',
    subtitleBase: 'The actual AI answers where your brand shows up.',
    subtitleWithData: (total: number): string =>
      `The actual AI answers where your brand shows up. ${total} answers collected. Click any row to see the full answer.`,
    allModels: 'All Models',
    filterModelAria: 'Filter by model',
    modelLocked: 'Available on a higher plan',
    showLabel: 'Show',
    checkedOn: (d: string): string => `Checked ${d}`,
    statusNotMentioned: 'Not mentioned',
    statusPositive: 'Mentioned positively',
    statusNeutral: 'Mentioned neutrally',
    statusNegative: 'Mentioned negatively',
    filterAll: 'All',
    filterMentioned: 'Mentioned',
    filterNotMentioned: 'Not mentioned',
    mentioned: 'Mentioned',
    notMentioned: 'Not mentioned',
    statTotal: 'Total Answers',
    statMentioned: 'Total Mentioned',
    statNotMentioned: 'Total Not Mentioned',
    emptyTitle: 'No results yet',
    emptyDesc: 'Run a scan to start collecting AI answers.',
    pageOf: (p: number, total: number): string => `Page ${p} of ${total}`,
    prev: 'Prev',
    next: 'Next',
    panelAria: 'AI answer detail',
    promptLabel: 'Prompt',
    closeAria: 'Close panel',
    brandContext: 'Where your brand appears',
    fullResponse: 'Full Answer',
    copy: 'Copy',
    copied: 'Copied!',
    notStored: 'Full answer not stored',
    notStoredHint: 'Run a new scan to save full answers',
    resultId: 'Result ID:',
    sentimentLabel: (s: string): string =>
      ({ positive: 'Positive', neutral: 'Neutral', negative: 'Negative' } as Record<
        string,
        string
      >)[s] ?? s,
  },
} as const

/** Upcoming AI models, shown locked in the model tab bar (gated by plan). */
const LOCKED_MODELS = ['Grok', 'DeepSeek'] as const

/** Mention + sentiment status tones → dot + text token classes. */
const STATUS_STYLES: Record<'brand' | 'error' | 'neutral' | 'muted', { dot: string; text: string }> = {
  brand: { dot: 'bg-icon-brand', text: 'text-brand-token' },
  error: { dot: 'bg-icon-error', text: 'text-error-token' },
  neutral: { dot: 'bg-icon-light-gray', text: 'text-secondary' },
  muted: { dot: 'bg-icon-light-gray', text: 'text-tertiary' },
}

/** Localized "Dicek <date>" / "Checked <date>" from a queriedAt timestamp. */
function checkedLabel(dateStr: string, lang: 'id' | 'en', t: { checkedOn: (d: string) => string }): string {
  const formatted = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
  return t.checkedOn(formatted)
}

/** Close glyph: same 20px / 1.5 round-cap stroke family as dashboard nav-icons. */
function CloseIcon({ className }: { className?: string }): ReactElement {
  return <PhosphorX className={className} aria-hidden="true" />
}

/** Highlights brand-name occurrences (regex-escaped, case-insensitive) with DS display-brand marks. */
function highlightBrand(text: string, brandName: string): ReactNode {
  if (!brandName || !text) return text
  const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const exact = new RegExp(`^${escaped}$`, 'i')
  return text.split(new RegExp(`(${escaped})`, 'gi')).map((part, i) =>
    exact.test(part) ? (
      <mark key={i} className="rounded-token-4 bg-display-brand px-1 text-brand-token">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

/** Model logo + name inline (no chip), so the colored brand mark sits on the card surface. */
function ModelInline({ model }: { model: string }): ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5">
      <ModelLogo model={model} className="size-4" />
      <span className="text-label-medium font-medium text-secondary">{MODEL_LABELS[model] || model}</span>
    </span>
  )
}

/**
 * Mention + sentiment as ONE self-explanatory status (dot + phrase), e.g.
 * "Disebut secara positif" / "Tidak disebut". Sentiment shows only when the
 * brand was actually mentioned, so positive/negative is never ambiguous.
 */
function MentionStatus({ mentioned, sentiment }: { mentioned: boolean; sentiment: string }): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const { label, tone } = !mentioned
    ? { label: t.statusNotMentioned, tone: 'muted' as const }
    : sentiment === 'positive'
      ? { label: t.statusPositive, tone: 'brand' as const }
      : sentiment === 'negative'
        ? { label: t.statusNegative, tone: 'error' as const }
        : { label: t.statusNeutral, tone: 'neutral' as const }
  const style = STATUS_STYLES[tone]
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-2 shrink-0 rounded-circle', style.dot)} aria-hidden="true" />
      <span className={cn('text-label-medium font-medium', style.text)}>{label}</span>
    </span>
  )
}

/** Composition wrapper: makes a DS Chip act as a toggle filter (no new primitive styling). */
function FilterChip({
  label,
  active,
  activeType = 'neutral',
  onClick,
}: {
  label: string
  active: boolean
  activeType?: ChipType
  onClick: () => void
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-circle outline-none transition-colors duration-200 ease-standard focus-visible:bg-btn-ghost-pressed"
    >
      <Chip
        type={active ? activeType : 'neutral'}
        shape="rounded"
        size="sm"
        outlined={!active}
        className="cursor-pointer"
      >
        {label}
      </Chip>
    </button>
  )
}

/** Slide-over detail panel: fixed right, Card styling, vertical+opacity entrance per motion rules. */
function ResultPanel({
  result,
  brandName,
  onClose,
}: {
  result: QueryResult
  brandName: string
  onClose: () => void
}): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function copy(text: string): void {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop, click closes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: transitionEnter() }}
        exit={{ opacity: 0, transition: transitionExit() }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-overlay"
        aria-hidden="true"
      />

      {/* Panel: vertical movement + opacity only (motion rules) */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.panelAria}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: transitionEnter() }}
        exit={{ opacity: 0, y: 24, transition: transitionExit() }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col overflow-hidden border-l border-neutral-primary bg-card shadow-regular-xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-neutral-primary px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-label-medium font-medium text-tertiary">{t.promptLabel}</p>
            <p className="line-clamp-3 text-paragraph-medium text-primary">
              {result.promptId?.text || '-'}
            </p>
          </div>
          <IconButton type="ghost" size="sm" aria-label={t.closeAria} onClick={onClose} className="shrink-0">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-neutral-primary bg-secondary px-5 py-3">
          <ModelInline model={result.model} />
          {result.promptId?.category && (
            <Chip type={categoryMeta(result.promptId.category).tone} size="sm" outlined>
              {categoryMeta(result.promptId.category).label[lang]}
            </Chip>
          )}
          <MentionStatus mentioned={result.mentioned} sentiment={result.sentiment} />
          <span className="ml-auto text-label-medium text-tertiary">
            {checkedLabel(result.queriedAt, lang, t)}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          {/* Brand context */}
          {result.mentionContext && (
            <div className="flex flex-col gap-2">
              <p className="text-label-medium font-medium text-tertiary">{t.brandContext}</p>
              <div className="rounded-token-12 bg-display-warning px-4 py-3 text-paragraph-medium leading-relaxed text-primary">
                {highlightBrand(result.mentionContext, brandName)}
              </div>
            </div>
          )}

          {/* Full response */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-label-medium font-medium text-tertiary">{t.fullResponse}</p>
              {result.response && (
                <Button type="ghost" size="sm" onClick={() => copy(result.response)}>
                  {copied ? t.copied : t.copy}
                </Button>
              )}
            </div>
            {result.response ? (
              <div className="whitespace-pre-wrap rounded-token-12 border border-neutral-primary bg-secondary px-4 py-3 text-paragraph-medium leading-relaxed text-secondary">
                {highlightBrand(result.response, brandName)}
              </div>
            ) : (
              <div className="rounded-token-12 border border-dashed border-neutral-primary px-4 py-4 text-center">
                <p className="text-paragraph-medium text-tertiary">{t.notStored}</p>
                <p className="mt-1 text-paragraph-medium text-tertiary">{t.notStoredHint}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-primary bg-secondary px-5 py-3 text-label-medium text-tertiary">
          {t.resultId} {result._id}
        </div>
      </motion.div>
    </>
  )
}

export default function CitationsPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [brandName, setBrandName] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [mentionFilter, setMentionFilter] = useState<MentionFilter>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<QueryResult | null>(null)
  // Brand-wide totals for the summary cards (NOT the filtered/per-page counts).
  const [overall, setOverall] = useState<{ totalQueries: number; mentionCount: number } | null>(null)

  // Brand name for highlighting; failure swallowed (parity with legacy page).
  useEffect(() => {
    apiFetch<{ name: string }>(`/brands/${id}`)
      .then((b) => setBrandName(b.name))
      .catch(() => {})
    apiFetch<{ overall: { totalQueries: number; mentionCount: number } }>(`/brands/${id}/analytics`)
      .then((a) => setOverall(a.overall))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (modelFilter) params.set('model', modelFilter)
    if (mentionFilter === 'mentioned') params.set('mentioned', 'true')
    if (mentionFilter === 'not-mentioned') params.set('mentioned', 'false')
    apiFetch<ResultsResponse>(`/brands/${id}/results?${params}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, modelFilter, mentionFilter, page])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const mentionedCount = data?.results.filter((r) => r.mentioned).length ?? 0

  /** Model filter tabs: "All Models" + the four tracked models, each with its
   *  real provider logo so the AI is recognisable at a glance. */
  const modelTabs: TabItem[] = [
    { id: 'all', label: t.allModels },
    ...(['openai', 'gemini', 'perplexity', 'anthropic'] as const).map((m) => ({
      id: m,
      label: (
        <span className="inline-flex items-center gap-1.5">
          <ModelLogo model={m} className="size-4" />
          {MODEL_LABELS[m]}
        </span>
      ),
    })),
  ]

  function handleModelChange(tabId: string): void {
    setModelFilter(tabId === 'all' ? '' : tabId)
    setPage(1)
  }

  function handleMentionChange(value: MentionFilter): void {
    setMentionFilter(value)
    setPage(1)
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>, result: QueryResult): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelected(result)
    }
  }

  return (
    <PageContainer wide>
      <PageHeader
        title={t.title}
        subtitle={data ? t.subtitleWithData(data.total) : t.subtitleBase}
      />

      {/* Model tab bar (with baseline) + locked upcoming models; mention filter below */}
      <Section className="gap-3">
        <div className="flex w-full flex-wrap items-center gap-1 border-b border-neutral-primary">
          <Tabs
            aria-label={t.filterModelAria}
            items={modelTabs}
            activeId={modelFilter || 'all'}
            onChange={handleModelChange}
            className="flex-wrap"
          />
          {LOCKED_MODELS.map((name) => (
            <Popover key={name} label={name} content={t.modelLocked} side="bottom">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-label-big font-medium">
                <LockIcon className="size-4" />
                {name}
              </span>
            </Popover>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-medium font-medium text-tertiary">{t.showLabel}</span>
          <FilterChip label={t.filterAll} active={mentionFilter === ''} onClick={() => handleMentionChange('')} />
          <FilterChip
            label={t.filterMentioned}
            active={mentionFilter === 'mentioned'}
            activeType="success"
            onClick={() => handleMentionChange('mentioned')}
          />
          <FilterChip
            label={t.filterNotMentioned}
            active={mentionFilter === 'not-mentioned'}
            onClick={() => handleMentionChange('not-mentioned')}
          />
        </div>
      </Section>

      {error && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={error} />
        </motion.div>
      )}

      {loading && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </motion.div>
      )}

      {!loading && data?.results.length === 0 && (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState icon={<CitationsIcon />} title={t.emptyTitle} description={t.emptyDesc} />
        </motion.div>
      )}

      {!loading && data && data.results.length > 0 && (
        <>
          {/* Summary cards: brand-wide totals (from /analytics), not the filtered page. */}
          <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t.statTotal} value={overall?.totalQueries ?? data.total} />
            <StatCard
              label={t.statMentioned}
              value={<span className="text-brand-token">{overall?.mentionCount ?? mentionedCount}</span>}
            />
            <StatCard
              label={t.statNotMentioned}
              value={
                overall != null
                  ? overall.totalQueries - overall.mentionCount
                  : data.results.length - mentionedCount
              }
            />
          </motion.div>

          {/* Result rows as cards */}
          <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
            {data.results.map((r) => (
              <Card
                key={r._id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(r)}
                onKeyDown={(event) => handleRowKeyDown(event, r)}
                className="flex cursor-pointer flex-col gap-2.5 p-4 outline-none transition-colors duration-200 ease-standard hover:bg-secondary focus-visible:bg-secondary"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="line-clamp-2 min-w-0 flex-1 text-paragraph-medium font-medium text-primary">
                    {r.promptId?.text || '-'}
                  </p>
                  <span className="shrink-0 whitespace-nowrap text-label-medium text-tertiary">
                    {checkedLabel(r.queriedAt, lang, t)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <ModelInline model={r.model} />
                  <span aria-hidden="true" className="text-tertiary">·</span>
                  <MentionStatus mentioned={r.mentioned} sentiment={r.sentiment} />
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Pagination footer */}
          {totalPages > 1 && (
            <motion.div variants={fadeUp} className="flex w-full items-center justify-between">
              <span className="text-paragraph-medium text-secondary">
                {t.pageOf(page, totalPages)}
              </span>
              <div className="flex items-center gap-2">
                <Button type="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  {t.prev}
                </Button>
                <Button
                  type="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t.next}
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {selected && (
          <ResultPanel result={selected} brandName={brandName} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
