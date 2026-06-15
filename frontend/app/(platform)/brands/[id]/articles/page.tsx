'use client'

import type { MouseEvent, ReactElement } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { X as PhosphorX } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/cn'
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { Button, Chip, IconButton, Radio, Toggle } from '@/components/ui'
import { SuggestedIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { categoryMeta } from '@/lib/categories'

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

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Artikel AI',
    subtitle:
      'Artikel siap publish yang membantu AI menyebut brand Anda lebih sering, dibuat dari prompt Anda',
    loadFailed: 'Gagal memuat artikel',
    generateFailed: 'Gagal membuat artikel',
    exportFailed: 'Gagal export artikel',
    generateFromPrompt: 'Generate dari prompt',
    promptCount: (n: number): string => `${n} prompt`,
    gapToggleAria: 'Tampilkan prompt gap saja',
    gapsOnly: (n: number): string => `Gap saja (${n})`,
    showGapsOnly: 'Tampilkan gap saja (prompt yang jawabannya belum menyebut brand Anda)',
    noPromptsTitle: 'Belum ada prompt',
    noPromptsDesc: 'Buka halaman Prompts terlebih dahulu untuk membuat atau mengimpor prompt',
    noGapPromptsTitle: 'Tidak ada prompt gap',
    noGapPromptsDesc:
      'Gap adalah prompt yang jawaban AI-nya belum menyebut brand Anda. Jalankan scan terlebih dahulu atau tampilkan semua prompt.',
    gapChip: 'gap',
    generating: 'Sedang dibuat...',
    generateArticle: 'Generate Artikel',
    generatedArticles: 'Artikel yang Sudah Dibuat',
    articleCount: (n: number): string => `${n} artikel`,
    noArticlesTitle: 'Belum ada artikel',
    noArticlesDesc: 'Pilih prompt di kiri lalu klik Generate.',
    preview: 'Preview',
    downloadMd: 'Download .md',
    downloadHtml: 'Download .html',
    closePreview: 'Tutup preview',
  },
  en: {
    title: 'AI Articles',
    subtitle:
      'Ready-to-publish articles that help AI mention your brand more, generated from your prompts',
    loadFailed: 'Failed to load articles',
    generateFailed: 'Failed to generate article',
    exportFailed: 'Export failed',
    generateFromPrompt: 'Generate from a prompt',
    promptCount: (n: number): string => `${n} prompts`,
    gapToggleAria: 'Show gap prompts only',
    gapsOnly: (n: number): string => `Gaps only (${n})`,
    showGapsOnly: 'Show gaps only (prompts where AI answers do not mention your brand yet)',
    noPromptsTitle: 'No prompts yet',
    noPromptsDesc: 'Go to Prompts to generate or import prompts first',
    noGapPromptsTitle: 'No gap prompts found',
    noGapPromptsDesc:
      'A gap is a prompt where AI answers do not mention your brand yet. Run a scan first or show all prompts.',
    gapChip: 'gap',
    generating: 'Generating...',
    generateArticle: 'Generate Article',
    generatedArticles: 'Generated Articles',
    articleCount: (n: number): string => `${n} articles`,
    noArticlesTitle: 'No articles yet',
    noArticlesDesc: 'Pick a prompt on the left and click Generate.',
    preview: 'Preview',
    downloadMd: 'Download .md',
    downloadHtml: 'Download .html',
    closePreview: 'Close preview',
  },
} as const

/** 20px close glyph, same stroke language as dashboard nav-icons. */
function CloseIcon(): ReactElement {
  return <PhosphorX aria-hidden="true" />
}

