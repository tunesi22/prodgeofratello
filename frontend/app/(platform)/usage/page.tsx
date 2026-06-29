'use client'

import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button, Popover } from '@/components/ui'
import { cn } from '@/lib/cn'
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
import { ProjectsIcon } from '@/components/dashboard/nav-icons'
import { QuestionIcon } from '@/components/onboarding/icons'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * Monitor Usage (Admin > Monitor Usage): plan quota dashboard built ONLY from
 * existing endpoints: GET /user/me (plan), GET /brands, then per brand
 * GET /brands/{id}/prompts (count) and GET /brands/{id}/articles
 * (articles.length). Plan limits come from the CLAUDE.md pricing table.
 */

type PlanKey = 'starter' | 'pro' | 'agency'

interface UserMe {
  email: string
  plan?: string
}

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
  createdAt: string
}

interface PromptsResponse {
  count: number
  prompts: unknown[]
}

interface ArticlesResponse {
  articles: unknown[]
}

/** Per-project usage; null = that fetch failed (tolerated, shown as "-"). */
interface ProjectUsage {
  brandId: string
  name: string
  prompts: number | null
  articles: number | null
}

interface PlanLimits {
  /** null = unlimited */
  prompts: number | null
  models: number | null
  articles: number | null
}

/** Total LLM providers supported by the platform (openai/gemini/perplexity/anthropic). */
const TOTAL_MODELS = 4

/** Pricing tiers from CLAUDE.md: Basic(starter) 40/1/5, pro 100/all/30, agency 300/all/100. */
const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  starter: { prompts: 40, models: 1, articles: 5 },
  pro: { prompts: 100, models: TOTAL_MODELS, articles: 30 },
  agency: { prompts: 300, models: TOTAL_MODELS, articles: 100 },
}

const PLAN_LABELS: Record<PlanKey, string> = {
  starter: 'Basic',
  pro: 'Pro',
  agency: 'Agency',
}

function normalizePlan(plan: string | undefined): PlanKey {
  return plan === 'pro' || plan === 'agency' ? plan : 'starter'
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Pemakaian',
    subtitle: 'Lihat berapa banyak dari paket Anda yang sudah terpakai di semua project.',
    planChip: (plan: string): string => `Paket ${plan}`,
    retry: 'Coba lagi',
    loadFailed: 'Gagal memuat data pemakaian',
    emptyTitle: 'Belum ada project',
    emptyDescription:
      'Buat project pertama Anda terlebih dahulu. Setelah itu pemakaian paket Anda akan terlihat di sini.',
    createProject: 'Buat project',
    statProjects: 'Project',
    statProjectsCaption: 'Project aktif',
    statPrompts: 'Total prompt',
    statArticles: 'Total artikel',
    acrossProjects: 'Dari semua project',
    quotasTitle: 'Jatah paket',
    unlimited: 'Tanpa batas',
    quotaPrompts: 'Prompts',
    quotaPromptsCaption: 'Prompt yang Anda pantau di semua project',
    quotaArticles: 'Artikel',
    quotaArticlesCaption: 'Artikel yang sudah dibuat di semua project',
    quotaModels: 'Model AI',
    quotaModelsCaption: 'Model AI yang termasuk dalam paket Anda',
    nearLimitTitle: 'Jatah paket Anda hampir habis',
    nearLimitBody: (plan: string): string =>
      `Anda sudah memakai 80% atau lebih dari salah satu jatah di paket ${plan}. Upgrade agar tracking dan pembuatan artikel tetap berjalan tanpa gangguan.`,
    upgrade: 'Upgrade paket',
    byProjectTitle: 'Pemakaian per project',
    tableProject: 'Project',
    tablePrompts: 'Prompts',
    tableArticles: 'Artikel',
    partialWarning: 'Sebagian data project gagal dimuat, jadi totalnya mungkin belum lengkap.',
  },
  en: {
    title: 'Monitor Usage',
    subtitle: 'See how much of your plan you have used across all your projects.',
    planChip: (plan: string): string => `${plan} plan`,
    retry: 'Try again',
    loadFailed: 'Failed to load usage data',
    emptyTitle: 'No projects yet',
    emptyDescription:
      'Create your first project. After that, your plan usage will show up here.',
    createProject: 'Create project',
    statProjects: 'Projects',
    statProjectsCaption: 'Active projects',
    statPrompts: 'Total prompts',
    statArticles: 'Total articles',
    acrossProjects: 'Across all projects',
    quotasTitle: 'Plan quotas',
    unlimited: 'Unlimited',
    quotaPrompts: 'Prompts',
    quotaPromptsCaption: 'Prompts you track across all projects',
    quotaArticles: 'Articles',
    quotaArticlesCaption: 'Articles generated across all projects',
    quotaModels: 'AI models',
    quotaModelsCaption: 'AI models included in your plan',
    nearLimitTitle: 'You are getting close to your plan limits',
    nearLimitBody: (plan: string): string =>
      `You have used 80% or more of a quota on the ${plan} plan. Upgrade to keep tracking and generating without interruption.`,
    upgrade: 'Upgrade plan',
    byProjectTitle: 'Usage by project',
    tableProject: 'Project',
    tablePrompts: 'Prompts',
    tableArticles: 'Articles',
    partialWarning: 'Some project data could not be loaded, so totals may be incomplete.',
  },
} as const

