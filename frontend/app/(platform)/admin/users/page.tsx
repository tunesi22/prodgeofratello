'use client'

import type { FormEvent, ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X as PhosphorX } from '@phosphor-icons/react/dist/ssr'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, fadeUp, transitionEnter, transitionExit } from '@/lib/motion'
import { cn } from '@/lib/cn'
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageContainer,
  PageHeader,
  Section,
  Skeleton,
  StatCard,
} from '@/components/dashboard/primitives'
import { Button, Chip, IconButton, Input } from '@/components/ui'
import { PlusSmallIcon, UsersIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

type Plan = 'waitlist' | 'starter' | 'pro' | 'agency'

interface AdminUser {
  _id: string
  clerkUserId: string
  email: string
  plan: Plan
  isAdmin: boolean
  lastActiveAt?: string
  createdAt: string
  brandCount: number
  queryCount: number
}

interface Stats {
  totalUsers: number
  activeToday: number
  proPlus: number
  totalBrands: number
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Kelola User',
    subtitle: 'Panel Admin · Kelola akun dan pantau aktivitas user',
    createUser: 'Buat User',
    loadFailed: 'Gagal memuat data admin.',
    statTotalUsers: 'Total User',
    statActiveToday: 'Aktif Hari Ini',
    statProPlus: 'Paket Pro+',
    statTotalBrands: 'Total Brand',
    searchPlaceholder: 'Cari berdasarkan email…',
    filterAll: 'Semua Paket',
    filterAria: 'Filter berdasarkan paket',
    usersCount: (n: number): string => `${n} user`,
    emptyTitle: 'User tidak ditemukan.',
    emptyDescription: 'Coba kata kunci atau filter paket yang lain.',
    tableHeaders: ['User', 'Paket', 'Brand', 'Query', 'Terakhir Aktif', 'Bergabung', ''],
    planFor: (email: string): string => `Paket untuk ${email}`,
    never: 'Belum pernah',
    justNow: 'Baru saja',
    minsAgo: (m: number): string => `${m} menit lalu`,
    hoursAgo: (h: number): string => `${h} jam lalu`,
    daysAgo: (d: number): string => `${d} hari lalu`,
    revokeAdmin: 'Cabut Admin',
    makeAdmin: 'Jadikan Admin',
    modalSubtitle: 'Akun baru disimpan di MongoDB',
    close: 'Tutup',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Minimal 8 karakter',
    planLabel: 'Paket',
    requiredError: 'Email dan password wajib diisi.',
    createFailed: 'Gagal membuat user.',
    actionFailed: 'Perubahan gagal disimpan. Silakan coba lagi.',
    genericError: 'Terjadi kesalahan.',
    cancel: 'Batal',
    creating: 'Membuat…',
  },
  en: {
    title: 'Manage Users',
    subtitle: 'Admin Panel · Manage accounts and track activity',
    createUser: 'Create User',
    loadFailed: 'Failed to load admin data.',
    statTotalUsers: 'Total Users',
    statActiveToday: 'Active Today',
    statProPlus: 'Pro+ Plans',
    statTotalBrands: 'Total Brands',
    searchPlaceholder: 'Search by email…',
    filterAll: 'All Plans',
    filterAria: 'Filter by plan',
    usersCount: (n: number): string => `${n} users`,
    emptyTitle: 'No users found.',
    emptyDescription: 'Try a different search or plan filter.',
    tableHeaders: ['User', 'Plan', 'Brands', 'Queries', 'Last Active', 'Joined', ''],
    planFor: (email: string): string => `Plan for ${email}`,
    never: 'Never',
    justNow: 'Just now',
    minsAgo: (m: number): string => `${m}m ago`,
    hoursAgo: (h: number): string => `${h}h ago`,
    daysAgo: (d: number): string => `${d}d ago`,
    revokeAdmin: 'Revoke Admin',
    makeAdmin: 'Make Admin',
    modalSubtitle: 'New account stored in MongoDB',
    close: 'Close',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Min. 8 characters',
    planLabel: 'Plan',
    requiredError: 'Email and password are required.',
    createFailed: 'Could not create the user.',
    actionFailed: 'Change could not be saved. Please try again.',
    genericError: 'Something went wrong.',
    cancel: 'Cancel',
    creating: 'Creating…',
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

function relativeTime(t: Copy, date?: string): string {
  if (!date) return t.never
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t.justNow
  if (mins < 60) return t.minsAgo(mins)
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t.hoursAgo(hours)
  return t.daysAgo(Math.floor(hours / 24))
}

/**
 * Plan color semantics, normalized to DS display tokens (legacy used
 * gray / blue / purple, and no blue/purple exists in the token set):
 * starter → neutral, pro → brand, agency → warning.
 */
const PLAN_AVATAR: Record<Plan, string> = {
  waitlist: 'bg-display-info text-info-token',
  starter: 'bg-display-neutral text-primary',
  pro: 'bg-display-brand text-brand-token',
  agency: 'bg-display-warning text-warning-token',
}

const PLAN_SELECT: Record<Plan, string> = {
  waitlist: 'bg-display-info text-info-token border-info-token',
  starter: 'bg-display-neutral text-primary border-neutral-tertiary',
  pro: 'bg-display-brand text-brand-token border-brand-token',
  agency: 'bg-display-warning text-warning-token border-warning-token',
}

// Plan names stay untranslated; the "all" label comes from COPY (label: null).
const PLAN_FILTERS: Array<{ value: 'all' | Plan; label: string | null }> = [
  { value: 'all', label: null },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'agency', label: 'Agency' },
]

/** Close glyph, same 20px / 1.5px round-cap geometry family as nav-icons. */
function CloseIcon({ className }: { className?: string }): ReactElement {
  return <PhosphorX className={className} aria-hidden="true" />
}

function Avatar({ email, plan }: { email: string; plan: Plan }): ReactElement {
  const initial = email ? email[0].toUpperCase() : '?'
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-circle text-label-medium font-semibold',
        'transition-colors duration-200 ease-standard',
        PLAN_AVATAR[plan],
      )}
    >
      {initial}
    </div>
  )
}