function SuggestedArticlesInner(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [articles, setArticles] = useState<Article[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [gapIds, setGapIds] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Article | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [showGapsOnly, setShowGapsOnly] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  // alert() calls from the legacy page are replaced with these inline ErrorBanners.
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  // Deep-link from the Analytics "Create content" CTA: /articles?promptId=...
  const searchParams = useSearchParams()
  const deepLinkPromptId = searchParams.get('promptId')

  useEffect(() => {
    Promise.all([
      apiFetch<{ articles: Article[] }>(`/brands/${id}/articles`),
      apiFetch<{ prompts: Prompt[] }>(`/brands/${id}/prompts`),
      // gaps failure stays swallowed, exactly like the legacy page
      apiFetch<{ gaps: Prompt[] }>(`/brands/${id}/analytics/gaps`).catch(() => ({ gaps: [] as Prompt[] })),
    ])
      .then(([a, p, g]) => {
        setArticles(a.articles)
        setPrompts(p.prompts)
        setGapIds(new Set(g.gaps.map((gap) => gap._id)))
        // Pre-select the deep-linked prompt (and reveal it if it is a gap).
        if (deepLinkPromptId != null && p.prompts.some((pr) => pr._id === deepLinkPromptId)) {
          setSelectedPromptId(deepLinkPromptId)
          if (g.gaps.some((gap) => gap._id === deepLinkPromptId)) setShowGapsOnly(true)
        }
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : t.loadFailed)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleGenerate(promptId: string): Promise<void> {
    setGenerating(promptId)
    setGenerateError(null)
    try {
      const article = await apiFetch<Article>(`/brands/${id}/articles/generate`, {
        method: 'POST',
        body: JSON.stringify({ promptId }),
      })
      setArticles((prev) => [article, ...prev])
      setPreview(article)
    } catch (e: unknown) {
      // legacy used alert(e.message), now an inline ErrorBanner in the left card
      setGenerateError(e instanceof Error ? e.message : t.generateFailed)
    } finally {
      setGenerating(null)
    }
  }

  async function handleExport(articleId: string, format: 'md' | 'html'): Promise<void> {
    setExportError(null)
    try {
      // Blob download stays a raw fetch (NOT useApiFetch), same endpoint, credentials included.
      const res = await fetch(`/api/brands/${id}/articles/${articleId}/export?format=${format}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        // legacy used alert('Export failed'), now an inline ErrorBanner
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

  const displayPrompts: Prompt[] = showGapsOnly ? prompts.filter((p) => gapIds.has(p._id)) : prompts
  const selectionVisible: boolean =
    selectedPromptId != null && displayPrompts.some((p) => p._id === selectedPromptId)

  return (
    <PageContainer wide>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        icon={<SuggestedIcon className="text-icon-brand" />}
      />

      {loadError != null && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={loadError} />
        </motion.div>
      )}

      {loading ? (
        <motion.div variants={fadeUp} className="grid w-full items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="grid w-full items-start gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* LEFT: generate from a prompt */}
          <Card className="flex min-w-0 flex-col gap-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="min-w-0 flex-1 text-h6 font-normal text-primary">{t.generateFromPrompt}</h2>
              <span className="shrink-0 text-label-medium font-medium text-tertiary">
                {t.promptCount(displayPrompts.length)}
              </span>
            </div>

            {gapIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Toggle
                  checked={showGapsOnly}
                  onChange={setShowGapsOnly}
                  aria-label={t.gapToggleAria}
                />
                <span className="text-label-medium font-medium text-secondary">
                  {showGapsOnly ? t.gapsOnly(gapIds.size) : t.showGapsOnly}
                </span>
              </div>
            )}

            {prompts.length === 0 ? (
              <EmptyState
                title={t.noPromptsTitle}
                description={t.noPromptsDesc}
              />
            ) : displayPrompts.length === 0 ? (
              <EmptyState
                title={t.noGapPromptsTitle}
                description={t.noGapPromptsDesc}
              />
            ) : (
              <div className="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
                {displayPrompts.map((prompt) => {
                  const isGap = gapIds.has(prompt._id)
                  const isSelected = selectedPromptId === prompt._id
                  return (
                    // <label> so the whole row is mouse- and keyboard-operable
                    // via the nested Radio (no clickable-div a11y gap).
                    <label
                      key={prompt._id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-token-12 border bg-card p-3',
                        'transition-colors duration-200 ease-standard',
                        isSelected
                          ? 'border-brand-token'
                          : 'border-neutral-primary hover:border-neutral-secondary',
                      )}
                    >
                      <Radio
                        checked={isSelected}
                        onChange={() => setSelectedPromptId(prompt._id)}
                        name="suggested-prompt"
                        value={prompt._id}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <p className="line-clamp-2 text-paragraph-medium text-primary">{prompt.text}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip size="sm" shape="rounded" type={categoryMeta(prompt.category).tone}>
                            {categoryMeta(prompt.category).label[lang]}
                          </Chip>
                          {isGap && (
                            <Chip size="sm" shape="rounded" type="error">
                              {t.gapChip}
                            </Chip>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            {generateError != null && <ErrorBanner message={generateError} />}

            <Button
              type="primary"
              size="md"
              className="w-full"
              disabled={generating !== null || !selectionVisible}
              onClick={() => {
                if (selectedPromptId != null) void handleGenerate(selectedPromptId)
              }}
            >
              {generating !== null ? t.generating : t.generateArticle}
            </Button>
          </Card>

          {/* RIGHT: generated articles + preview */}
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="min-w-0 flex-1 text-h6 font-normal text-primary">{t.generatedArticles}</h2>
              <span className="shrink-0 text-label-medium font-medium text-tertiary">
                {t.articleCount(articles.length)}
              </span>
            </div>

            {exportError != null && <ErrorBanner message={exportError} />}

            {articles.length === 0 ? (
              <EmptyState
                icon={<SuggestedIcon />}
                title={t.noArticlesTitle}
                description={t.noArticlesDesc}
              />
            ) : (
              <div className="flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1">
                {articles.map((article) => (
                  <div
                    key={article._id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={preview?._id === article._id}
                    onClick={() => setPreview(article)}
                    onKeyDown={(event) => {
                      // Only the row itself reacts; nested export buttons keep their own keys.
                      if (event.target !== event.currentTarget) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setPreview(article)
                      }
                    }}
                    className={cn(
                      'flex cursor-pointer flex-col gap-2 rounded-token-12 border bg-card p-4',
                      'transition-colors duration-200 ease-standard',
                      preview?._id === article._id
                        ? 'border-brand-token'
                        : 'border-neutral-primary hover:border-neutral-secondary',
                    )}
                  >
                    <p className="line-clamp-2 text-paragraph-medium font-medium text-primary">
                      {article.title}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          shape="rounded"
                          type={article.status === 'ready' ? 'success' : 'neutral'}
                        >
                          {article.status}
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
                  </div>
                ))}
              </div>
            )}

            {preview != null && (
              <Card className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-h6 font-normal text-primary">{t.preview}</h3>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button type="ghost" size="sm" onClick={() => void handleExport(preview._id, 'md')}>
                      {t.downloadMd}
                    </Button>
                    <Button type="ghost" size="sm" onClick={() => void handleExport(preview._id, 'html')}>
                      {t.downloadHtml}
                    </Button>
                    <IconButton
                      type="ghost"
                      size="sm"
                      aria-label={t.closePreview}
                      onClick={() => setPreview(null)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                </div>
                <div className="max-h-96 overflow-auto rounded-token-8 bg-field p-4">
                  <div className="whitespace-pre-wrap text-paragraph-medium text-primary">
                    {preview.content}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      )}
    </PageContainer>
  )
}

/** useSearchParams (deep-link promptId) requires a Suspense boundary. */
export default function SuggestedArticlesPage(): ReactElement {
  return (
    <Suspense fallback={null}>
      <SuggestedArticlesInner />
    </Suspense>
  )
}
