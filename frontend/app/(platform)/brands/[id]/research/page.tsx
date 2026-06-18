'use client'

/**
 * AI Prompt Research (sidebar: AI Visibility > AI Prompt Research).
 *
 * Extracted 1:1 from the legacy Prompts page's "Discover Real Queries" tab
 * (feature inventory §5). BrandNav and the tab switcher are removed; the new
 * dashboard sidebar owns navigation, and the "AI Generated" tab lives on the
 * Prompts page. The legacy success banner ("Switch to 'AI Generated' tab")
 * is replaced by an added-count banner with a link to /brands/{id}/prompts.
 */

import { useState } from 'react'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/cn'
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageContainer,
  PageHeader,
  Section,
  Skeleton,
} from '@/components/dashboard/primitives'
import { GoogleLogo, RedditLogo } from '@phosphor-icons/react/dist/ssr'
import { Button, Checkbox, Chip, LoadingCircle, Tabs } from '@/components/ui'
import type { TabItem } from '@/components/ui'
import { ResearchIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useTopLoading } from '@/components/providers/TopLoadingBar'
import { categoryMeta } from '@/lib/categories'

interface RealQuery {
  text: string
  source: 'google' | 'reddit'
  category: string
  sourceUrl: string
}

type SourceFilter = 'all' | 'google' | 'reddit'

/**
 * Source badge using the real Phosphor brand logos. Reddit keeps an orange-ish
 * tone via the warning token (closest to its brand colour without a hex
 * literal); Google stays neutral. `weight="fill"` makes the marks read as logos.
 */
