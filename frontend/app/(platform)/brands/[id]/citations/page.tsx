'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
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
import { Chip } from '@/components/ui'
import { CitationIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface Citation {
  url: string
  count: number
  models: string[]
  firstSeen: string
  lastSeen: string
}

interface CitationsData {
  brandId: string
  total: number
  citations: Citation[]
}

const MODEL_LABEL: Record<string, string> = {
  perplexity: 'Perplexity',
  openai: 'ChatGPT',
  gemini: 'Gemini',
  anthropic: 'Claude',
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const COPY = {
  id: {
    title: 'Sitasi',
    subtitle: 'Sumber dan URL yang dirujuk AI saat menjawab. Berbeda dari penyebutan brand.',
    statTotal: 'Sumber Unik',
    statCitations: 'Total Sitasi',
    statTopDomain: 'Domain Terbanyak',
    tableTitle: 'Sumber yang Dirujuk AI',
    colSource: 'Sumber',
    colCitations: 'Sitasi',
    colModels: 'Model',
    colLastSeen: 'Terakhir Terlihat',
    emptyTitle: 'Belum ada data sitasi',
    emptyDesc: 'Sitasi dikumpulkan otomatis dari respons Perplexity saat scan berjalan. Jalankan scan baru untuk mengumpulkan sitasi.',
    note: 'Hanya Perplexity yang mengembalikan URL sumber secara eksplisit. Model lain (ChatGPT, Gemini, Claude) tidak mengekspos sitasi.',
  },
  en: {
    title: 'Citations',
    subtitle: 'The sources and URLs the AI references when it answers. Different from brand mentions.',
    statTotal: 'Unique Sources',
    statCitations: 'Total Citations',
    statTopDomain: 'Top Domain',
    tableTitle: 'Sources AI References',
    colSource: 'Source',
    colCitations: 'Citations',
    colModels: 'Models',
    colLastSeen: 'Last Seen',
    emptyTitle: 'No citation data yet',
    emptyDesc: 'Citations are collected automatically from Perplexity responses during scans. Run a new scan to start collecting citations.',
    note: 'Only Perplexity returns explicit source URLs. Other models (ChatGPT, Gemini, Claude) do not expose citations.',
  },
} as const

export default function CitationsPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [data, setData] = useState<CitationsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    apiFetch<CitationsData>(`/brands/${id}/citations`)
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load citations')
      })
      .finally(() => setLoading(false))
  }, [id])

  const topDomain =
    data && data.citations.length > 0 ? extractDomain(data.citations[0].url) : null

  const totalCitationCount =
    data ? data.citations.reduce((sum, c) => sum + c.count, 0) : 0

  return (
    <PageContainer wide>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {error !== '' && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={error} />
        </motion.div>
      )}

      {loading && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-4">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </motion.div>
      )}

      {!loading && data !== null && data.citations.length === 0 && (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<CitationIcon />}
            title={t.emptyTitle}
            description={t.emptyDesc}
          />
        </motion.div>
      )}

      {!loading && data !== null && data.citations.length > 0 && (
        <>
          <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t.statTotal} value={data.total} />
            <StatCard label={t.statCitations} value={totalCitationCount} />
            <StatCard label={t.statTopDomain} value={topDomain ?? '—'} />
          </motion.div>

          <Section title={t.tableTitle}>
            <Card className="w-full overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-primary">
                      <th className="px-4 py-3 text-label-medium font-medium text-tertiary">
                        {t.colSource}
                      </th>
                      <th className="px-4 py-3 text-right text-label-medium font-medium text-tertiary">
                        {t.colCitations}
                      </th>
                      <th className="px-4 py-3 text-label-medium font-medium text-tertiary">
                        {t.colModels}
                      </th>
                      <th className="px-4 py-3 text-label-medium font-medium text-tertiary">
                        {t.colLastSeen}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-primary">
                    {data.citations.map((c: Citation) => (
                      <tr key={c.url} className="group hover:bg-neutral-secondary/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-label-medium font-medium text-primary">
                              {extractDomain(c.url)}
                            </span>
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="max-w-xs truncate text-label-small text-brand-primary hover:underline"
                            >
                              {c.url}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-label-medium font-medium text-primary">
                            {c.count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.models.map((m: string) => (
                              <Chip key={m} type="default" size="sm">
                                {MODEL_LABEL[m] ?? m}
                              </Chip>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-label-medium text-secondary">
                          {new Date(c.lastSeen).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Section>

          <motion.div variants={fadeUp} className="w-full">
            <p className="text-label-medium text-tertiary">{t.note}</p>
          </motion.div>
        </>
      )}
    </PageContainer>
  )
}
