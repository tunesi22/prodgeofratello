'use client'

/**
 * Boost your AI Ranking (sidebar: Admin > Boost your AI Ranking), redesign of
 * the legacy "Semantic Intelligence" page, reframed as an action plan.
 *
 * Parity contract: .design/specs/feature-inventory.md §9 (/brands/[id]/semantic).
 * - Same endpoints, fired in parallel ON DEMAND only (never auto-run on mount):
 *   GET /brands/{id}/analytics/semantic-proximity
 *   GET /brands/{id}/analytics/cooccurrence
 * - Same widgets: 3 stat cards (Mentions Analyzed / Concepts Found / the
 *   legacy "Semantic Gaps" stat, relabeled "Missing Concepts", still in red),
 *   concept proximity bars (label + bar width = score% capped
 *   100 + score% text), semantic-gap chips with the "SHOULD be associated
 *   with" subtitle + content tip footnote, competitor concept comparison rows
 *   (or "No competitor mentions found in scan data").
 * - Same states: initial "Click 'Run Analysis' to start / Requires completed
 *   scan data", loading "Analyzing brand mentions... / This may take 30 to 60
 *   seconds", zero-mentions empty state, red error banner.
 * - `CooccurrenceData.topConcepts` is fetched but not rendered, identical to
 *   the legacy page (the inventory widget list never displays it).
 * - BrandNav removed: the new sidebar owns navigation; title via PageHeader.
 * - Legacy 🧠 loading emoji replaced with DS LoadingCircle; legacy red gap
 *   pills rendered as DS warning Chips, framed as recommendations per the
 *   redesign brief.
 */

import { useState } from 'react'
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
import { Button, Chip, LoadingCircle, ProgressBar, useToast } from '@/components/ui'
import { BoostIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface ConceptScore {
  concept: string
  count: number
  score: number
}

interface SemanticProximityData {
  brandId: string
  totalMentions: number
  concepts: ConceptScore[]
  gaps: ConceptScore[]
  computedAt: string
}

interface CompetitorComparison {
  competitor: string
  concepts: string[]
}

interface CooccurrenceData {
  brandId: string
  topConcepts: ConceptScore[]
  competitorComparison: CompetitorComparison[]
}

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Naikkan Ranking AI',
    subtitle:
      'Lihat kata dan topik apa saja yang dikaitkan AI dengan brand Anda. Jalankan analisis untuk mengetahui konsep yang sudah melekat pada brand Anda dan konsep yang perlu Anda tambahkan di konten.',
    analyzing: 'Menganalisis...',
    runAnalysis: 'Jalankan Analisis',
    analysisFailed: 'Analisis gagal',
    analysisDone: 'Analisis selesai',
    loadingAria: 'Menganalisis sebutan brand',
    loadingTitle: 'Sedang menganalisis sebutan brand Anda...',
    loadingHint: 'Biasanya perlu 30 sampai 60 detik',
    noMentionsTitle: 'Belum ada sebutan',
    noMentionsDesc: 'Jalankan scan terlebih dahulu untuk mengumpulkan sebutan brand Anda',
    statMentions: 'Sebutan Dianalisis',
    statConcepts: 'Konsep Ditemukan',
    statGaps: 'Konsep yang Masih Kurang',
    topConceptsTitle: 'Konsep yang Paling Sering Dikaitkan AI dengan Brand Anda',
    computedAt: (date: string): string => `Dihitung ${date}`,
    noConcepts: 'Belum ada konsep yang bisa diambil dari sebutan brand Anda',
    proximityAria: (concept: string): string => `Skor keterkaitan ${concept}`,
    gapsTitle: 'Konsep yang Perlu Anda Tambahkan',
    gapsDesc: 'Konsep yang seharusnya dikaitkan AI dengan brand Anda, tetapi saat ini belum.',
    gapsTip:
      'Rekomendasi: buat konten yang secara natural mengaitkan brand Anda dengan konsep-konsep ini agar AI mulai mengaitkannya juga.',
    competitorTitle: 'Perbandingan Konsep Kompetitor',
    noCompetitorMentions: 'Tidak ada sebutan kompetitor di data scan',
    initialTitle: 'Klik "Jalankan Analisis" untuk mulai',
    initialDesc: 'Butuh data scan yang sudah selesai',
  },
  en: {
    title: 'Boost your AI Ranking',
    subtitle:
      'See which words and topics AI connects with your brand. Run the analysis to find concepts that already stick to your brand and concepts you should add to your content.',
    analyzing: 'Analyzing...',
    runAnalysis: 'Run Analysis',
    analysisFailed: 'Analysis failed',
    analysisDone: 'Analysis complete',
    loadingAria: 'Analyzing brand mentions',
    loadingTitle: 'Analyzing brand mentions...',
    loadingHint: 'This may take 30 to 60 seconds',
    noMentionsTitle: 'No mentions found',
    noMentionsDesc: 'Run a scan first to collect brand mentions',
    statMentions: 'Mentions Analyzed',
    statConcepts: 'Concepts Found',
    statGaps: 'Missing Concepts',
    topConceptsTitle: 'Top Concepts AI Connects with Your Brand',
    computedAt: (date: string): string => `Computed ${date}`,
    noConcepts: 'No concepts extracted from your mentions yet',
    proximityAria: (concept: string): string => `${concept} association score`,
    gapsTitle: 'Concepts You Should Add',
    gapsDesc: "Concepts your brand SHOULD be associated with but currently isn't.",
    gapsTip:
      'Recommendation: create content that naturally connects your brand with these concepts so AI starts to associate them too.',
    competitorTitle: 'Competitor Concept Comparison',
    noCompetitorMentions: 'No competitor mentions found in scan data',
    initialTitle: 'Click "Run Analysis" to start',
    initialDesc: 'Requires completed scan data',
  },
} as const

