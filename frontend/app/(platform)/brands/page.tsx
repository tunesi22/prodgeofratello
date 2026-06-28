'use client'

import { useEffect, useState, type MouseEvent, type ReactElement } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash, CaretDown } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { Button } from '@/components/ui'
import { Card, EmptyState, ErrorBanner, Skeleton } from '@/components/dashboard/primitives'
import { PlusSmallIcon, ProjectsIcon, GearIcon, LogoutIcon } from '@/components/dashboard/nav-icons'
import { AccountSettingsModal } from '@/components/dashboard/AccountSettingsModal'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/cn'

/**
 * Project Dashboard (/brands), Figma 163:893. Centered column of two cards.
 * Welcome card: greeting + Settings (opens a modal, no navigation) + Keluar,
 * then a collapsible plan/usage panel (prompts, articles, models, projects vs
 * plan limits, renewal, upgrade CTA). Project Anda card: projects as green
 * folders with hover delete → DELETE /api/brands/:id.
 */
interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
  createdAt: string
}

type PlanKey = 'starter' | 'pro' | 'agency'
const TOTAL_MODELS = 4
interface PlanLimits {
  prompts: number | null
  models: number | null
  articles: number | null
}
/** CLAUDE.md pricing. `starter` is shown as "Basic"; Agency is now capped (not unlimited). */
const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  starter: { prompts: 40, models: 1, articles: 5 },
  pro: { prompts: 100, models: TOTAL_MODELS, articles: 30 },
  agency: { prompts: 300, models: TOTAL_MODELS, articles: 100 },
}
const PLAN_LABELS: Record<PlanKey, string> = { starter: 'Basic', pro: 'Pro', agency: 'Agency' }
function normalizePlan(plan: string | undefined): PlanKey {
  return plan === 'pro' || plan === 'agency' ? plan : 'starter'
}

const COPY = {
  id: {
    welcomeBack: (n: string): string => `Selamat datang kembali, ${n}!`,
    welcomeGeneric: 'Selamat datang kembali!',
    settings: 'Pengaturan',
    logout: 'Keluar',
    planUsage: 'Pemakaian paket',
    renews: (d: string): string => `Diperpanjang ${d}`,
    unlimited: 'Tanpa batas',
    limitReached: 'Limit tercapai',
    mPrompts: 'Prompt Aktif',
    mArticles: 'Artikel AI',
    mModels: 'Model AI',
    mProjects: 'Project',
    upgrade: 'Upgrade paket',
    topPlan: 'Anda sudah di paket tertinggi.',
    title: 'Project Anda',
    newProject: 'Project Baru',
    emptyTitle: 'Belum ada project',
    emptyDescription: 'Tambahkan brand pertama Anda untuk mulai memantau seberapa sering AI menyebutnya.',
    competitorCount: (n: number): string => `${n} kompetitor`,
    created: (d: string): string => `Dibuat ${d}`,
    deleteAria: 'Hapus project',
    deleteTitle: (name: string): string => `Hapus project ${name}?`,
    deleteWarning:
      'Project ini beserta seluruh prompt, hasil, dan datanya akan dihapus permanen dan tidak bisa dikembalikan.',
    deleteConfirm: 'Hapus permanen',
    deleting: 'Menghapus...',
    cancel: 'Batal',
    deleteFailed: 'Gagal menghapus project. Coba lagi.',
  },
  en: {
    welcomeBack: (n: string): string => `Welcome back, ${n}!`,
    welcomeGeneric: 'Welcome back!',
    settings: 'Settings',
    logout: 'Log out',
    planUsage: 'Plan usage',
    renews: (d: string): string => `Renews ${d}`,
    unlimited: 'Unlimited',
    limitReached: 'Limit reached',
    mPrompts: 'Active Prompts',
    mArticles: 'AI Articles',
    mModels: 'AI Models',
    mProjects: 'Projects',
    upgrade: 'Upgrade plan',
    topPlan: 'You are on the highest plan.',
    title: 'Your Projects',
    newProject: 'New project',
    emptyTitle: 'No projects yet',
    emptyDescription: 'Add your first brand to start tracking how often AI mentions it.',
    competitorCount: (n: number): string => `${n} competitor${n === 1 ? '' : 's'}`,
    created: (d: string): string => `Created ${d}`,
    deleteAria: 'Delete project',
    deleteTitle: (name: string): string => `Delete ${name}?`,
    deleteWarning:
      'This project and all of its prompts, results, and data will be permanently deleted and cannot be recovered.',
    deleteConfirm: 'Delete permanently',
    deleting: 'Deleting...',
    cancel: 'Cancel',
    deleteFailed: 'Could not delete the project. Please try again.',
  },
} as const

function websiteDomain(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, '')
  } catch {
    return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? website
  }
}
function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

