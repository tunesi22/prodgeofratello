'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { Button, LoadingCircle } from '@/components/ui'
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { PromptsIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useTopLoading } from '@/components/providers/TopLoadingBar'
import { categoryMeta, sortCategoryKeys, CATEGORY_ORDER } from '@/lib/categories'
import { cn } from '@/lib/cn'

/**
 * Prompts page: manage/generate side only.
 * The "Discover Real Queries" flow moved to the AI Prompt Research page
 * (`/brands/[id]/research`); this page links there from the header.
 */

interface Prompt {
  _id: string
  text: string
  category: string
  isActive: boolean
}

interface PromptsResponse {
  count: number
  prompts: Prompt[]
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Prompts',
    subtitleCount: (n: number, c: number): string => `${n} prompt dalam ${c} kategori`,
    subtitleEmpty:
      'Buat prompt dengan AI atau ambil pertanyaan asli dari internet. Prompt adalah pertanyaan yang kami ajukan ke AI untuk memeriksa apakah brand Anda disebut.',
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
    promptCount: (n: number): string => `${n} prompt`,
    coverageLabel: 'Cakupan kategori',
    requestFailed: 'Permintaan gagal',
  },
  en: {
    title: 'Prompts',
    subtitleCount: (n: number, c: number): string =>
      `${n} ${n === 1 ? 'prompt' : 'prompts'} across ${c} ${c === 1 ? 'category' : 'categories'}`,
    subtitleEmpty:
      'Generate prompts with AI or import real questions from the internet. A prompt is a question we ask the AI to check whether your brand gets mentioned.',
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
    promptCount: (n: number): string => `${n} ${n === 1 ? 'prompt' : 'prompts'}`,
    coverageLabel: 'Category coverage',
    requestFailed: 'Request failed',
  },
} as const

export default function PromptsPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const { start, done } = useTopLoading()
  const t = COPY[lang]

  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [generating, setGenerating] = useState<boolean>(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    async function fetchPrompts(): Promise<void> {
      try {
        const data = await apiFetch<PromptsResponse>(`/brands/${id}/prompts`)
        if (!cancelled) setPrompts(data.prompts)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : t.requestFailed)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPrompts()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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

  const grouped = prompts.reduce<Record<string, Prompt[]>>((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  const subtitle: string =
    prompts.length > 0
      ? t.subtitleCount(prompts.length, Object.keys(grouped).length)
      : t.subtitleEmpty

  const showList = !loading && !generating && prompts.length > 0
  const showEmpty = !loading && !generating && prompts.length === 0

  return (
    <PageContainer>
      <PageHeader
        title={t.title}
        subtitle={subtitle}
        actions={
          <>
            {/* Discovery moved to the AI Prompt Research page */}
            <Button type="ghost" onClick={() => router.push(`/brands/${id}/research`)}>
              {t.researchLink}
            </Button>
            {!loading && prompts.length === 0 && (
              <Button onClick={() => handleGenerate(false)} disabled={generating}>
                {generating ? t.generating : t.generate}
              </Button>
            )}
            {!loading && prompts.length > 0 && (
              <Button
                type="primary-outlined"
                onClick={() => setConfirmRegenerate(true)}
                disabled={generating || confirmRegenerate}
              >
                {generating ? t.regenerating : t.regenerate}
              </Button>
            )}
          </>
        }
      />

      {error !== '' && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={error} />
        </motion.div>
      )}

      {/* Inline confirm row (DS warning tint); replaces a blocking
          window.confirm dialog per the redesign rules. */}
      {confirmRegenerate && !generating && (
        <motion.div variants={fadeUp} className="w-full">
          <div
            role="alertdialog"
            aria-label={t.confirmAria}
            className="flex w-full flex-wrap items-center gap-3 rounded-token-12 border border-warning-token bg-display-warning px-4 py-3 transition-colors duration-200 ease-standard"
          >
            <p className="min-w-0 flex-1 text-paragraph-medium text-warning-token">
              {t.confirmText}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={() => handleGenerate(true)}>{t.confirmYes}</Button>
              <Button type="ghost" onClick={() => setConfirmRegenerate(false)}>
                {t.cancel}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generating: brand info banner + skeleton rows */}
      {generating && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center gap-3 rounded-token-12 border border-brand-token bg-display-brand px-4 py-3 transition-colors duration-200 ease-standard">
            <LoadingCircle size="sm" />
            <p className="text-paragraph-medium text-brand-token">{t.generatingBanner}</p>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </motion.div>
      )}

      {/* Initial loading */}
      {loading && !generating && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </motion.div>
      )}

      {/* Empty state */}
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

      {/* Category coverage: all 6 intents with their prompt counts; categories
          with zero prompts show dashed/muted so pool gaps are obvious. */}
      {showList && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-2">
          <span className="text-label-medium font-medium text-tertiary">{t.coverageLabel}</span>
          <div className="flex w-full flex-wrap items-center gap-2">
            {CATEGORY_ORDER.map((cat) => {
              const meta = categoryMeta(cat)
              const CovIcon = meta.icon
              const count = grouped[cat]?.length ?? 0
              return (
                <span
                  key={cat}
                  title={meta.description[lang]}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-circle border px-3 py-1 text-label-medium font-medium',
                    'transition-colors duration-200 ease-standard',
                    count > 0
                      ? 'border-neutral-primary bg-card text-primary'
                      : 'border-dashed border-neutral-secondary bg-transparent text-tertiary',
                  )}
                >
                  <CovIcon className="size-4" />
                  {meta.label[lang]}
                  <span className="tabular-nums text-tertiary">{count}</span>
                </span>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Prompt list grouped by category. Each group leads with a distinct
          Phosphor icon + translated name + plain description so the categories
          are told apart by meaning, not chip colour. */}
      {showList && (
        <motion.div variants={staggerContainer} className="flex w-full flex-col gap-8">
          {sortCategoryKeys(Object.keys(grouped)).map((category) => {
            const items = grouped[category]
            const meta = categoryMeta(category)
            const Icon = meta.icon
            return (
              <motion.div key={category} variants={fadeUp} className="flex w-full flex-col gap-3">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-icon-brand transition-colors duration-300 ease-standard"
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-label-big font-medium text-primary">{meta.label[lang]}</span>
                    <span className="text-label-medium font-medium text-tertiary">
                      · {t.promptCount(items.length)}
                    </span>
                  </div>
                  <span className="text-paragraph-medium text-tertiary">{meta.description[lang]}</span>
                </div>
              </div>
              <Card className="divide-y divide-neutral-primary overflow-hidden">
                {items.map((prompt) => (
                  <div key={prompt._id} className="flex items-center gap-3 px-4 py-3">
                    <p className="min-w-0 flex-1 text-paragraph-medium text-primary transition-colors duration-200 ease-standard">
                      {prompt.text}
                    </p>
                  </div>
                ))}
              </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </PageContainer>
  )
}
