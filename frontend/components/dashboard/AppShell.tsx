'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { CloseIcon } from '@/components/onboarding/icons'
import { ProgressRing } from './ProgressRing'
import { useActiveProject, useGettingStartedProgress } from '@/lib/useActiveProject'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { DASHBOARD_COPY } from '@/lib/dashboard-copy'
import type { DashboardCopy } from '@/lib/dashboard-copy'
import { transitionEnter, transitionExit } from '@/lib/motion'
import { cn } from '@/lib/cn'
import {
  PanelLeftIcon,
  SquaresFourIcon,
  PromptsIcon,
  CitationsIcon,
  CitationIcon,
  ChartBarsIcon,
  ResearchIcon,
  ToolsIcon,
  SuggestedIcon,
  KnowledgeIcon,
  PublicationsIcon,
  ProjectsIcon,
  BillingIcon,
  UsageIcon,
  BoostIcon,
  GearIcon,
  UsersIcon,
  ChevronUpDownIcon,
  PlusSmallIcon,
} from './nav-icons'
import { AccountSettingsModal } from './AccountSettingsModal'

interface CurrentUser {
  _id: string
  email: string
  plan: string
  isAdmin: boolean
}

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  agency: 'Agency',
}

const COLLAPSE_KEY = 'fratello-sidebar-collapsed'
const GS_DISMISS_KEY = 'fratello-getting-started-dismissed'

interface NavItem {
  /** Key into DASHBOARD_COPY[lang].nav for the bilingual label. */
  labelKey: keyof DashboardCopy['nav']
  icon: (props: { className?: string }) => ReactElement
  /** href, or a builder from the active project id (null id → All Projects). */
  href: string | ((projectId: string | null) => string)
  adminOnly?: boolean
}

interface NavSection {
  headingKey: keyof DashboardCopy['nav']
  items: NavItem[]
}

const projectHref = (path: string) => (projectId: string | null) =>
  projectId ? `/brands/${projectId}${path}` : '/brands'

/** Nav structure, sections/labels from Figma 55:137, labels via DASHBOARD_COPY. */
const SECTIONS: NavSection[] = [
  {
    headingKey: 'brandInsights',
    items: [
      { labelKey: 'overview', icon: SquaresFourIcon, href: projectHref('') },
      { labelKey: 'prompts', icon: PromptsIcon, href: projectHref('/prompts') },
      { labelKey: 'citations', icon: CitationsIcon, href: projectHref('/results') },
      { labelKey: 'citation', icon: CitationIcon, href: projectHref('/citations') },
      { labelKey: 'agentsInsights', icon: ChartBarsIcon, href: projectHref('/analytics') },
    ],
  },
  {
    headingKey: 'aiVisibility',
    items: [
      { labelKey: 'research', icon: ResearchIcon, href: projectHref('/research') },
      { labelKey: 'suggested', icon: SuggestedIcon, href: projectHref('/articles') },
      { labelKey: 'knowledge', icon: KnowledgeIcon, href: projectHref('/knowledge') },
    ],
  },
  {
    headingKey: 'recommendations',
    items: [
      { labelKey: 'tools', icon: ToolsIcon, href: projectHref('/tools') },
      // "Boost your AI Ranking" elevated here from Admin: it is a core
      // recommendation engine (semantic gaps -> how to improve), not account admin.
      { labelKey: 'boost', icon: BoostIcon, href: projectHref('/semantic') },
      { labelKey: 'publications', icon: PublicationsIcon, href: projectHref('/distribution') },
    ],
  },
  {
    headingKey: 'admin',
    items: [
      { labelKey: 'allProjects', icon: ProjectsIcon, href: '/brands' },
      { labelKey: 'billing', icon: BillingIcon, href: '/settings/billing' },
      { labelKey: 'usage', icon: UsageIcon, href: '/usage' },
      { labelKey: 'manageUsers', icon: UsersIcon, href: '/admin/users', adminOnly: true },
    ],
  },
]

function resolveHref(item: NavItem, projectId: string | null): string {
  return typeof item.href === 'function' ? item.href(projectId) : item.href
}

