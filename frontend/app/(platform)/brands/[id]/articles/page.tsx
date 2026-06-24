'use client'

import type { MouseEvent, ReactElement } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X as PhosphorX, FileText, Plus, MagnifyingGlass, Trash, PencilSimpleLine } from '@phosphor-icons/react/dist/ssr'
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
import { SuggestedIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ArticleComposer } from '@/components/articles/ArticleComposer'
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

/** Right-sliding preview panel for a generated article. */
function ArticlePreviewPanel({
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
        aria-label={t.previewAria}
        initial={{ x: '100%' }}
        animate={{ x: 0, transition: transitionEnter() }}
        exit={{ x: '100%', transition: transitionExit() }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[640px] flex-col overflow-hidden border-l border-neutral-primary bg-card shadow-regular-xl"
      >
        <div className="flex items-start gap-3 border-b border-neutral-primary px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-h6 font-normal text-primary">{article.title}</h2>
            {article.promptId?.text && (
              <p className="mt-1 line-clamp-1 text-label-medium text-tertiary">
                {t.fromPrompt}: {article.promptId.text}
              </p>
            )}
          </div>
          <IconButton type="ghost" size="sm" aria-label={t.closePreview} onClick={onClose} className="shrink-0">
            <PhosphorX aria-hidden="true" />
          </IconButton>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-primary bg-secondary px-5 py-3">
          <Button type="primary-outlined" size="sm" onClick={() => onExport('md')}>
            {t.downloadMd}
          </Button>
          <Button type="primary-outlined" size="sm" onClick={() => onExport('html')}>
            {t.downloadHtml}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="whitespace-pre-wrap text-paragraph-medium leading-relaxed text-primary">
            {article.content}
          </div>
        </div>
      </motion.div>
    </>
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
  const [generating, setGenerating] = useState<boolean>(false)

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
    setGenerating(true)
    setGenerateError(null)
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
      const selected = prompts.find((pr) => pr._id === config.promptId)
      const normalized: Article = {
        ...article,
        promptId: selected ? { _id: selected._id, text: selected.text, category: selected.category } : null,
      }
      setArticles((prev) => [normalized, ...prev])
      if (resumeDraftId != null) removeDraft(resumeDraftId)
      setMode('list')
      setPreview(normalized)
    } catch (e: unknown) {
      setGenerateError(e instanceof Error ? e.message : t.generateFailed)
    } finally {
      setGenerating(false)
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
          generating={generating}
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

      {loading ? (
        <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </motion.div>
      ) : totalItems === 0 ? (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<SuggestedIcon />}
            title={t.noArticlesTitle}
            description={t.noArticlesDesc}
            action={
              <Button type="primary" iconLeft={<Plus className="size-5" aria-hidden="true" />} onClick={openNew}>
                {t.newArticle}
              </Button>
            }
          />
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp} className="flex w-full justify-center">
            <Button type="primary" iconLeft={<Plus className="size-5" aria-hidden="true" />} onClick={openNew}>
              {t.newArticle}
            </Button>
          </motion.div>
          {/* Toolbar */}
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
          </motion.div>

          {exportError != null && <ErrorBanner message={exportError} />}

          {visibleCount === 0 ? (
            <motion.div variants={fadeUp} className="w-full">
              <EmptyState title={t.noMatchTitle} description={t.noMatchDesc} />
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    'flex min-h-[180px] cursor-pointer flex-col justify-between gap-3 p-4 outline-none',
                    'transition-colors duration-200 ease-standard hover:border-neutral-secondary focus-visible:border-brand-token',
                    preview?._id === article._id && 'border-brand-token',
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-icon-brand">
                      <FileText className="size-5" aria-hidden="true" />
                    </span>
                    <p className="line-clamp-3 text-paragraph-medium font-medium text-primary">{article.title}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" shape="rounded" type={article.status === 'ready' ? 'success' : 'neutral'}>
                        {article.status === 'ready' ? t.ready : t.draft}
                      </Chip>
                      <span className="text-label-medium text-tertiary">
                        {new Date(article.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="ghost"
                        size="sm"
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          void handleExport(article._id, 'md')
                        }}
                      >
                        .md
                      </Button>
                      <Button
                        type="ghost"
                        size="sm"
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          void handleExport(article._id, 'html')
                        }}
                      >
                        .html
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {preview != null && (
          <ArticlePreviewPanel
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