function SourceBadge({ source, label }: { source: RealQuery['source']; label: string }): ReactElement {
  const Logo = source === 'google' ? GoogleLogo : RedditLogo
  return (
    <Chip size="sm" type={source === 'reddit' ? 'warning' : 'neutral'} iconLeft={<Logo weight="fill" />}>
      {label}
    </Chip>
  )
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Riset Pertanyaan',
    subtitle:
      'Ambil pertanyaan asli yang orang ketik di Google dan Reddit, bukan buatan AI, lalu tambahkan yang relevan ke kumpulan prompt Anda.',
    addSelected: (n: number): string => `Tambahkan ${n} ke Prompts`,
    adding: 'Menambahkan...',
    bannerTitle: 'Pertanyaan asli dari internet',
    bannerBody:
      'Kami mengambil pertanyaan yang benar-benar diketik orang di Google dan Reddit, bukan buatan AI. Pilih yang relevan dengan brand Anda, lalu tambahkan ke kumpulan prompt.',
    discoveringAria: 'Mencari pertanyaan asli',
    discoveringTitle: 'Sedang mencari pertanyaan asli...',
    step1: '① Menjelajah Google Autocomplete + Reddit',
    step2: '② Claude menyaring yang relevan dengan brand Anda',
    discoveringTime: 'Sekitar 15 sampai 20 detik',
    emptyTitle: 'Cari tahu apa yang benar-benar ditanyakan orang',
    emptyDesc: 'Kami mencari pertanyaan asli seputar industri Anda di Google Autocomplete dan Reddit.',
    discoverCta: 'Cari Pertanyaan Asli',
    resultsTitle: 'Pertanyaan yang Ditemukan',
    refresh: 'Cari Lagi',
    allSources: 'Semua Sumber',
    googleOnly: 'Hanya Google',
    redditOnly: 'Hanya Reddit',
    allCategories: 'Semua Kategori',
    filterSourceAria: 'Filter berdasarkan sumber',
    filterCategoryAria: 'Filter berdasarkan kategori',
    selectAllAria: 'Pilih semua pertanyaan yang terlihat',
    selectAll: 'Pilih semua',
    clear: 'Hapus pilihan',
    selectedCount: (n: number): string => `${n} dipilih`,
    addedBanner: (n: number): string => `${n} pertanyaan ditambahkan ke kumpulan prompt Anda.`,
    viewInPrompts: 'Lihat di Prompts',
    noMatchTitle: 'Tidak ada pertanyaan yang cocok dengan filter',
    noMatchDesc: 'Ganti filter sumber atau kategori untuk melihat lebih banyak pertanyaan.',
    selectQueryAria: (text: string): string => `Pilih pertanyaan: ${text}`,
    verify: 'cek sumber ↗',
    selectedBar: (n: number): string => `${n} pertanyaan dipilih`,
    discoverFailed: 'Pencarian gagal',
    importFailed: 'Gagal menambahkan',
  },
  en: {
    title: 'AI Prompt Research',
    subtitle:
      'Pull real questions people type on Google and Reddit, not AI-generated ones, and add the relevant ones to your prompt pool.',
    addSelected: (n: number): string => `Add ${n} to Prompts`,
    adding: 'Adding...',
    bannerTitle: 'Real questions from the internet',
    bannerBody:
      'We pull actual questions people type on Google and Reddit, not AI-generated ones. Select the ones relevant to your brand and add them to your prompt pool.',
    discoveringAria: 'Finding real questions',
    discoveringTitle: 'Finding real questions...',
    step1: '① Crawling Google Autocomplete + Reddit',
    step2: '② Claude filtering for relevance to your brand',
    discoveringTime: 'Takes about 15 to 20 seconds',
    emptyTitle: 'Find what people are actually asking',
    emptyDesc: 'We search Google Autocomplete and Reddit for real questions in your industry.',
    discoverCta: 'Discover Real Questions',
    resultsTitle: 'Questions Found',
    refresh: 'Refresh',
    allSources: 'All Sources',
    googleOnly: 'Google only',
    redditOnly: 'Reddit only',
    allCategories: 'All Categories',
    filterSourceAria: 'Filter by source',
    filterCategoryAria: 'Filter by category',
    selectAllAria: 'Select all visible questions',
    selectAll: 'Select all',
    clear: 'Clear',
    selectedCount: (n: number): string => `${n} selected`,
    addedBanner: (n: number): string =>
      `Added ${n} ${n === 1 ? 'question' : 'questions'} to your prompt pool.`,
    viewInPrompts: 'View them in Prompts',
    noMatchTitle: 'No questions match the current filters',
    noMatchDesc: 'Change the source or category filter to see more questions.',
    selectQueryAria: (text: string): string => `Select question: ${text}`,
    verify: 'verify ↗',
    selectedBar: (n: number): string => `${n} ${n === 1 ? 'question' : 'questions'} selected`,
    discoverFailed: 'Discovery failed',
    importFailed: 'Import failed',
  },
} as const