/** Two-tone green folder SVG, flush to the viewBox edges so it aligns left with the text. */
function FolderGraphic({ className }: { className?: string }): ReactElement {
  return (
    <svg viewBox="0 0 100 84" className={className} aria-hidden="true">
      <path d="M0 14a8 8 0 0 1 8-8h22a8 8 0 0 1 6 2.7l4 4.6a8 8 0 0 0 6 2.7h38a8 8 0 0 1 8 8v45a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V14z" fill="var(--color-brand-800)" />
      <path d="M0 30a8 8 0 0 1 8-8h84a8 8 0 0 1 8 8v38a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V30z" fill="var(--color-brand-600)" />
    </svg>
  )
}

/** Brand-green outlined plan badge (Figma 163:1472). */
function PlanBadge({ label }: { label: string }): ReactElement {
  return (
    <span className="inline-flex items-center rounded-token-8 border border-brand-token bg-display-brand px-2.5 py-0.5 text-label-medium font-medium text-brand-token">
      {label}
    </span>
  )
}

/**
 * One usage metric row: label + used/limit + bar. The bar always renders; for
 * unlimited metrics it fills against a soft display cap so there is still a
 * visible line. `constraint` marks metrics where hitting the limit is a real
 * cap (prompts/articles) and shows the "Limit reached" badge.
 */