export default function AdminUsersPage(): ReactElement {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeToday: 0, proPlus: 0, totalBrands: 0 })
  const [loading, setLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [planFilter, setPlanFilter] = useState<'all' | Plan>('all')

  const [showCreate, setShowCreate] = useState<boolean>(false)
  const [newEmail, setNewEmail] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [newPlan, setNewPlan] = useState<Plan>('waitlist')
  const [creating, setCreating] = useState<boolean>(false)
  const [createError, setCreateError] = useState<string>('')
  // Per-row in-flight ids (blocks double-submit + disables the row controls).
  const [rowBusy, setRowBusy] = useState<Set<string>>(new Set())
  const [actionError, setActionError] = useState<string>('')

  // NOTE: intentionally bypasses useApiFetch (which throws on !ok). The admin
  // endpoints need the raw Response so we can branch on 403 (non-admin bounce
  // to /brands) and read error bodies without an exception. Kept per the
  // feature-inventory parity contract for /admin/users.
  const authFetch = useCallback(
    (url: string, options?: RequestInit): Promise<Response> =>
      fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers ?? {}),
        },
      }),
    [],
  )

  const loadData = useCallback(async (): Promise<void> => {
    setLoadError('')
    try {
      const [usersRes, statsRes] = await Promise.all([
        authFetch('/api/admin/users'),
        authFetch('/api/admin/stats'),
      ])
      if (usersRes.status === 403) {
        router.replace('/brands')
        return
      }
      if (usersRes.ok) setUsers(await usersRes.json())
      // Legacy swallowed fetch errors silently; surfaced via ErrorBanner per
      // the redesign's mandatory error-state rule (same endpoints, same flow).
      else setLoadError(t.loadFailed)
      if (statsRes.ok) setStats(await statsRes.json())
    } catch {
      setLoadError(t.loadFailed)
    }
    setLoading(false)
    // t is intentionally omitted so a language toggle does not refetch data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!newEmail || !newPassword) {
      setCreateError(t.requiredError)
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, password: newPassword, plan: newPlan }),
      })
      if (!res.ok) {
        const data = await res.json()
        // API error messages pass through untranslated; only the fallback is ours.
        setCreateError(data.error ?? t.createFailed)
      } else {
        setShowCreate(false)
        setNewEmail('')
        setNewPassword('')
        setNewPlan('starter')
        loadData()
      }
    } catch {
      setCreateError(t.genericError)
    }
    setCreating(false)
  }

  const setBusy = (id: string, busy: boolean): void =>
    setRowBusy((prev) => {
      const next = new Set(prev)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })

  const handleChangePlan = async (id: string, plan: Plan): Promise<void> => {
    if (rowBusy.has(id)) return // guard double-submit
    const previous = users.find((u) => u._id === id)?.plan
    setActionError('')
    setBusy(id, true)
    // Optimistic update, reverted below if the request fails.
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, plan } : u)))
    try {
      const res = await authFetch(`/api/admin/users/${id}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) {
        if (previous) setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, plan: previous } : u)))
        const data = await res.json().catch(() => ({}))
        setActionError(data.error ?? t.actionFailed)
      }
    } catch {
      if (previous) setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, plan: previous } : u)))
      setActionError(t.genericError)
    } finally {
      setBusy(id, false)
    }
  }

  const handleToggleAdmin = async (id: string): Promise<void> => {
    if (rowBusy.has(id)) return // guard double-submit
    setActionError('')
    setBusy(id, true)
    const revert = (): void =>
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isAdmin: !u.isAdmin } : u)))
    // Optimistic toggle, reverted below if the request fails.
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isAdmin: !u.isAdmin } : u)))
    try {
      const res = await authFetch(`/api/admin/users/${id}/toggle-admin`, { method: 'PATCH' })
      if (!res.ok) {
        revert()
        const data = await res.json().catch(() => ({}))
        setActionError(data.error ?? t.actionFailed)
      }
    } catch {
      revert()
      setActionError(t.genericError)
    } finally {
      setBusy(id, false)
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  if (loading) {
    return (
      <PageContainer wide>
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </motion.div>
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          <Skeleton className="h-10 w-64" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </motion.div>
      </PageContainer>
    )
  }

  return (
    <PageContainer wide>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Button type="primary" size="sm" iconLeft={<PlusSmallIcon />} onClick={() => setShowCreate(true)}>
            {t.createUser}
          </Button>
        }
      />

      {loadError !== '' && (
        <motion.div variants={fadeUp}>
          <ErrorBanner message={loadError} />
        </motion.div>
      )}

      {actionError !== '' && (
        <motion.div variants={fadeUp}>
          <ErrorBanner message={actionError} />
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t.statTotalUsers} value={stats.totalUsers.toLocaleString('id-ID')} />
        <StatCard
          label={t.statActiveToday}
          value={<span className="text-brand-token">{stats.activeToday.toLocaleString('id-ID')}</span>}
        />
        <StatCard label={t.statProPlus} value={stats.proPlus.toLocaleString('id-ID')} />
        <StatCard label={t.statTotalBrands} value={stats.totalBrands.toLocaleString('id-ID')} />
      </motion.div>

      <Section>
        {/* Filters */}
        <div className="flex w-full flex-wrap items-center gap-3">
          <div className="w-64">
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterAria}>
            {PLAN_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setPlanFilter(f.value)}
                aria-pressed={planFilter === f.value}
                className="rounded-circle focus-visible:outline-none"
              >
                <Chip
                  type={planFilter === f.value ? 'success' : 'neutral'}
                  outlined={planFilter !== f.value}
                  shape="rounded"
                  size="sm"
                  className="cursor-pointer"
                >
                  {f.label ?? t.filterAll}
                </Chip>
              </button>
            ))}
          </div>
          <span className="ml-auto text-label-medium text-tertiary tabular-nums">
            {t.usersCount(filtered.length)}
          </span>
        </div>

        {/* Users table */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<UsersIcon />}
            title={t.emptyTitle}
            description={t.emptyDescription}
          />
        ) : (
          <Card className="w-full overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-primary">
                    {t.tableHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-label-medium font-medium uppercase text-tertiary"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => (
                    <tr
                      key={user._id}
                      className={cn(
                        'transition-colors duration-200 ease-standard hover:bg-secondary',
                        i < filtered.length - 1 && 'border-b border-neutral-primary',
                      )}
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar email={user.email} plan={user.plan} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-paragraph-medium font-medium text-primary">
                              <span className="truncate">{user.email || '-'}</span>
                              {user.isAdmin && (
                                <Chip type="warning" size="sm" className="shrink-0">
                                  ADMIN
                                </Chip>
                              )}
                            </div>
                            {/* font-mono is inventory-mandated for the raw user id */}
                            <div className="mt-1 truncate font-mono text-label-medium text-tertiary">
                              {user.clerkUserId.slice(0, 18)}…
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan. DS has no Select component; the inventory requires an
                          inline plan select styled as a badge, so this is a native
                          select dressed in token classes only. */}
                      <td className="px-5 py-4">
                        <select
                          value={user.plan}
                          onChange={(e) => handleChangePlan(user._id, e.target.value as Plan)}
                          disabled={rowBusy.has(user._id)}
                          aria-label={t.planFor(user.email)}
                          className={cn(
                            'cursor-pointer appearance-none rounded-token-4 border px-2 py-1 text-label-medium font-medium',
                            'transition-colors duration-200 ease-standard focus-visible:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            PLAN_SELECT[user.plan],
                          )}
                        >
                          <option value="waitlist">Waitlist</option>
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="agency">Agency</option>
                        </select>
                      </td>

                      {/* Brands */}
                      <td className="px-5 py-4 text-paragraph-medium text-secondary tabular-nums">
                        {user.brandCount}
                      </td>

                      {/* Queries */}
                      <td className="px-5 py-4 text-paragraph-medium text-secondary tabular-nums">
                        {user.queryCount.toLocaleString('id-ID')}
                      </td>

                      {/* Last Active, brand color when active < 1h ago */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            'text-paragraph-medium transition-colors duration-200 ease-standard',
                            user.lastActiveAt &&
                              Date.now() - new Date(user.lastActiveAt).getTime() < 60 * 60 * 1000
                              ? 'text-brand-token'
                              : 'text-tertiary',
                          )}
                        >
                          {relativeTime(t, user.lastActiveAt)}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-paragraph-medium text-tertiary">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <Button
                          type="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(user._id)}
                          disabled={rowBusy.has(user._id)}
                          className="whitespace-nowrap"
                        >
                          {user.isAdmin ? t.revokeAdmin : t.makeAdmin}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </Section>

      {/* Create User modal: bg-overlay backdrop, centered Card, vertical+opacity entrance */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            key="create-user-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: transitionEnter(DURATION.short) }}
            exit={{ opacity: 0, transition: transitionExit() }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreate(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: transitionEnter() }}
              exit={{ opacity: 0, y: 16, transition: transitionExit() }}
              className="w-full max-w-[420px]"
            >
              <Card className="flex w-full flex-col gap-6 p-6 shadow-regular-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-h6 font-medium text-primary">{t.createUser}</h2>
                    <p className="text-paragraph-medium text-tertiary">{t.modalSubtitle}</p>
                  </div>
                  <IconButton type="ghost" size="sm" aria-label={t.close} onClick={() => setShowCreate(false)}>
                    <CloseIcon />
                  </IconButton>
                </div>

                <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                  <Input
                    label={t.emailLabel}
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                  <Input
                    label={t.passwordLabel}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                  />
                  {/* DS has no Select component, so this is a native select in token
                      classes, matching the Input field anatomy. */}
                  <div className="flex w-full flex-col gap-2">
                    <label htmlFor="create-user-plan" className="text-field-label font-semibold text-secondary">
                      {t.planLabel}
                    </label>
                    <select
                      id="create-user-plan"
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as Plan)}
                      className={cn(
                        'w-full cursor-pointer appearance-none rounded-token-8 border border-neutral-primary bg-primary px-3 py-2',
                        'text-field-input font-normal text-primary',
                        'transition-colors duration-200 ease-standard focus:border-brand-token focus-visible:outline-none',
                      )}
                    >
                      <option value="waitlist">Waitlist</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="agency">Agency</option>
                    </select>
                  </div>

                  {createError !== '' && <ErrorBanner message={createError} />}

                  <div className="flex gap-3">
                    <Button type="ghost" size="sm" className="flex-1" onClick={() => setShowCreate(false)}>
                      {t.cancel}
                    </Button>
                    <Button type="primary" size="sm" htmlType="submit" disabled={creating} className="flex-1">
                      {creating ? t.creating : t.createUser}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
