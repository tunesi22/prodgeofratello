'use client'

import type { MouseEvent, ReactElement } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CircleNotch, DownloadSimple, Plus, MagnifyingGlass, Trash, PencilSimpleLine } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp, transitionEnter, transitionExit } from '@/lib/motion'
import { cn } from '@/lib/cn'
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { Button, Chip, IconButton, Input } from '@/components/ui'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ArticleComposer } from '@/components/articles/ArticleComposer'
import { ArticleContent } from '@/components/articles/ArticleContent'
import {
  defaultConfig,
  loadDrafts,
  saveDrafts,
  type ArticleConfig,
  type ArticleDraft,
} from '@/lib/article-composer'
import { loadKBSources, type KBSource } from '@/lib/knowledge'

interface Prompt {
  _id: string
  text: string
  category: string
  mentionRate?: number
}

interface Article {
  _id: string
  title: string
  content: string
  status: string
  generatedAt: string
  promptId: { _id: string; text: string; category: string } | null
}

/** A generation in flight, shown as a loading card in the grid until the real
 *  article comes back from the API (or the request fails and it's removed). */
interface PendingArticle {
  tempId: string
  title: string
}

type StatusFilter = 'all' | 'draft' | 'ready'

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Artikel AI',
    subtitle: 'Artikel siap publish yang membantu AI menyebut brand Anda lebih sering, dibuat dari prompt Anda.',
    loadFailed: 'Gagal memuat artikel',
    generateFailed: 'Gagal membuat artikel',
    exportFailed: 'Gagal export artikel',
    newArticle: 'Artikel baru',
    generating: 'Sedang dibuat...',
    search: 'Cari artikel...',
    filterAll: 'Semua',
    filterDraft: 'Draf',
    filterReady: 'Siap',
    yourArticles: 'Artikel Anda',
    itemCount: (n: number): string => `${n} item`,
    noArticlesTitle: 'Belum ada artikel',
    noArticlesDesc: 'Buat artikel pertama Anda untuk membantu AI menyebut brand Anda.',
    noMatchTitle: 'Tidak ada yang cocok',
    noMatchDesc: 'Coba ubah kata kunci pencarian atau filter status.',
    ready: 'Siap',
    draft: 'Draf',
    draftBadge: 'Draf lokal',
    resume: 'Lanjutkan',
    deleteDraftAria: 'Hapus draf',
    draftUntitled: 'Draf tanpa judul',
    previewAria: 'Pratinjau artikel',
    downloadMd: 'Download .md',
    downloadHtml: 'Download .html',
    closePreview: 'Tutup pratinjau',
    fromPrompt: 'Dari prompt',
    openArticleAria: 'Buka artikel',
  },
  en: {
    title: 'AI Articles',
    subtitle: 'Ready-to-publish articles that help AI mention your brand more, generated from your prompts.',
    loadFailed: 'Failed to load articles',
    generateFailed: 'Failed to generate article',
    exportFailed: 'Export failed',
    newArticle: 'New article',
    generating: 'Generating...',
    search: 'Search articles...',
    filterAll: 'All',
    filterDraft: 'Draft',
    filterReady: 'Ready',
    yourArticles: 'Your articles',
    itemCount: (n: number): string => `${n} items`,
    noArticlesTitle: 'No articles yet',
    noArticlesDesc: 'Create your first article to help AI mention your brand.',
    noMatchTitle: 'Nothing matches',
    noMatchDesc: 'Try a different search term or status filter.',
    ready: 'Ready',
    draft: 'Draft',
    draftBadge: 'Local draft',
    resume: 'Resume',
    deleteDraftAria: 'Delete draft',
    draftUntitled: 'Untitled draft',
    previewAria: 'Article preview',
    downloadMd: 'Download .md',
    downloadHtml: 'Download .html',
    closePreview: 'Close preview',
    fromPrompt: 'From prompt',
    openArticleAria: 'Open article',
  },
} as const