export default function BoostAiRankingPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const toast = useToast()
  const [proximity, setProximity] = useState<SemanticProximityData | null>(null)
  const [cooccurrence, setCooccurrence] = useState<CooccurrenceData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  async function analyze(): Promise<void> {
    setLoading(true)
    setError('')
    try {
      // Both endpoints in parallel, exactly like the legacy page.
      const [prox, co] = await Promise.all([
        apiFetch<SemanticProximityData>(`/brands/${id}/analytics/semantic-proximity`),
        apiFetch<CooccurrenceData>(`/brands/${id}/analytics/cooccurrence`),
      ])
      setProximity(prox)
      setCooccurrence(co)
      toast.success(t.analysisDone)
    } catch (err: unknown) {
      const message = err instanceof Error && err.message ? err.message : t.analysisFailed
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const hasResults: boolean = !loading && proximity !== null
  const computedAtLabel: string | null =
    proximity !== null && proximity.computedAt
      ? new Date(proximity.computedAt).toLocaleString()
      : null

  return (
    <PageContainer wide>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {error !== '' && (
        <motion.div variants={fadeUp} className="w-full">
          <ErrorBanner message={error} />
        </motion.div>
      )}

      {/* Loading: legacy 🧠 emoji replaced with DS LoadingCircle */}
      {loading && (
        <motion.div variants={fadeUp} className="flex w-full flex-col gap-4">
          <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <LoadingCircle size="lg" aria-label={t.loadingAria} />
            <span className="text-h6 font-normal text-primary">{t.loadingTitle}</span>
            <span className="text-paragraph-medium text-secondary">{t.loadingHint}</span>
          </Card>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-48 w-full" />
        </motion.div>
      )}

      {/* Zero mentions: analysis ran but no brand mentions in scan data */}
      {hasResults && proximity !== null && proximity.totalMentions === 0 && (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<BoostIcon />}
            title={t.noMentionsTitle}
            description={t.noMentionsDesc}
          />
        </motion.div>
      )}

      {hasResults && proximity !== null && proximity.totalMentions > 0 && (
        <>
          {/* Stats row: Semantic Gaps stays red per inventory */}
          <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={t.statMentions} value={proximity.totalMentions} />
            <StatCard label={t.statConcepts} value={proximity.concepts.length} />
            <StatCard
              label={t.statGaps}
              value={<span className="text-error-token">{proximity.gaps.length}</span>}
            />
          </motion.div>

          {/* Concept proximity list: label + bar (score% capped 100) + % text */}
          <Section
            title={t.topConceptsTitle}
            right={
              computedAtLabel !== null ? (
                <span className="text-label-medium font-medium text-tertiary">
                  {t.computedAt(computedAtLabel)}
                </span>
              ) : undefined
            }
          >
            <Card className="flex flex-col gap-3 p-6">
              {proximity.concepts.length === 0 ? (
                <p className="text-paragraph-medium text-tertiary">
                  {t.noConcepts}
                </p>
              ) : (
                proximity.concepts.map((c: ConceptScore) => (
                  <div key={c.concept} className="flex items-center gap-3">
                    <span className="w-48 shrink-0 truncate text-paragraph-medium capitalize text-secondary">
                      {c.concept}
                    </span>
                    <ProgressBar
                      progress={Math.min(c.score, 100)}
                      thickness={8}
                      className="flex-1"
                      aria-label={t.proximityAria(c.concept)}
                    />
                    <span className="w-12 shrink-0 text-right text-label-medium font-medium text-tertiary">
                      {c.score}%
                    </span>
                  </div>
                ))
              )}
            </Card>
          </Section>

          {/* Semantic gaps: legacy red pills become DS warning Chips, framed
              as recommendations with an action hint (redesign brief). */}
          {proximity.gaps.length > 0 && (
            <Section title={t.gapsTitle}>
              <Card className="flex flex-col gap-4 p-6">
                <p className="text-paragraph-medium text-secondary">
                  {t.gapsDesc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {proximity.gaps.map((g: ConceptScore) => (
                    <Chip key={g.concept} type="warning" shape="rounded" size="sm" className="capitalize">
                      {g.concept}
                    </Chip>
                  ))}
                </div>
                <p className="text-paragraph-medium text-tertiary">
                  {t.gapsTip}
                </p>
              </Card>
            </Section>
          )}

          {/* Co-occurrence findings: competitor concept comparison rows */}
          {cooccurrence !== null && cooccurrence.competitorComparison.length > 0 && (
            <Section title={t.competitorTitle}>
              <Card className="flex flex-col divide-y divide-neutral-primary px-6">
                {cooccurrence.competitorComparison.map((comp: CompetitorComparison) => (
                  <div key={comp.competitor} className="flex flex-col gap-2 py-4">
                    <p className="text-label-medium font-medium capitalize text-primary">
                      {comp.competitor}
                    </p>
                    {comp.concepts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {comp.concepts.map((c: string) => (
                          <Chip key={c} type="success" shape="rounded" size="sm" className="capitalize">
                            {c}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <p className="text-paragraph-medium text-tertiary">
                        {t.noCompetitorMentions}
                      </p>
                    )}
                  </div>
                ))}
              </Card>
            </Section>
          )}
        </>
      )}

      {/* Initial state: analysis is never auto-run on mount (inventory §9) */}
      {!loading && proximity === null && error === '' && (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<BoostIcon />}
            title={t.initialTitle}
            description={t.initialDesc}
            action={
              <Button type="primary" size="sm" onClick={() => void analyze()}>
                {t.runAnalysis}
              </Button>
            }
          />
        </motion.div>
      )}
    </PageContainer>
  )
}
