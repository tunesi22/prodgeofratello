'use client'

import { useEffect, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import { Button } from '@/components/ui'
import {
  PageContainer,
  PageHeader,
  Section,
  Card,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { DeltaBadge } from '@/components/dashboard/DeltaBadge'
import { PlusSmallIcon, ProjectsIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { type Analytics, type Delta, weekOverWeekDelta } from '@/lib/analytics'
import { cn } from '@/lib/cn'

/**
 * All Projects (sidebar: Admin > All Projects), redesigned /brands page.
 * Parity contract (.design/specs/feature-inventory.md §1):
 * - GET /brands → Brand[] (same endpoint, same shape)
 * - Onboarding CTA → /onboarding; create CTA → /brands/new (header + empty state)
 * - Whole project card links to /brands/{_id}; avatar initial, name, industry,
 *   competitor count (only when > 0), loading/error/empty states preserved.
 * Header copy follows the redesign spec ("All Projects") instead of the legacy
 * "Dashboard / Brands" eyebrow+title.
 */

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
  createdAt: string
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Semua Project',
    subtitle:
      'Kelola project GEO Anda. Setiap project memantau seberapa sering AI seperti ChatGPT dan Gemini menyebut sebuah brand.',
    onboarding: 'Onboarding',
    newProject: 'Project baru',
    projectsSection: 'Daftar Project',
    projectCount: (n: number): string => `${n} project`,
    emptyTitle: 'Belum ada project',
    emptyDescription:
      'Tambahkan brand pertama Anda untuk mulai memantau seberapa sering AI menyebutnya.',
    competitorCount: (n: number): string => `${n} kompetitor`,
    noScan: 'Belum di-scan',
    rateCaption: 'Mention rate · semua waktu',
    vsLastWeek: 'vs minggu lalu',
  },
  en: {
    title: 'All Projects',
    subtitle:
      'Manage your GEO projects. Each project tracks how often AI models like ChatGPT and Gemini mention one brand.',
    onboarding: 'Onboarding',
    newProject: 'New project',
    projectsSection: 'Projects',
    projectCount: (n: number): string => `${n} project${n === 1 ? '' : 's'}`,
    emptyTitle: 'No projects yet',
    emptyDescription: 'Add your first brand to start tracking how often AI mentions it.',
    competitorCount: (n: number): string => `${n} competitor${n === 1 ? '' : 's'}`,
    noScan: 'Not scanned yet',
    rateCaption: 'Mention rate · all time',
    vsLastWeek: 'vs last week',
  },
} as const

/** Per-brand metrics fetched client-side from each brand's /analytics. */
interface BrandMetrics {
  mentionRate: number | null
  delta: Delta | null
  totalQueries: number
}

/** Mention-rate text color, matching the score tiers used elsewhere. */
function rateText(rate: number): string {
  if (rate >= 60) return 'text-brand-token'
  if (rate >= 30) return 'text-warning-token'
  return 'text-error-token'
}

/** Bare domain for display, e.g. "https://www.example.com/x" → "example.com". */
function websiteDomain(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, '')
  } catch {
    return website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? website
  }
}

export default function AllProjectsPage(): ReactElement {
  const apiFetch = useApiFetch()
  const router = useRouter()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [brands, setBrands] = useState<Brand[]>([])
  const [metrics, setMetrics] = useState<Record<string, BrandMetrics>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    apiFetch<Brand[]>('/brands')
      .then(setBrands)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Per-brand metrics, fetched client-side (one /analytics call per brand, like
  // the Usage page). This portfolio roll-up is a frontend stopgap; a dedicated
  // roll-up endpoint would be cleaner (see docs/README-BACKEND.md).
  useEffect(() => {
    if (brands.length === 0) return
    let cancelled = false
    Promise.all(
      brands.map(async (b): Promise<readonly [string, BrandMetrics]> => {
        try {
          const a = await apiFetch<Analytics>(`/brands/${b._id}/analytics`)
          const hasData = a.overall.totalQueries > 0
          return [
            b._id,
            {
              mentionRate: hasData ? a.overall.mentionRate : null,
              delta: hasData ? weekOverWeekDelta(a.trends) : null,
              totalQueries: a.overall.totalQueries,
            },
          ] as const
        } catch {
          return [b._id, { mentionRate: null, delta: null, totalQueries: 0 }] as const
        }
      }),
    ).then((entries) => {
      if (!cancelled) setMetrics(Object.fromEntries(entries))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands])

  return (
    <PageContainer wide>
      <PageHeader
        title={t.title}
        actions={
          <>
            <Button type="ghost" size="md" onClick={() => router.push('/onboarding')}>
              {t.onboarding}
            </Button>
            <Button
              type="primary"
              size="md"
              iconLeft={<PlusSmallIcon />}
              onClick={() => router.push('/brands/new')}
            >
              {t.newProject}
            </Button>
          </>
        }
      />

      <Section
        title={t.projectsSection}
        right={
          !loading && !error ? (
            <span className="text-label-medium font-medium text-tertiary">
              {t.projectCount(brands.length)}
            </span>
          ) : undefined
        }
      >
        {loading && (
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        )}

        {!loading && error !== '' && <ErrorBanner message={error} />}

        {!loading && error === '' && brands.length === 0 && (
          <EmptyState
            icon={<ProjectsIcon />}
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={
              <Button
                type="primary"
                size="md"
                iconLeft={<PlusSmallIcon />}
                onClick={() => router.push('/brands/new')}
              >
                {t.newProject}
              </Button>
            }
          />
        )}

        {!loading && error === '' && brands.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
            {brands.map((brand: Brand) => (
              <Link key={brand._id} href={`/brands/${brand._id}`} className="group block">
                <Card className="flex items-center gap-4 p-5 transition-colors duration-200 ease-standard hover:border-neutral-secondary">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-label-big font-medium text-brand-token"
                  >
                    {brand.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-label-big font-medium text-primary">
                      {brand.name}
                    </span>
                    <span className="truncate text-paragraph-medium text-tertiary">
                      {brand.industry}
                      {brand.competitors.length > 0 &&
                        ` · ${t.competitorCount(brand.competitors.length)}`}
                    </span>
                    <span className="truncate text-paragraph-medium text-tertiary">
                      {websiteDomain(brand.website)}
                    </span>
                  </span>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {metrics[brand._id]?.mentionRate == null ? (
                      <span className="text-label-medium text-tertiary">{t.noScan}</span>
                    ) : (
                      <>
                        <span
                          className={cn(
                            'text-h5 font-semibold tabular-nums',
                            rateText(metrics[brand._id]!.mentionRate!),
                          )}
                        >
                          {metrics[brand._id]!.mentionRate}%
                        </span>
                        <span className="text-label-medium text-tertiary">{t.rateCaption}</span>
                        {metrics[brand._id]?.delta?.value != null && (
                          <span className="flex items-center gap-1.5">
                            <DeltaBadge delta={metrics[brand._id]!.delta!} />
                            <span className="text-label-medium text-tertiary">{t.vsLastWeek}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  )
}