/**
 * Full-screen reading view for a generated article. Renders the markdown as a
 * real article (no raw `#`/`**`) via ArticleContent, and keeps the .md / .html
 * downloads in the top bar.
 */
function ArticleReader({
  article,
  onClose,
  onExport,
}: {
  article: Article
  onClose: () => void
  onExport: (format: 'md' | 'html') => void
}): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const isReady = article.status === 'ready'

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t.previewAria}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: transitionEnter() }}
      exit={{ opacity: 0, transition: transitionExit() }}
      className="fixed inset-0 z-50 flex flex-col bg-primary"
    >
      {/* Top bar: back, title, downloads. Sticky via flex layout. */}
      <div className="flex shrink-0 items-center gap-3 border-b border-neutral-primary bg-card px-6 py-3 transition-colors duration-300 ease-standard">
        <IconButton type="ghost" size="sm" aria-label={t.closePreview} onClick={onClose}>
          <ArrowLeft aria-hidden="true" />
        </IconButton>
        <span className="min-w-0 flex-1 truncate text-label-big font-medium text-primary">{article.title}</span>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="primary-outlined" size="sm" onClick={() => onExport('md')}>
            {t.downloadMd}
          </Button>
          <Button type="primary-outlined" size="sm" onClick={() => onExport('html')}>
            {t.downloadHtml}
          </Button>
        </div>
      </div>

      {/* Reading column. */}
      <div className="flex-1 overflow-y-auto">
        <motion.article
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-[720px] px-6 py-12"
        >
          <header className="mb-8 flex flex-col gap-4 border-b border-neutral-primary pb-8">
            <h1 className="text-h2 font-semibold text-primary transition-colors duration-300 ease-standard">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-label-medium text-tertiary">
              <Chip size="sm" shape="rounded" type={isReady ? 'success' : 'neutral'}>
                {isReady ? t.ready : t.draft}
              </Chip>
              <span>{new Date(article.generatedAt).toLocaleDateString()}</span>
              {article.promptId?.text && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="min-w-0 truncate">
                    {t.fromPrompt}: {article.promptId.text}
                  </span>
                </>
              )}
            </div>
          </header>

          <ArticleContent content={article.content} omitFirstH1 />
        </motion.article>
      </div>
    </motion.div>
  )
}

/**
 * The "create" affordance, living as the first cell of the grid (top-left) so it
 * is always reachable without a separate header button. Dashed outline + plus to
 * read as an "add" tile rather than a content card.
 */
function NewArticleCard({ label, onClick }: { label: string; onClick: () => void }): ReactElement {
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 p-4 outline-none',
        'border-dashed border-neutral-secondary text-tertiary',
        'transition-colors duration-200 ease-standard hover:border-brand-token hover:text-brand-token',
        'focus-visible:border-brand-token focus-visible:text-brand-token',
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
        <Plus className="size-6" aria-hidden="true" />
      </span>
      <span className="text-paragraph-medium font-medium">{label}</span>
    </Card>
  )
}

/** Placeholder card for an article that is being generated in the background. */
function PendingArticleCard({ title, label }: { title: string; label: string }): ReactElement {
  return (
    <Card className="flex min-h-[180px] flex-col justify-between gap-3 p-4">
      <div className="flex flex-col gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-icon-brand">
          <CircleNotch className="size-5 animate-spin" aria-hidden="true" />
        </span>
        <p className="line-clamp-3 text-paragraph-medium font-medium text-primary">{title}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Chip size="sm" shape="rounded" type="neutral">
          {label}
        </Chip>
        <Skeleton className="h-2 w-2/3" />
      </div>
    </Card>
  )
}