export default function ResearchPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const { start, done } = useTopLoading()
  const t = COPY[lang]

  const [discovered, setDiscovered] = useState<RealQuery[]>([])
  const [discovering, setDiscovering] = useState<boolean>(false)
  const [discoverError, setDiscoverError] = useState<string>('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState<boolean>(false)
  /** Count returned by the import endpoint; null until a successful import. */
  const [addedCount, setAddedCount] = useState<number | null>(null)
  const [filterSource, setFilterSource] = useState<SourceFilter>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  async function handleDiscover(): Promise<void> {
    setDiscovering(true)
    setDiscoverError('')
    setSelected(new Set())
    setAddedCount(null)
    start()
    try {
      const data = await apiFetch<{ queries: RealQuery[]; total: number }>(
        `/brands/${id}/prompts/discover`,
      )
      setDiscovered(data.queries)
      setFilterSource('all')
      setFilterCategory('all')
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : t.discoverFailed)
    } finally {
      setDiscovering(false)
      done()
    }
  }

  async function handleImport(): Promise<void> {
    // Selection is tracked by ORIGINAL index into `discovered` (parity with
    // the legacy filtered→original index map).
    const toImport: RealQuery[] = discovered.filter((_, i) => selected.has(i))
    if (toImport.length === 0) return
    setImporting(true)
    setDiscoverError('')
    start()
    try {
      const result = await apiFetch<{ added: number; total: number }>(
        `/brands/${id}/prompts/import`,
        { method: 'POST', body: JSON.stringify({ queries: toImport }) },
      )
      setAddedCount(result.added)
      setSelected(new Set())
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : t.importFailed)
    } finally {
      setImporting(false)
      done()
    }
  }

  function toggleSelect(index: number): void {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  // Visible queries after source + category filters, keeping original indexes.
  const visible: Array<{ query: RealQuery; index: number }> = discovered
    .map((query, index) => ({ query, index }))
    .filter(
      ({ query }) =>
        (filterSource === 'all' || query.source === filterSource) &&
        (filterCategory === 'all' || query.category === filterCategory),
    )

  function selectAll(): void {
    // Parity with legacy behavior: replaces the selection with all VISIBLE rows.
    setSelected(new Set(visible.map(({ index }) => index)))
  }

  function clearAll(): void {
    setSelected(new Set())
  }

  const sourceTabs: TabItem[] = [
    { id: 'all', label: t.allSources },
    { id: 'google', label: t.googleOnly },
    { id: 'reddit', label: t.redditOnly },
  ]

  const categoryTabs: TabItem[] = [
    'all',
    ...Array.from(new Set(discovered.map((q) => q.category))),
  ].map((category) => ({
    id: category,
    label: category === 'all' ? t.allCategories : categoryMeta(category).label[lang],
  }))

  const googleCount: number = discovered.filter((q) => q.source === 'google').length
  const redditCount: number = discovered.filter((q) => q.source === 'reddit').length
  const visibleSelectedCount: number = visible.filter(({ index }) => selected.has(index)).length
  const masterChecked: boolean | 'mixed' =
    visible.length > 0 && visibleSelectedCount === visible.length
      ? true
      : visibleSelectedCount > 0
        ? 'mixed'
        : false
  const hasResults: boolean = !discovering && discovered.length > 0

  return (
    <PageContainer wide>
      <PageHeader
        icon={<ResearchIcon className="h-[30px] w-[30px] text-icon-brand" />}
        title={t.title}
        subtitle={t.subtitle}
        actions={
          selected.size > 0 ? (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? t.adding : t.addSelected(selected.size)}
            </Button>
          ) : undefined
        }
      />

      {/* Info banner (legacy "Real queries from the internet") */}
      <motion.div variants={fadeUp}>
        <Card variant="brand" className="flex flex-col gap-1 p-4">
          <p className="text-paragraph-medium font-medium text-primary">{t.bannerTitle}</p>
          <p className="text-paragraph-medium text-secondary">{t.bannerBody}</p>
        </Card>
      </motion.div>

      {discoverError !== '' && (
        <motion.div variants={fadeUp}>
          <ErrorBanner message={discoverError} />
        </motion.div>
      )}

      {/* Discovering state: spinner + step copy + skeleton rows */}
      {discovering && (
        <Section>
          <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <LoadingCircle size="md" aria-label={t.discoveringAria} />
            <span className="text-label-big font-medium text-primary">{t.discoveringTitle}</span>
            <div className="flex flex-col gap-1 text-paragraph-medium text-secondary">
              <span>{t.step1}</span>
              <span>{t.step2}</span>
            </div>
            <span className="text-paragraph-medium text-tertiary">{t.discoveringTime}</span>
          </Card>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Section>
      )}

      {/* Initial empty state with the primary discover CTA */}
      {!discovering && discovered.length === 0 && (
        <motion.div variants={fadeUp}>
          <EmptyState
            icon={<ResearchIcon />}
            title={t.emptyTitle}
            description={t.emptyDesc}
            action={
              <Button size="md" onClick={handleDiscover}>
                {t.discoverCta}
              </Button>
            }
          />
        </motion.div>
      )}

      {/* Results */}
      {hasResults && (
        <Section
          title={t.resultsTitle}
          right={
            <Button type="primary-outlined" onClick={handleDiscover}>
              {t.refresh}
            </Button>
          }
        >
          {/* Source count chips + source filter */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <SourceBadge source="google" label={`${googleCount} Google`} />
              <SourceBadge source="reddit" label={`${redditCount} Reddit`} />
            </div>
            <Tabs
              aria-label={t.filterSourceAria}
              items={sourceTabs}
              activeId={filterSource}
              onChange={(tabId) => setFilterSource(tabId as SourceFilter)}
            />
          </div>

          {/* Category filter (dynamic categories from results) */}
          {categoryTabs.length > 1 && (
            <Tabs
              aria-label={t.filterCategoryAria}
              items={categoryTabs}
              activeId={filterCategory}
              onChange={setFilterCategory}
              className="flex-wrap"
            />
          )}

          {/* Select-all / clear controls + selection counter */}
          <div className="flex flex-wrap items-center gap-2">
            <Checkbox
              aria-label={t.selectAllAria}
              checked={masterChecked}
              onChange={(next) => (next ? selectAll() : clearAll())}
            />
            <Button type="ghost" onClick={selectAll}>
              {t.selectAll}
            </Button>
            <Button type="ghost" onClick={clearAll}>
              {t.clear}
            </Button>
            {selected.size > 0 && (
              <span className="text-label-medium font-medium text-tertiary">
                {t.selectedCount(selected.size)}
              </span>
            )}
          </div>

          {/* Import success banner: shows the added count (mirrors the
              ErrorBanner primitive with brand tokens). */}
          {addedCount !== null && (
            <div
              role="status"
              className="flex w-full flex-wrap items-center gap-2 rounded-token-12 border border-brand-token bg-display-brand px-4 py-3 transition-colors duration-300 ease-standard"
            >
              <p className="text-paragraph-medium text-brand-token">{t.addedBanner(addedCount)}</p>
              <Link
                href={`/brands/${id}/prompts`}
                className="text-paragraph-medium font-medium text-brand-token underline underline-offset-2 transition-colors duration-200 ease-standard hover:text-primary"
              >
                {t.viewInPrompts}
              </Link>
            </div>
          )}

          {/* Query cards */}
          {visible.length === 0 ? (
            <EmptyState title={t.noMatchTitle} description={t.noMatchDesc} />
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map(({ query, index }) => {
                const isSelected: boolean = selected.has(index)
                return (
                  // Selectable row: same anatomy as the Card primitive, but with
                  // a selected state (border-brand + display-brand tint) the
                  // primitive doesn't expose; built from token utilities only.
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => toggleSelect(index)}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleSelect(index)
                      }
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-3 rounded-token-12 border p-4 text-left',
                      'transition-colors duration-200 ease-standard',
                      isSelected
                        ? 'border-brand-token bg-display-brand'
                        : 'border-neutral-primary bg-card hover:border-neutral-secondary',
                    )}
                  >
                    <Checkbox
                      aria-label={t.selectQueryAria(query.text)}
                      checked={isSelected}
                      onChange={() => toggleSelect(index)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <p className="text-paragraph-medium text-primary">{query.text}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <SourceBadge
                          source={query.source}
                          label={query.source === 'google' ? 'Google' : 'Reddit'}
                        />
                        <Chip size="sm" type={categoryMeta(query.category).tone}>
                          {categoryMeta(query.category).label[lang]}
                        </Chip>
                        {query.sourceUrl && (
                          <a
                            href={query.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="text-label-medium text-tertiary underline underline-offset-2 transition-colors duration-200 ease-standard hover:text-primary"
                          >
                            {t.verify}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sticky bottom action bar */}
          {selected.size > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="sticky bottom-6 z-10"
            >
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4 shadow-regular-lg">
                <p className="text-paragraph-medium font-medium text-primary">
                  {t.selectedBar(selected.size)}
                </p>
                <div className="flex items-center gap-2">
                  <Button type="ghost" onClick={clearAll}>
                    {t.clear}
                  </Button>
                  <Button onClick={handleImport} disabled={importing}>
                    {importing ? t.adding : t.addSelected(selected.size)}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </Section>
      )}
    </PageContainer>
  )
}