function UsageRow({ label, used, limit, softCap, constraint, unlimitedText, limitText }: { label: string; used: number | null; limit: number | null; softCap: number; constraint: boolean; unlimitedText: string; limitText: string }): ReactElement {
  const effLimit = limit ?? softCap
  const pct = used != null && effLimit > 0 ? Math.min(100, Math.round((used / effLimit) * 100)) : 0
  const atLimit = constraint && limit != null && used != null && used >= limit
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-action-small font-medium">
        <span className="text-primary">{label}</span>
        <div className="flex items-center gap-2">
          {atLimit && (
            <span className="rounded-circle bg-display-error px-2 py-0.5 text-label-medium font-semibold text-error-token">{limitText}</span>
          )}
          <span className={cn('tabular-nums', atLimit ? 'text-error-token' : 'text-tertiary')}>
            {used == null ? '...' : limit == null ? `${used} · ${unlimitedText}` : `${used}/${limit}`}
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-circle bg-tertiary">
        <div
          className={cn('h-full rounded-circle transition-[width] duration-500 ease-standard', atLimit ? 'bg-btn-error' : 'bg-brand-600')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ProjectDashboardPage(): ReactElement {
  const apiFetch = useApiFetch()
  const router = useRouter()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [brands, setBrands] = useState<Brand[]>([])
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userPlan, setUserPlan] = useState<string>('')
  const [promptTotal, setPromptTotal] = useState<number | null>(null)
  const [articleTotal, setArticleTotal] = useState<number | null>(null)
  const [renewDate, setRenewDate] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [confirmDelete, setConfirmDelete] = useState<Brand | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [usageOpen, setUsageOpen] = useState<boolean>(true)

  useEffect(() => {
    apiFetch<Brand[]>('/brands')
      .then(setBrands)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    apiFetch<{ email: string; plan?: string }>('/auth/me')
      .then((u) => {
        setUserEmail(u.email)
        setUserName(u.email.split('@')[0])
        if (u.plan) setUserPlan(u.plan)
      })
      .catch(() => {})
    // Renewal date: end of the current month (client-only to avoid hydration mismatch).
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setRenewDate(end.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Prompt + article totals across all projects (for the usage panel).
  useEffect(() => {
    if (brands.length === 0) {
      setPromptTotal(0)
      setArticleTotal(0)
      return
    }
    let cancelled = false
    Promise.all(
      brands.map(async (b) => {
        const [p, a] = await Promise.all([
          apiFetch<{ count: number }>(`/brands/${b._id}/prompts`).then((r) => r.count).catch(() => 0),
          apiFetch<{ articles: unknown[] }>(`/brands/${b._id}/articles`).then((r) => r.articles.length).catch(() => 0),
        ])
        return { p, a }
      }),
    ).then((res) => {
      if (cancelled) return
      setPromptTotal(res.reduce((s, r) => s + r.p, 0))
      setArticleTotal(res.reduce((s, r) => s + r.a, 0))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands])

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/sign-in')
  }
  async function handleDelete(brand: Brand): Promise<void> {
    setDeleting(true)
    setDeleteError('')
    try {
      await apiFetch(`/brands/${brand._id}`, { method: 'DELETE' })
      setBrands((prev) => prev.filter((b) => b._id !== brand._id))
      setConfirmDelete(null)
    } catch {
      setDeleteError(t.deleteFailed)
    }
    setDeleting(false)
  }

  const planKey = normalizePlan(userPlan)
  const limits = PLAN_LIMITS[planKey]
  const planLabel = userPlan ? PLAN_LABELS[planKey] : ''
  const displayName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ''

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      {/* Welcome card */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-h4 font-semibold tracking-tight text-primary">
            {displayName ? t.welcomeBack(displayName) : t.welcomeGeneric}
          </h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-action-small font-medium text-primary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
            >
              <GearIcon className="size-5 shrink-0" />
              {t.settings}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-action-small font-medium text-primary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
            >
              <LogoutIcon className="size-5 shrink-0" />
              {t.logout}
            </button>
          </div>
        </div>

        {/* Collapsible plan / usage panel */}
        <div className="rounded-token-12 border border-neutral-primary">
          <button
            type="button"
            onClick={() => setUsageOpen((v) => !v)}
            aria-expanded={usageOpen}
            className="flex w-full items-start justify-between gap-3 p-4"
          >
            <div className="flex flex-col items-start gap-1.5">
              {planLabel !== '' && <PlanBadge label={planLabel} />}
              {renewDate !== '' && (
                <span className="text-label-medium text-tertiary">{t.renews(renewDate)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-action-small font-medium text-primary">{t.planUsage}</span>
              <CaretDown className={cn('size-5 shrink-0 text-icon-dark-gray transition-transform duration-300 ease-standard', usageOpen && 'rotate-180')} aria-hidden="true" />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {usageOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 border-t border-neutral-primary p-4">
                  <UsageRow label={t.mPrompts} used={promptTotal} limit={limits.prompts} softCap={100} constraint unlimitedText={t.unlimited} limitText={t.limitReached} />
                  <UsageRow label={t.mArticles} used={articleTotal} limit={limits.articles} softCap={30} constraint unlimitedText={t.unlimited} limitText={t.limitReached} />
                  <UsageRow label={t.mModels} used={limits.models ?? TOTAL_MODELS} limit={TOTAL_MODELS} softCap={TOTAL_MODELS} constraint={false} unlimitedText={t.unlimited} limitText={t.limitReached} />
                  <UsageRow label={t.mProjects} used={brands.length} limit={null} softCap={20} constraint={false} unlimitedText={t.unlimited} limitText={t.limitReached} />
                  <div className="flex items-center justify-between gap-3 pt-1">
                    {planKey === 'agency' ? (
                      <span className="text-label-medium text-tertiary">{t.topPlan}</span>
                    ) : (
                      <Button type="primary" size="sm" className="ml-auto" onClick={() => setSettingsOpen(true)}>{t.upgrade}</Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Project Anda card */}
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h4 font-semibold tracking-tight text-primary">
            {t.title}{!loading && error === '' ? ` (${brands.length})` : ''}
          </h2>
          <Button type="primary" size="sm" iconLeft={<PlusSmallIcon />} onClick={() => router.push('/brands/new')}>{t.newProject}</Button>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        )}

        {!loading && error !== '' && <ErrorBanner message={error} />}

        {!loading && error === '' && brands.length === 0 && (
          <EmptyState
            icon={<ProjectsIcon />}
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={<Button type="primary" size="md" iconLeft={<PlusSmallIcon />} onClick={() => router.push('/brands/new')}>{t.newProject}</Button>}
          />
        )}

        {!loading && error === '' && brands.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {brands.map((brand: Brand) => (
              <Link key={brand._id} href={`/brands/${brand._id}`} className="group relative flex flex-col items-start gap-3 rounded-token-12 outline-none">
                <button
                  type="button"
                  aria-label={t.deleteAria}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteError('')
                    setConfirmDelete(brand)
                  }}
                  className="absolute right-1 top-1 z-10 flex size-8 items-center justify-center rounded-token-8 border border-neutral-primary bg-card text-icon-dark-gray opacity-0 shadow-sm transition-all duration-200 ease-standard hover:border-error-token hover:text-error-token focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash className="size-4" aria-hidden="true" />
                </button>
                <FolderGraphic className="w-full transition-transform duration-200 ease-standard group-hover:-translate-y-0.5" />
                <div className="flex w-full flex-col gap-0.5">
                  <span className="truncate text-h4 font-semibold text-primary">{brand.name}</span>
                  <span className="truncate text-paragraph-big text-secondary">{websiteDomain(brand.website)}</span>
                  <span className="mt-1 truncate text-paragraph-big text-tertiary">
                    {brand.industry}
                    {brand.competitors.length > 0 && ` · ${t.competitorCount(brand.competitors.length)}`}
                  </span>
                  <span className="truncate text-paragraph-big text-tertiary">{t.created(formatDate(brand.createdAt, lang))}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {settingsOpen && (
        <AccountSettingsModal
          email={userEmail}
          plan={userPlan}
          onLogout={() => void logout()}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!deleting) setConfirmDelete(null)
          }}
        >
          <div className="w-full max-w-md rounded-token-16 border border-neutral-primary bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex size-11 items-center justify-center rounded-token-12 bg-display-error text-icon-error">
              <Trash className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-label-big font-semibold text-primary">{t.deleteTitle(confirmDelete.name)}</h2>
            <p className="mt-2 text-paragraph-medium leading-relaxed text-tertiary">{t.deleteWarning}</p>
            {deleteError !== '' && <p className="mt-3 text-paragraph-medium text-error-token">{deleteError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="ghost" onClick={() => setConfirmDelete(null)} disabled={deleting}>{t.cancel}</Button>
              <Button type="primary" className="!bg-btn-error hover:!bg-btn-error-pressed" onClick={() => void handleDelete(confirmDelete)} disabled={deleting}>
                {deleting ? t.deleting : t.deleteConfirm}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