/** One quota surface: name, "used / limit" label (or Unlimited chip), progress bar. */
function QuotaCard({
  label,
  caption,
  used,
  limit,
}: {
  label: string
  caption: string
  used: number
  limit: number | null
}): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  // Solid bar, matching the project dashboard usage panel. Unlimited metrics
  // fill against a soft cap so a bar is still visible.
  const effLimit = limit ?? Math.max(used * 2, 10)
  const pct = effLimit > 0 ? Math.min(100, Math.round((used / effLimit) * 100)) : 0
  const atLimit = limit !== null && used >= limit
  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between gap-2 text-action-small font-medium">
        <span className="flex items-center gap-1.5 text-primary">
          {label}
          <Popover label={label} content={caption} side="bottom">
            <span className="inline-flex cursor-help text-tertiary transition-colors duration-200 ease-standard hover:text-primary">
              <QuestionIcon className="size-4" />
            </span>
          </Popover>
        </span>
        <span className={cn('whitespace-nowrap tabular-nums', atLimit ? 'text-error-token' : 'text-tertiary')}>
          {limit === null ? `${used} · ${t.unlimited}` : `${used}/${limit}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-circle bg-tertiary">
        <div
          className={cn('h-full rounded-circle transition-[width] duration-500 ease-standard', atLimit ? 'bg-btn-error' : 'bg-brand-600')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  )
}

export default function MonitorUsagePage(): ReactElement {
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [plan, setPlan] = useState<PlanKey | null>(null)
  const [rows, setRows] = useState<ProjectUsage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState<number>(0)

  useEffect(() => {
    let cancelled = false

    async function load(): Promise<void> {
      try {
        const [me, brands] = await Promise.all([
          apiFetch<UserMe>('/user/me'),
          apiFetch<Brand[]>('/brands'),
        ])

        // Per-brand fetches are tolerated individually: a failure leaves that
        // cell as null ("-") instead of failing the whole page.
        const usage = await Promise.all(
          brands.map(async (brand): Promise<ProjectUsage> => {
            let prompts: number | null = null
            let articles: number | null = null
            try {
              const res = await apiFetch<PromptsResponse>(`/brands/${brand._id}/prompts`)
              prompts = typeof res.count === 'number' ? res.count : (res.prompts?.length ?? 0)
            } catch {
              // tolerated, shown as "-" in the breakdown table
            }
            try {
              const res = await apiFetch<ArticlesResponse>(`/brands/${brand._id}/articles`)
              articles = res.articles?.length ?? 0
            } catch {
              // tolerated, shown as "-" in the breakdown table
            }
            return { brandId: brand._id, name: brand.name, prompts, articles }
          }),
        )

        if (cancelled) return
        setPlan(normalizePlan(me.plan))
        setRows(usage)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t.loadFailed)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // apiFetch is recreated per render; reloadKey drives refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])

  const totals = useMemo(() => {
    const list = rows ?? []
    return {
      projects: list.length,
      prompts: list.reduce((sum, row) => sum + (row.prompts ?? 0), 0),
      articles: list.reduce((sum, row) => sum + (row.articles ?? 0), 0),
      partial: list.some((row) => row.prompts === null || row.articles === null),
      // Per-project bars are scaled relative to the busiest project (min 1 so a
      // lone project still fills its bar); plan limits are account-wide, not per-project.
      maxPrompts: Math.max(1, ...list.map((row) => row.prompts ?? 0)),
      maxArticles: Math.max(1, ...list.map((row) => row.articles ?? 0)),
    }
  }, [rows])

  const limits: PlanLimits | null = plan !== null ? PLAN_LIMITS[plan] : null

  const nearLimit = useMemo((): boolean => {
    if (plan === null || plan === 'agency' || rows === null) return false
    const planLimits = PLAN_LIMITS[plan]
    const pct = (used: number, limit: number | null): number =>
      limit === null || limit === 0 ? 0 : (used / limit) * 100
    return pct(totals.prompts, planLimits.prompts) >= 80 || pct(totals.articles, planLimits.articles) >= 80
  }, [plan, rows, totals])

  const loading = error === null && (plan === null || rows === null)
  const loaded = error === null && plan !== null && rows !== null

  function retry(): void {
    setError(null)
    setPlan(null)
    setRows(null)
    setReloadKey((key) => key + 1)
  }

  return (
    <PageContainer wide>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          plan !== null ? (
            <span className="inline-flex items-center rounded-token-8 border border-brand-token bg-display-brand px-2.5 py-0.5 text-label-medium font-medium text-brand-token">
              {PLAN_LABELS[plan]}
            </span>
          ) : undefined
        }
      />

      {error !== null && (
        <motion.div variants={fadeUp} className="flex w-full flex-col items-start gap-4">
          <ErrorBanner message={error} />
          <Button type="ghost" size="sm" onClick={retry}>
            {t.retry}
          </Button>
        </motion.div>
      )}

      {loading && (
        <div className="flex w-full flex-col gap-10" aria-busy="true">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        </div>
      )}

      {loaded && rows.length === 0 && (
        <motion.div variants={fadeUp}>
          <EmptyState
            icon={<ProjectsIcon />}
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={
              <Button type="primary" size="sm" onClick={() => router.push('/brands/new')}>
                {t.createProject}
              </Button>
            }
          />
        </motion.div>
      )}

      {loaded && rows.length > 0 && limits !== null && (
        <>
          <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t.statProjects} value={totals.projects} caption={t.statProjectsCaption} />
            <StatCard label={t.statPrompts} value={totals.prompts} caption={t.acrossProjects} />
            <StatCard label={t.statArticles} value={totals.articles} caption={t.acrossProjects} />
          </motion.div>

          <Section title={t.quotasTitle}>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              <QuotaCard
                label={t.quotaPrompts}
                caption={t.quotaPromptsCaption}
                used={totals.prompts}
                limit={limits.prompts}
              />
              <QuotaCard
                label={t.quotaArticles}
                caption={t.quotaArticlesCaption}
                used={totals.articles}
                limit={limits.articles}
              />
              <QuotaCard
                label={t.quotaModels}
                caption={t.quotaModelsCaption}
                used={limits.models ?? TOTAL_MODELS}
                limit={limits.models === null ? null : TOTAL_MODELS}
              />
            </div>
          </Section>

          {nearLimit && plan !== null && (
            <motion.div variants={fadeUp}>
              <Card variant="brand" className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-label-big font-medium text-primary">
                    {t.nearLimitTitle}
                  </span>
                  <span className="text-paragraph-medium text-secondary">
                    {t.nearLimitBody(PLAN_LABELS[plan])}
                  </span>
                </div>
                <Button
                  type="primary"
                  size="md"
                  className="shrink-0"
                  onClick={() => router.push('/settings/billing')}
                >
                  {t.upgrade}
                </Button>
              </Card>
            </motion.div>
          )}

          <Section title={t.byProjectTitle}>
            <Card className="flex w-full flex-col">
              {rows.map((row) => (
                <div key={row.brandId} className="flex flex-col gap-2.5 border-b border-neutral-primary px-5 py-4 last:border-b-0">
                  <span className="text-paragraph-medium font-medium text-primary">{row.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-label-medium text-tertiary">{t.tablePrompts}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-circle bg-tertiary">
                      <div
                        className="h-full rounded-circle bg-brand-600 transition-[width] duration-500 ease-standard"
                        style={{ width: `${row.prompts !== null ? Math.round((row.prompts / totals.maxPrompts) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-label-medium font-medium tabular-nums text-primary">
                      {row.prompts !== null ? row.prompts : <span className="text-tertiary">-</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-label-medium text-tertiary">{t.tableArticles}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-circle bg-tertiary">
                      <div
                        className="h-full rounded-circle bg-brand-600 transition-[width] duration-500 ease-standard"
                        style={{ width: `${row.articles !== null ? Math.round((row.articles / totals.maxArticles) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-label-medium font-medium tabular-nums text-primary">
                      {row.articles !== null ? row.articles : <span className="text-tertiary">-</span>}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
            {totals.partial && (
              <p className="text-paragraph-medium text-warning-token">
                {t.partialWarning}
              </p>
            )}
          </Section>
        </>
      )}
    </PageContainer>
  )
}
