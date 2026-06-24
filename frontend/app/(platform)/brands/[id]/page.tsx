'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CircleNotch, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import { Button, Chip, ProgressBar } from '@/components/ui'
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
import { DeltaBadge } from '@/components/dashboard/DeltaBadge'
import { DataFreshness } from '@/components/dashboard/DataFreshness'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { ActionQueue } from '@/components/dashboard/ActionQueue'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useTopLoading } from '@/components/providers/TopLoadingBar'
import {
  type Analytics,
  modelLabel, weekOverWeekDelta, aggregateSentiment, rateForModel, rateChipType, topOpportunities,
} from '@/lib/analytics'

interface ScanRun {
  _id: string
  startedAt: string
  completedAt?: string
  status: 'running' | 'completed' | 'failed'
  totalJobs: number
  completedJobs: number
  summary?: {
    overall: { total: number; mentioned: number; mentionRate: number }
    byModel: { model: string; total: number; mentioned: number; mentionRate: number }[]
  }
}

/**
 * Brand Overview, the "AI Visibility Report Card" (sidebar: Brand Insights >
 * Overview, ID "Ringkasan"). Leads with a headline visibility number + week
 * over week trend + plain interpretation, then by-model, sentiment summary, and
 * the top content opportunities. Pulls everything from GET /brands/{id}/analytics
 * (which subsumes the old mention-rate call); deep detail lives in Agents Insights.
 *
 * Scan feedback: Run Scan enqueues async jobs; we then poll /analytics until the
 * result count reaches baseline + jobsEnqueued (or a timeout), showing live
 * progress, then auto-refresh, so the user is never left guessing.
 */

const SENTIMENT_COLORS = {
  positive: 'var(--icon-brand)',
  neutral: 'var(--icon-light-gray)',
  negative: 'var(--icon-error)',
} as const

const POLL_INTERVAL_MS = 9000
const MAX_POLLS = 40 // ~6 minutes safety cap

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
}

const COPY = {
  id: {
    runScan: 'Jalankan Scan',
    startingScan: 'Memulai scan…',
    requestFailed: 'Permintaan gagal',
    scanQueuedNoJobs:
      'Tidak ada prompt aktif untuk di-scan. Buat prompts terlebih dahulu.',
    scanRunning: (done: number, total: number): string =>
      `Scan berjalan. ${done} dari ${total} pengecekan selesai. Anda boleh tetap di halaman ini.`,
    scanDone: (n: number): string => `Scan selesai. ${n} hasil baru masuk.`,
    scanSlow:
      'Scan masih berjalan di latar belakang. Hasil akan muncul otomatis, atau muat ulang halaman nanti.',
    headline: (rate: number): string => `Brand Anda muncul di ${rate}% jawaban AI`,
    interpStrong: 'Visibilitas brand Anda kuat.',
    interpMid: 'Visibilitas brand Anda lumayan, masih ada ruang untuk naik.',
    interpLow: 'Visibilitas brand Anda masih rendah. Fokus ke peluang konten di bawah.',
    interpUp: 'Terus membaik dibanding minggu lalu.',
    interpDown: 'Sedikit turun dibanding minggu lalu.',
    vsLastWeek: 'vs minggu lalu',
    totalQueries: 'Total Pertanyaan',
    totalMentions: 'Total Sebutan',
    bestModel: 'Model Terbaik',
    rateByModel: 'Mention Rate per Model AI',
    rowStats: (mentions: number, queries: number): string => `${mentions} sebutan · ${queries} pertanyaan`,
    sentimentTitle: 'Sentimen Sebutan',
    sentimentHint: 'Bagaimana AI membicarakan brand Anda saat menyebutnya.',
    positive: 'Positif',
    neutral: 'Netral',
    negative: 'Negatif',
    opportunitiesTitle: 'Peluang Teratas',
    opportunitiesHint: 'Pertanyaan yang jarang menyebut brand Anda. Buat konten untuk ini agar lebih sering disebut.',
    createContent: 'Buat konten',
    fullAnalytics: 'Lihat analitik lengkap',
    emptyTitle: 'Belum ada hasil scan',
    emptyDescription:
      'Jalankan scan untuk melihat seberapa sering AI menyebut brand Anda di ChatGPT, Gemini, Perplexity, dan lainnya.',
    generatePrompts: 'Buat Prompts dengan AI',
    researchPrompts: 'Riset Pertanyaan Asli',
    guidedSetup: 'Siapkan otomatis',
    settingUp: 'Menyiapkan...',
    orManual: 'atau atur manual',
  },
  en: {
    runScan: 'Run Scan',
    startingScan: 'Starting scan…',
    requestFailed: 'Request failed',
    scanQueuedNoJobs: 'No active prompts to scan. Create prompts first.',
    scanRunning: (done: number, total: number): string =>
      `Scan running. ${done} of ${total} checks done. You can stay on this page.`,
    scanDone: (n: number): string => `Scan complete. ${n} new results came in.`,
    scanSlow:
      'The scan is still running in the background. Results will appear automatically, or reload later.',
    headline: (rate: number): string => `Your brand appears in ${rate}% of AI answers`,
    interpStrong: 'Your brand visibility is strong.',
    interpMid: 'Your brand visibility is decent, with room to grow.',
    interpLow: 'Your brand visibility is still low. Focus on the content opportunities below.',
    interpUp: 'Improving versus last week.',
    interpDown: 'Slightly down versus last week.',
    vsLastWeek: 'vs last week',
    totalQueries: 'Total Questions Asked',
    totalMentions: 'Total Mentions',
    bestModel: 'Best Model',
    rateByModel: 'Mention Rate by AI Model',
    rowStats: (mentions: number, queries: number): string => `${mentions} mentions · ${queries} questions`,
    sentimentTitle: 'Mention Sentiment',
    sentimentHint: 'How AI talks about your brand when it mentions you.',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    opportunitiesTitle: 'Top Opportunities',
    opportunitiesHint: 'Questions that rarely mention your brand. Create content for these to get mentioned more.',
    createContent: 'Create content',
    fullAnalytics: 'See full analytics',
    emptyTitle: 'No scan results yet',
    emptyDescription:
      'Run a scan to see how often AI mentions your brand across ChatGPT, Gemini, Perplexity, and more.',
    generatePrompts: 'AI-Generate Prompts',
    researchPrompts: 'Research Real Questions',
    guidedSetup: 'Set up automatically',
    settingUp: 'Setting up...',
    orManual: 'or set up manually',
  },
} as const