function isItemActive(href: string, pathname: string): boolean {
  if (href === '/brands') return pathname === '/brands' || pathname === '/brands/new'
  // Project overview must not match its sub-pages.
  if (/^\/brands\/[^/]+$/.test(href)) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * App shell, Figma node 55:137. White canvas with a floating sidebar card:
 * 240px wide, 16px inset, bg-brand-green, 1px border, radius-16. Collapsible
 * to an icon rail. Project-scoped nav resolves against the active project.
 */
export function AppShell({ children }: { children: ReactNode }): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = DASHBOARD_COPY[lang]
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [gsDismissed, setGsDismissed] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  // Route transitions aren't instant; highlighting the clicked target right
  // away (instead of waiting for the new page) removes the double-highlight
  // flash where the old item stayed active during the load.
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const switcherRef = useRef<HTMLDivElement>(null)
  const { projects, loading, activeId, activeProject, setActive } = useActiveProject()
  const progress = useGettingStartedProgress(activeId, projects.length > 0)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  function beginNav(href: string): void {
    if (href !== pathname) setPendingHref(href)
  }

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true')
    setGsDismissed(localStorage.getItem(GS_DISMISS_KEY) === 'true')
  }, [])

  function dismissGettingStarted(): void {
    localStorage.setItem(GS_DISMISS_KEY, 'true')
    setGsDismissed(true)
  }

  // Fetch the user once and keep it across navigations. Refetch only while it is
  // still missing (e.g. right after login) instead of on every pathname change.
  useEffect(() => {
    if (user != null) return
    fetch('/api/user/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => {})
  }, [pathname, user])

  useEffect(() => {
    function onClickOutside(e: MouseEvent): void {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggleCollapsed(): void {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, String(!prev))
      return !prev
    })
  }

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    router.push('/sign-in')
  }

  // Auth pages (/sign-in, /sign-up) never get the dashboard shell, even when a
  // session already exists; unauthenticated views get no shell either.
  const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
  if (isAuthRoute || !user) return <>{children}</>

  const userName = user.email.split('@')[0]
  // No name field on the user yet; derive a readable name from the email handle.
  const displayName = userName
    .split(/[._-]+/)
    .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(' ')
  const planLabel = PLAN_LABELS[user.plan] ?? user.plan

  // All Projects (no project selected yet): no sidebar and no top navbar. The
  // page itself carries the account controls (in its welcome banner).
  const isAllProjects = pathname === '/brands' || pathname === '/brands/new'
  if (isAllProjects) {
    return <div className="min-h-screen bg-primary transition-colors duration-300 ease-standard">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-primary transition-colors duration-300 ease-standard">
      {/* ---------- Sidebar ---------- */}
      <aside
        className={cn(
          'sticky top-4 z-30 m-4 mr-0 flex h-[calc(100vh-32px)] shrink-0 flex-col gap-6',
          'rounded-token-16 border border-neutral-primary bg-brand-green',
          'transition-all duration-300 ease-standard',
          collapsed ? 'w-[64px]' : 'w-[240px]',
        )}
      >
        {/* gap tightened vs the Figma 24px so the switcher (user-approved addition)
            still fits the 900px reference viewport without scrolling */}
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Header: logo lockup + collapse */}
          <div className={cn('flex w-full items-center', collapsed ? 'justify-center' : 'justify-between')}>
            {!collapsed && (
              <Link href="/getting-started" className="flex items-center gap-1.5" aria-label="Fratello home">
                <FratelloLogo className="h-[21px] w-[34px]" />
                <span className="font-serif text-[22px] tracking-[-0.45px] text-brand-token transition-colors duration-300 ease-standard">
                  Fratello
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? copy.sidebar.expand : copy.sidebar.collapse}
              className="flex size-7 items-center justify-center rounded text-icon-black-invert transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
            >
              <PanelLeftIcon className="size-5" />
            </button>
          </div>

          {/* Project switcher */}
          {projects.length > 0 && (
            <div ref={switcherRef} className="relative w-full">
              <button
                type="button"
                onClick={() => setSwitcherOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={switcherOpen}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border border-neutral-primary bg-card p-2',
                  'transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed',
                  collapsed && 'justify-center border-0 bg-transparent',
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-display-brand text-label-medium font-medium text-brand-token">
                  {(activeProject?.name ?? '?').charAt(0).toUpperCase()}
                </span>
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate text-left text-action-small font-medium text-primary">
                      {activeProject?.name ?? copy.switcher.selectProject}
                    </span>
                    <ChevronUpDownIcon className="size-4 shrink-0 text-icon-light-gray" />
                  </>
                )}
              </button>
              <AnimatePresence>
                {switcherOpen && (
                  <motion.div
                    role="listbox"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: transitionEnter(0.2) }}
                    exit={{ opacity: 0, y: 4, transition: transitionExit() }}
                    className="absolute left-0 top-full z-40 mt-1 w-56 rounded-token-12 border border-neutral-primary bg-card p-1 shadow-regular-md"
                  >
                    {projects.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        role="option"
                        aria-selected={p._id === activeId}
                        onClick={() => {
                          setActive(p._id)
                          setSwitcherOpen(false)
                          beginNav(`/brands/${p._id}`)
                          router.push(`/brands/${p._id}`)
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg p-2 text-left text-action-small font-medium text-primary',
                          'transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed',
                          p._id === activeId && 'bg-display-brand text-brand-token',
                        )}
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-display-brand text-label-medium font-medium text-brand-token">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      </button>
                    ))}
                    <Link
                      href="/brands/new"
                      onClick={() => {
                        setSwitcherOpen(false)
                        beginNav('/brands/new')
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-action-small font-medium text-secondary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed"
                    >
                      <PlusSmallIcon className="size-4" />
                      {copy.switcher.newProject}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Getting Started, pinned tracker item. Idle looks like every other
              nav item (user request); display-brand only when active. Once all
              steps are done, an X lets the user dismiss it (persisted). The X is a
              sibling of the Link (not nested) so the markup stays valid. */}
          {!gsDismissed && (
            <div className="relative">
              <Link
                href="/getting-started"
                onClick={() => beginNav('/getting-started')}
                aria-label={`${copy.nav.gettingStarted}, ${progress.done}/${progress.total}`}
                aria-current={(pendingHref ?? pathname) === '/getting-started' ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg p-2',
                  'transition-colors duration-200 ease-standard',
                  collapsed && 'justify-center',
                  (pendingHref ?? pathname) === '/getting-started'
                    ? 'bg-display-brand text-brand-token'
                    : 'text-primary hover:bg-btn-ghost-pressed',
                )}
              >
                <ProgressRing
                  progress={(progress.done / progress.total) * 100}
                  size={20}
                  aria-label={`${progress.done}/${progress.total}`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-paragraph-medium">{copy.nav.gettingStarted}</span>
                    {progress.done < progress.total && (
                      <span className="text-label-medium font-medium text-tertiary">
                        {progress.done}/{progress.total}
                      </span>
                    )}
                  </>
                )}
              </Link>
              {!collapsed && progress.done >= progress.total && (
                <button
                  type="button"
                  onClick={dismissGettingStarted}
                  aria-label={copy.nav.dismissGettingStarted}
                  className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-token-4 text-tertiary transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed hover:text-primary focus-visible:bg-btn-ghost-pressed focus-visible:outline-none"
                >
                  <CloseIcon className="size-4" />
                </button>
              )}
            </div>
          )}

          {/* Nav sections */}
          <nav className="flex w-full flex-1 flex-col gap-3">
            {SECTIONS.map((section) => {
              const visible = section.items.filter((i) => !i.adminOnly || user.isAdmin)
              if (visible.length === 0) return null
              return (
                <div key={section.headingKey} className="flex w-full flex-col gap-1">
                  {!collapsed && (
                    <div className="px-2 py-1">
                      <span className="text-label-medium font-medium text-tertiary">
                        {copy.nav[section.headingKey]}
                      </span>
                    </div>
                  )}
                  <div className="flex w-full flex-col gap-1">
                    {visible.map((item) => {
                      const isProjectScoped = typeof item.href === 'function'
                      // No active project (e.g. a fresh account): the project-scoped
                      // destinations don't exist yet, so they all fall back to /brands.
                      // Don't let them light up as active; disable them once loading
                      // settles (plain during load so there is no flash).
                      const noProject = isProjectScoped && activeId === null
                      const disabled = noProject && !loading
                      const href = resolveHref(item, activeId)
                      const label = copy.nav[item.labelKey]
                      // pendingHref makes the clicked target active immediately,
                      // so the old item never stays highlighted during the load.
                      const active = !noProject && isItemActive(href, pendingHref ?? pathname ?? '')
                      const Icon = item.icon

                      if (disabled) {
                        return (
                          <span
                            key={item.labelKey}
                            aria-disabled="true"
                            title={collapsed ? label : undefined}
                            className={cn(
                              'flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-2 py-1',
                              'text-action-small font-medium text-tertiary',
                              collapsed && 'justify-center px-0',
                            )}
                          >
                            <Icon className="size-5 shrink-0" />
                            {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
                          </span>
                        )
                      }

                      return (
                        <Link
                          key={item.labelKey}
                          href={href}
                          onClick={() => beginNav(href)}
                          aria-current={active ? 'page' : undefined}
                          title={collapsed ? label : undefined}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-lg px-2 py-1',
                            'text-action-small font-medium transition-colors duration-200 ease-standard',
                            collapsed && 'justify-center px-0',
                            active
                              ? 'bg-display-brand text-brand-token'
                              : 'text-primary hover:bg-btn-ghost-pressed',
                          )}
                        >
                          <Icon className="size-5 shrink-0" />
                          {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Footer: avatar + name + plan; the gear opens the account settings
            modal (which also holds logout). */}
        <div
          className={cn(
            'mt-0 flex shrink-0 items-center gap-2.5',
            collapsed ? 'mx-2 mb-2 justify-center p-2' : 'mx-4 mb-4 p-2',
          )}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title={user.email}
              aria-label={copy.footer.accountSettings}
              className="flex size-7 shrink-0 items-center justify-center rounded-circle bg-display-brand text-label-medium font-medium text-brand-token"
            >
              {userName.charAt(0).toUpperCase()}
            </button>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-circle bg-display-brand text-label-big font-medium text-brand-token"
              >
                {userName.charAt(0).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-1 flex-col" title={user.email}>
                <span className="truncate text-action-small font-semibold text-primary">{displayName}</span>
                <span className="truncate text-label-medium text-tertiary">{planLabel}</span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label={copy.footer.accountSettings}
                className="flex size-8 shrink-0 items-center justify-center rounded-token-8 text-icon-dark-gray transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed hover:text-primary"
              >
                <GearIcon className="size-5" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ---------- Content ---------- */}
      <main className="min-h-screen min-w-0 flex-1 overflow-y-auto">{children}</main>

      {settingsOpen && (
        <AccountSettingsModal
          email={user.email}
          plan={user.plan}
          onLogout={() => void logout()}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