function ArticlesInner(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [articles, setArticles] = useState<Article[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [gapIds, setGapIds] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<ArticleDraft[]>([])
  const [knowledge, setKnowledge] = useState<KBSource[]>([])

  const [preview, setPreview] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const [mode, setMode] = useState<'list' | 'compose'>('list')
  const [composeInitial, setComposeInitial] = useState<ArticleConfig>(defaultConfig(lang))
  const [resumeDraftId, setResumeDraftId] = useState<string | null>(null)
  // Generations in flight, rendered as loading cards in the list.
  const [pending, setPending] = useState<PendingArticle[]>([])

  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Deep-link from the "Create content" CTAs: /articles?promptId=...
  const searchParams = useSearchParams()
  const deepLinkPromptId = searchParams.get('promptId')

  useEffect(() => {
    setDrafts(loadDrafts(id))
    setKnowledge(loadKBSources(id))
    Promise.all([
      apiFetch<{ articles: Article[] }>(`/brands/${id}/articles`),
      apiFetch<{ prompts: Prompt[] }>(`/brands/${id}/prompts`),
      apiFetch<{ gaps: Prompt[] }>(`/brands/${id}/analytics/gaps`).catch(() => ({ gaps: [] as Prompt[] })),
    ])
      .then(([a, p, g]) => {
        setArticles(a.articles)
        setPrompts(p.prompts)
        setGapIds(new Set(g.gaps.map((gap) => gap._id)))
        // Deep link opens the composer straight away with that prompt selected.
        if (deepLinkPromptId != null && p.prompts.some((pr) => pr._id === deepLinkPromptId)) {
          setComposeInitial({ ...defaultConfig(lang), promptId: deepLinkPromptId })
          setResumeDraftId(null)
          setMode('compose')
        }
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : t.loadFailed)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function openNew(): void {
    setComposeInitial(defaultConfig(lang))
    setResumeDraftId(null)
    setGenerateError(null)
    setMode('compose')
  }

  function openDraft(draft: ArticleDraft): void {
    const { id: _did, title: _dt, savedAt: _ds, ...config } = draft
    setComposeInitial(config)
    setResumeDraftId(draft.id)
    setGenerateError(null)
    setMode('compose')
  }

  function draftTitle(config: ArticleConfig): string {
    if (config.promptId != null) {
      const p = prompts.find((pr) => pr._id === config.promptId)
      if (p) return p.text
    }
    if (config.brief.trim() !== '') return config.brief.trim().slice(0, 60)
    return t.draftUntitled
  }

  function handleSaveDraft(config: ArticleConfig): void {
    const now = new Date().toISOString()
    const draft: ArticleDraft = {
      ...config,
      id: resumeDraftId ?? crypto.randomUUID(),
      title: draftTitle(config),
      savedAt: now,
    }
    setDrafts((prev) => {
      const next = resumeDraftId != null ? prev.map((d) => (d.id === resumeDraftId ? draft : d)) : [draft, ...prev]
      saveDrafts(id, next)
      return next
    })
    setMode('list')
  }

  function removeDraft(draftId: string): void {
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== draftId)
      saveDrafts(id, next)
      return next
    })
  }

  async function handleGenerate(config: ArticleConfig): Promise<void> {
    if (config.promptId == null) return

    const selected = prompts.find((pr) => pr._id === config.promptId)
    const tempId = crypto.randomUUID()

    // Leave the composer straight away and show a loading card in the list; the
    // generation continues in the background and swaps in when it returns.
    const wasResuming = resumeDraftId
    setGenerateError(null)
    setPending((prev) => [{ tempId, title: selected?.text ?? t.draftUntitled }, ...prev])
    setMode('list')

    try {
      // Backend consumes promptId today; the rest is sent forward-compatibly.
      const article = await apiFetch<Article>(`/brands/${id}/articles/generate`, {
        method: 'POST',
        body: JSON.stringify({
          promptId: config.promptId,
          contentType: config.contentType,
          length: config.length,
          language: config.language,
          tone: config.tone,
          sources: config.sources,
          brief: config.brief,
          knowledgeIds: config.knowledgeIds,
          restrictions: config.restrictions,
        }),
      })
      // The generate endpoint returns promptId UNPOPULATED (a raw id string), unlike
      // the list endpoint. Rebuild the populated shape from the local prompt so the
      // card, preview, and search all read promptId.text safely.
      const normalized: Article = {
        ...article,
        promptId: selected ? { _id: selected._id, text: selected.text, category: selected.category } : null,
      }
      setPending((prev) => prev.filter((p) => p.tempId !== tempId))
      setArticles((prev) => [normalized, ...prev])
      if (wasResuming != null) removeDraft(wasResuming)
    } catch (e: unknown) {
      setPending((prev) => prev.filter((p) => p.tempId !== tempId))
      setGenerateError(e instanceof Error ? e.message : t.generateFailed)
    }
  }

  async function handleExport(articleId: string, format: 'md' | 'html'): Promise<void> {
    setExportError(null)
    try {
      const res = await fetch(`/api/brands/${id}/articles/${articleId}/export?format=${format}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        setExportError(t.exportFailed)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `article-${articleId}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      setExportError(e instanceof Error ? e.message : t.exportFailed)
    }
  }

  // ── Compose mode ────────────────────────────────────────────────────────
  if (mode === 'compose') {
    return (
      <PageContainer wide>
        <ArticleComposer
          key={resumeDraftId ?? 'new'}
          brandId={id}
          prompts={prompts}
          gapIds={gapIds}
          knowledge={knowledge}
          initial={composeInitial}
          generating={false}
          error={generateError}
          onCancel={() => setMode('list')}
          onSaveDraft={handleSaveDraft}
          onGenerate={(config) => void handleGenerate(config)}
        />
      </PageContainer>
    )
  }

  // ── List mode ───────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase()
  const visibleDrafts =
    statusFilter === 'ready'
      ? []
      : drafts.filter((d) => q === '' || d.title.toLowerCase().includes(q))
  const visibleArticles = articles.filter((a) => {
    if (statusFilter === 'draft' && a.status !== 'draft') return false
    if (statusFilter === 'ready' && a.status !== 'ready') return false
    if (q === '') return true
    // Defensive: promptId can be an unpopulated string at runtime, so guard the shape.
    const promptText = a.promptId != null && typeof a.promptId === 'object' ? a.promptId.text : ''
    return a.title.toLowerCase().includes(q) || promptText.toLowerCase().includes(q)
  })
  const totalItems = drafts.length + articles.length
  const visibleCount = visibleDrafts.length + visibleArticles.length

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t.filterAll },
    { value: 'draft', label: t.filterDraft },
    { value: 'ready', label: t.filterReady },
  ]

  return (
    <PageContainer wide>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {loadError != null && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={loadError} />
        </motion.div>
      )}

      {generateError != null && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={generateError} />
        </motion.div>
      )}

      {loading ? (
        <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </motion.div>
      ) : (
        <>
          {/* Search + filters appear only once there is something to filter.
              In the empty state just the New-article tile is shown. */}
          {totalItems > 0 && (
            <motion.div variants={fadeUp} className="flex w-full flex-wrap items-center justify-between gap-3">
              <div className="w-full max-w-xs">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.search}
                  iconLeft={<MagnifyingGlass className="size-5" aria-hidden="true" />}
                  aria-label={t.search}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-label-medium text-tertiary">{t.itemCount(visibleCount)}</span>
                <div className="flex items-center gap-1 rounded-token-8 border border-neutral-primary bg-secondary p-1">
                  {FILTERS.map((f) => {
                    const active = statusFilter === f.value
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setStatusFilter(f.value)}
                        aria-pressed={active}
                        className={cn(
                          'rounded-token-4 px-3 py-1 text-label-medium font-medium transition-colors duration-200 ease-standard',
                          active ? 'bg-card text-primary shadow-center-sm' : 'text-secondary hover:text-primary',
                        )}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {exportError != null && <ErrorBanner message={exportError} />}

          {/* The New-article tile is always the first cell (top-left), followed by
              any in-flight generations, then drafts and generated articles. */}
          <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <NewArticleCard label={t.newArticle} onClick={openNew} />

            {pending.map((p) => (
              <PendingArticleCard key={p.tempId} title={p.title} label={t.generating} />
            ))}

            {/* Local drafts first */}
            {visibleDrafts.map((d) => (
                <Card key={`draft-${d.id}`} className="flex min-h-[180px] flex-col justify-between gap-3 p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-token-8 bg-display-neutral text-icon-dark-gray">
                        <PencilSimpleLine className="size-5" aria-hidden="true" />
                      </span>
                      <IconButton
                        type="ghost"
                        size="sm"
                        aria-label={t.deleteDraftAria}
                        onClick={() => removeDraft(d.id)}
                      >
                        <Trash aria-hidden="true" />
                      </IconButton>
                    </div>
                    <p className="line-clamp-3 text-paragraph-medium font-medium text-primary">{d.title}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" shape="rounded" type="neutral">
                        {t.draftBadge}
                      </Chip>
                      <span className="text-label-medium text-tertiary">
                        {new Date(d.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button type="primary-outlined" size="sm" onClick={() => openDraft(d)} className="w-fit">
                      {t.resume}
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Generated articles */}
              {visibleArticles.map((article) => (
                <Card
                  key={article._id}
                  role="button"
                  tabIndex={0}
                  aria-label={t.openArticleAria}
                  aria-pressed={preview?._id === article._id}
                  onClick={() => setPreview(article)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setPreview(article)
                    }
                  }}
                  className={cn(
                    'group flex cursor-pointer flex-col gap-3 p-5 outline-none',
                    'transition-all duration-200 ease-standard hover:border-neutral-secondary hover:shadow-center-sm focus-visible:border-brand-token',
                    preview?._id === article._id && 'border-brand-token',
                  )}
                >
                  {/* Kicker: status + date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip size="sm" shape="rounded" type={article.status === 'ready' ? 'success' : 'neutral'}>
                      {article.status === 'ready' ? t.ready : t.draft}
                    </Chip>
                    <span className="text-label-medium text-tertiary">
                      {new Date(article.generatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="line-clamp-2 text-label-big font-semibold text-primary">{article.title}</p>

                  {/* Source prompt, when present */}
                  {article.promptId != null && typeof article.promptId === 'object' && article.promptId.text !== '' && (
                    <p className="line-clamp-1 text-paragraph-medium text-tertiary">
                      {t.fromPrompt}: {article.promptId.text}
                    </p>
                  )}

                  {/* Downloads */}
                  <div className="mt-auto flex items-center gap-2 border-t border-neutral-primary pt-3">
                    <Button
                      type="primary-outlined"
                      size="sm"
                      iconLeft={<DownloadSimple className="size-4" aria-hidden="true" />}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        void handleExport(article._id, 'md')
                      }}
                    >
                      .md
                    </Button>
                    <Button
                      type="primary-outlined"
                      size="sm"
                      iconLeft={<DownloadSimple className="size-4" aria-hidden="true" />}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        void handleExport(article._id, 'html')
                      }}
                    >
                      .html
                    </Button>
                  </div>
                </Card>
              ))}
            </motion.div>

            {totalItems > 0 && visibleCount === 0 && (
              <motion.div variants={fadeUp} className="w-full">
                <EmptyState title={t.noMatchTitle} description={t.noMatchDesc} />
              </motion.div>
            )}
          </>
      )}

      <AnimatePresence>
        {preview != null && (
          <ArticleReader
            article={preview}
            onClose={() => setPreview(null)}
            onExport={(format) => void handleExport(preview._id, format)}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

/** useSearchParams (deep-link promptId) requires a Suspense boundary. */
export default function ArticlesPage(): ReactElement {
  return (
    <Suspense fallback={null}>
      <ArticlesInner />
    </Suspense>
  )
}