interface ScanState {
  status: 'idle' | 'running' | 'done' | 'slow'
  baseline: number
  target: number
  done: number
}

export default function BrandOverviewPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const { start, done } = useTopLoading()
  const t = COPY[lang]

  const [brand, setBrand] = useState<Brand | null>(null)
  const [data, setData] = useState<Analytics | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanRun[]>([])
  const [guidedLoading, setGuidedLoading] = useState<boolean>(false)
  const [scanning, setScanning] = useState<boolean>(false)
  const [scan, setScan] = useState<ScanState>({ status: 'idle', baseline: 0, target: 0, done: 0 })
  const [scanNotice, setScanNotice] = useState<string>('')
  const [scanError, setScanError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const pollsRef = useRef<number>(0)

  const loadScanHistory = useCallback(async () => {
    try {
      const res = await apiFetch<{ scans: ScanRun[] }>(`/brands/${id}/scans`)
      setScanHistory(res.scans)
    } catch { /* fail silently */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadData = useCallback(async (): Promise<Analytics | null> => {
    const [b, a] = await Promise.all([
      apiFetch<Brand>(`/brands/${id}`),
      apiFetch<Analytics>(`/brands/${id}/analytics`).catch(() => null),
    ])
    setBrand(b)
    setData(a)
    void loadScanHistory()
    return a
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    loadData().catch((e: unknown) => setError(e instanceof Error ? e.message : t.requestFailed))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Poll for scan completion while a scan is running.
  useEffect(() => {
    if (scan.status !== 'running') return
    let ignore = false
    const timer = setInterval(() => {
      pollsRef.current += 1
      apiFetch<Analytics>(`/brands/${id}/analytics`)
        .then((a) => {
          if (ignore) return
          const done = Math.max(0, a.overall.totalQueries - scan.baseline)
          if (a.overall.totalQueries >= scan.target) {
            setData(a)
            setScan((s) => ({ ...s, status: 'done', done: s.target - s.baseline }))
            void loadScanHistory()
          } else if (pollsRef.current >= MAX_POLLS) {
            setData(a)
            setScan((s) => ({ ...s, status: 'slow', done }))
            setScanNotice(t.scanSlow)
            void loadScanHistory()
          } else {
            setScan((s) => ({ ...s, done }))
          }
        })
        .catch(() => {})
    }, POLL_INTERVAL_MS)
    return () => {
      ignore = true
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan.status, scan.baseline, scan.target, id])

  async function handleScan(): Promise<void> {
    setScanning(true)
    setScanError('')
    setScanNotice('')
    start()
    const baseline = data?.overall.totalQueries ?? 0
    try {
      const res = await apiFetch<{ message: string; jobsEnqueued: number }>(`/brands/${id}/scan`, {
        method: 'POST',
      })
      if (res.jobsEnqueued <= 0) {
        // No active prompts: friendly notice, not an error banner.
        setScan({ status: 'idle', baseline, target: baseline, done: 0 })
        setScanNotice(t.scanQueuedNoJobs)
        return
      }
      pollsRef.current = 0
      setScan({ status: 'running', baseline, target: baseline + res.jobsEnqueued, done: 0 })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t.requestFailed
      // Backend throws a 500 with this message when there are no active prompts;
      // surface our localized notice instead of the raw internal string.
      if (/no active prompts/i.test(msg)) {
        setScanNotice(t.scanQueuedNoJobs)
      } else {
        setScanError(msg)
      }
    } finally {
      setScanning(false)
      done()
    }
  }

  /** Guided first run: generate the prompt pool, then kick off the first scan. */
  async function handleGuidedSetup(): Promise<void> {
    setGuidedLoading(true)
    setScanError('')
    setScanNotice('')
    try {
      await apiFetch(`/brands/${id}/prompts`, { method: 'POST' })
      await handleScan()
    } catch (e: unknown) {
      setScanError(e instanceof Error ? e.message : t.requestFailed)
    } finally {
      setGuidedLoading(false)
    }
  }

  if (error) {
    return (
      <PageContainer wide>
        <motion.div variants={fadeUp} className="w-full"><ErrorBanner message={error} /></motion.div>
      </PageContainer>
    )
  }

  if (!brand) {
    return (
      <PageContainer wide>
        <div className="flex w-full items-center justify-between gap-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    )
  }

  const hasData = data != null && data.overall.totalQueries > 0
  const wow = hasData ? weekOverWeekDelta(data.trends) : null
  const sentiment = hasData ? aggregateSentiment(data.sentiment) : null
  // Guard against orphaned gap rows: getPromptGaps falls back to '' when a
  // queryresult's prompt is missing from the prompts collection, which would
  // render blank rows. Drop those so the card never looks empty.
  const opportunities = hasData
    ? topOpportunities(data.gaps, 3).filter((g) => g.text.trim() !== '')
    : []

  const interp = (): string => {
    if (data == null) return ''
    const r = data.overall.mentionRate
    const base = r >= 60 ? t.interpStrong : r >= 30 ? t.interpMid : t.interpLow
    const dir = wow?.direction === 'up' ? ` ${t.interpUp}` : wow?.direction === 'down' ? ` ${t.interpDown}` : ''
    return base + dir
  }

  const sentPct = (n: number): number =>
    sentiment != null && sentiment.total > 0 ? Math.round((n / sentiment.total) * 100) : 0

  return (
    <PageContainer wide>
      <PageHeader
        title={brand.name}
        icon={
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-token-12 bg-display-brand text-h6 font-medium text-brand-token transition-colors duration-300 ease-standard"
          >
            {brand.name.charAt(0).toUpperCase()}
          </span>
        }
        subtitle={
          <>
            <a href={brand.website} target="_blank" rel="noreferrer" className="text-brand-token transition-colors duration-200 ease-standard hover:underline">
              {brand.website}
            </a>
            <span className="text-tertiary"> · </span>
            <span>{brand.industry}</span>
          </>
        }
        actions={
          <>
            <DataFreshness brandId={id} />
            {hasData && (
              <Button type="primary" size="sm" disabled={scanning || scan.status === 'running'} onClick={handleScan}>
                {scanning ? t.startingScan : t.runScan}
              </Button>
            )}
          </>
        }
      />

      {/* Scan progress / completion feedback */}
      {scan.status === 'running' && (
        <motion.div variants={fadeUp} className="w-full">
          <Card variant="brand" role="status" className="flex flex-col gap-2 px-4 py-3">
            <span className="flex items-center gap-2 text-paragraph-medium text-brand-token">
              <CircleNotch className="size-4 animate-spin" aria-hidden="true" />
              {t.scanRunning(scan.done, scan.target - scan.baseline)}
            </span>
            <ProgressBar
              progress={scan.target > scan.baseline ? (scan.done / (scan.target - scan.baseline)) * 100 : 0}
              thickness={4}
            />
          </Card>
        </motion.div>
      )}
      {scan.status === 'done' && (
        <motion.div variants={fadeUp} className="w-full">
          <Card variant="brand" role="status" className="px-4 py-3 text-paragraph-medium text-brand-token">
            {t.scanDone(scan.done)}
          </Card>
        </motion.div>
      )}
      {scanNotice !== '' && (
        <motion.div variants={fadeUp} className="w-full">
          <Card role="status" className="px-4 py-3 text-paragraph-medium text-secondary">
            {scanNotice}
          </Card>
        </motion.div>
      )}
      {scanError !== '' && (
        <motion.div variants={fadeUp} className="w-full"><ErrorBanner message={scanError} /></motion.div>
      )}

      {hasData ? (
        <>
          {/* Headline report-card hero */}
          <motion.div variants={fadeUp} className="w-full">
            <Card variant="brand" className="flex flex-col gap-3 border border-brand-token !bg-brand-green p-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-h3 font-semibold text-primary transition-colors duration-300 ease-standard">
                  {t.headline(data.overall.mentionRate)}
                </h2>
                {wow != null && wow.value != null && <DeltaBadge delta={wow} suffix={t.vsLastWeek} />}
              </div>
              <p className="text-paragraph-big text-secondary transition-colors duration-300 ease-standard">{interp()}</p>
              <Link href={`/brands/${id}/analytics`} className="inline-flex w-fit items-center gap-1 text-action-small font-medium text-brand-token underline-offset-2 transition-colors duration-200 ease-standard hover:underline">
                {t.fullAnalytics}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Card>
          </motion.div>

          {/* Do this next: prioritized action queue from gaps + audit + semantic. */}
          <ActionQueue brandId={id} website={brand.website} gaps={data.gaps} />

          {/* Secondary stats */}
          <motion.div variants={fadeUp} className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard label={t.totalQueries} value={<span className="tabular-nums">{data.overall.totalQueries}</span>} />
            <StatCard label={t.totalMentions} value={<span className="tabular-nums">{data.overall.mentionCount}</span>} />
            <StatCard
              label={t.bestModel}
              value={
                <span className="inline-flex items-center gap-2">
                  {data.bestModel != null && <ModelLogo model={data.bestModel} className="size-5" />}
                  {modelLabel(data.bestModel)}
                </span>
              }
              caption={(() => { const r = rateForModel(data.byModel, data.bestModel); return r != null ? `${r}%` : undefined })()}
            />
          </motion.div>

          {/* By-model + sentiment side by side */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title={t.rateByModel}>
              <Card className="w-full divide-y divide-neutral-primary">
                {data.byModel.map((row) => (
                  <div key={row.model} className="flex w-full flex-wrap items-center gap-4 px-4 py-3">
                    <span className="flex w-28 shrink-0 items-center gap-2 text-label-medium font-medium text-primary">
                      <ModelLogo model={row.model} className="size-4" />
                      {modelLabel(row.model)}
                    </span>
                    <div className="min-w-24 flex-1"><ProgressBar progress={row.mentionRate} thickness={4} /></div>
                    <span className="shrink-0 text-paragraph-medium text-secondary tabular-nums">{t.rowStats(row.mentionCount, row.totalQueries)}</span>
                    <Chip type={rateChipType(row.mentionRate)} shape="rounded" size="sm" className="tabular-nums">{row.mentionRate}%</Chip>
                  </div>
                ))}
              </Card>
            </Section>

            {sentiment != null && sentiment.total > 0 && (
              <Section title={t.sentimentTitle} help={t.sentimentHint}>
                <Card className="flex flex-col gap-4 p-4">
                  <div className="flex h-3 w-full overflow-hidden rounded-circle bg-secondary">
                    <span style={{ width: `${sentPct(sentiment.positive)}%`, background: SENTIMENT_COLORS.positive }} />
                    <span style={{ width: `${sentPct(sentiment.neutral)}%`, background: SENTIMENT_COLORS.neutral }} />
                    <span style={{ width: `${sentPct(sentiment.negative)}%`, background: SENTIMENT_COLORS.negative }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: t.positive, value: sentiment.positive, color: SENTIMENT_COLORS.positive },
                      { label: t.neutral, value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
                      { label: t.negative, value: sentiment.negative, color: SENTIMENT_COLORS.negative },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className="size-3 shrink-0 rounded-circle" style={{ background: s.color }} aria-hidden="true" />
                        <span className="flex-1 text-paragraph-medium text-secondary">{s.label}</span>
                        <span className="text-label-medium font-medium text-primary tabular-nums">{sentPct(s.value)}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Section>
            )}
          </div>

          {/* Top opportunities */}
          {opportunities.length > 0 && (
            <Section title={t.opportunitiesTitle} help={t.opportunitiesHint}>
              <Card className="flex flex-col divide-y divide-neutral-primary">
                {opportunities.map((g) => (
                  <div key={g.promptId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <p className="min-w-[200px] flex-1 text-paragraph-medium text-primary">{g.text}</p>
                    <Chip type="warning" size="sm" shape="rounded" className="tabular-nums">{g.mentionRate}%</Chip>
                    <Link
                      href={`/brands/${id}/articles?promptId=${g.promptId}`}
                      className="inline-flex items-center gap-1 text-action-small font-medium text-brand-token underline-offset-2 transition-colors duration-200 ease-standard hover:underline"
                    >
                      {t.createContent}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </Card>
            </Section>
          )}
        </>
      ) : (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<MagnifyingGlass />}
            title={t.emptyTitle}
            description={t.emptyDescription}
            action={
              <Button
                type="primary"
                size="md"
                disabled={guidedLoading || scanning}
                onClick={handleGuidedSetup}
              >
                {guidedLoading || scanning ? t.startingScan : t.runScan}
              </Button>
            }
          />
        </motion.div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Section title={lang === 'id' ? 'Riwayat Scan' : 'Scan History'}>
          <Card className="w-full divide-y divide-neutral-primary">
            {scanHistory.map((s) => {
              const date = new Date(s.startedAt)
              const dateStr = date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              const timeStr = date.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', {
                hour: '2-digit', minute: '2-digit',
              })
              const isRunning = s.status === 'running'
              const progress = s.totalJobs > 0 ? Math.round((s.completedJobs / s.totalJobs) * 100) : 0

              return (
                <div key={s._id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                  <div className="flex min-w-[160px] flex-1 flex-col gap-0.5">
                    <span className="text-label-medium font-medium text-primary">{dateStr} · {timeStr}</span>
                    {isRunning ? (
                      <div className="flex items-center gap-2">
                        <CircleNotch className="size-3 animate-spin text-brand-token" aria-hidden="true" />
                        <span className="text-paragraph-small text-secondary">
                          {s.completedJobs}/{s.totalJobs} checks
                        </span>
                      </div>
                    ) : (
                      <span className="text-paragraph-small text-tertiary">{s.completedJobs}/{s.totalJobs} checks</span>
                    )}
                  </div>

                  {s.summary && !isRunning ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {s.summary.byModel.map((m) => (
                        <span key={m.model} className="flex items-center gap-1 text-paragraph-small text-secondary">
                          <ModelLogo model={m.model as any} className="size-3.5" />
                          <span className="tabular-nums">{m.mentionRate}%</span>
                        </span>
                      ))}
                    </div>
                  ) : isRunning ? (
                    <div className="w-24"><ProgressBar progress={progress} thickness={4} /></div>
                  ) : null}

                  {s.summary && (
                    <Chip
                      type={s.summary.overall.mentionRate >= 60 ? 'success' : s.summary.overall.mentionRate >= 30 ? 'warning' : 'error'}
                      size="sm"
                      shape="rounded"
                      className="tabular-nums"
                    >
                      {s.summary.overall.mentionRate}%
                    </Chip>
                  )}
                </div>
              )
            })}
          </Card>
        </Section>
      )}
    </PageContainer>
  )
}
