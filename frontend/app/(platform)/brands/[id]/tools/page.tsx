'use client'

import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { animate, useReducedMotion } from 'framer-motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { DURATION, EASE_STANDARD } from '@/lib/motion'
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageContainer,
  PageHeader,
  Section,
  Skeleton,
} from '@/components/dashboard/primitives'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { Button, Chip, Input, Popover, TextBox, ValidationCheck, useToast, type ChipType } from '@/components/ui'
import { QuestionIcon, CheckCircleIcon } from '@/components/onboarding/icons'
import { FileText, GearSix, FileCode, Copy, Check } from '@phosphor-icons/react/dist/ssr'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * GEO Audit Tools (sidebar: AI Visibility > GEO Audit Tools).
 *
 * Layout (user request): the GEO Score Audit is THE feature, a hero at the top
 * with a large score ring, URL pre-filled from the brand website, and checks
 * sorted failed-first. Backlink targets follow as the second audit feature.
 * The llms.txt and Nginx generators are demoted to a clearly secondary
 * "for your website developer" zone at the bottom, side by side.
 * All four endpoints/payloads are unchanged.
 */

interface GEOCheck {
  label: string
  passed: boolean
  impact: 'high' | 'medium' | 'low'
  recommendation: string
}

interface GEOResult {
  score: number
  checks: GEOCheck[]
}

interface BacklinkTarget {
  platform: string
  type: string
  relevance: string
  url: string
}

/** Legacy impact colors (high red / medium yellow / low gray) to DS chip types. */
const IMPACT_CHIP: Record<GEOCheck['impact'], ChipType> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
}

/**
 * The audit check labels + recommendations come from the backend in English.
 * These maps translate them to Indonesian (formal "Anda", no dashes). Lookups
 * are by the exact English string and fall back to the raw value, so any future
 * backend check shows up untranslated rather than breaking.
 */
const CHECK_LABEL_ID: Record<string, string> = {
  'llms.txt present': 'File llms.txt tersedia',
  'FAQ section present': 'Bagian FAQ tersedia',
  'Brand definition present': 'Definisi brand tersedia',
  'Structured lists (5+ items)': 'Daftar terstruktur (5+ item)',
  'Meta description (50+ chars)': 'Meta description (50+ karakter)',
  'JSON-LD schema markup': 'Markup schema JSON-LD',
  'Sitemap reference': 'Referensi sitemap',
}

const CHECK_RECO_ID: Record<string, string> = {
  'Create a /llms.txt file at your domain root with brand info, key facts, and usage policy.':
    'Buat file /llms.txt di root domain Anda yang berisi informasi brand, fakta penting, dan kebijakan penggunaan.',
  'Add an FAQ section to your page. AI assistants frequently extract FAQ-style content.':
    'Tambahkan bagian FAQ pada halaman Anda. Asisten AI sering mengambil konten bergaya FAQ.',
  'Add a clear "What is [Brand]?" section on your page so AI can easily extract your brand definition.':
    'Tambahkan bagian "Apa itu [Brand]?" yang jelas pada halaman Anda agar AI mudah memahami definisi brand Anda.',
  'Use more bulleted/numbered lists for features, benefits, and comparisons.':
    'Gunakan lebih banyak daftar berpoin atau bernomor untuk fitur, manfaat, dan perbandingan.',
  'Add a descriptive meta description (100-160 chars) that summarizes your brand clearly.':
    'Tambahkan meta description yang deskriptif (100 sampai 160 karakter) yang merangkum brand Anda dengan jelas.',
  'Add JSON-LD schema (Organization, Product, FAQPage) to help AI understand your brand structure.':
    'Tambahkan schema JSON-LD (Organization, Product, FAQPage) agar AI memahami struktur brand Anda.',
  'Add a sitemap.xml and reference it in your robots.txt to help AI crawlers discover all pages.':
    'Tambahkan sitemap.xml dan referensikan di robots.txt agar crawler AI menemukan semua halaman.',
}

/** Translate a check's label + recommendation to the active language. */
function translateCheck(check: GEOCheck, lang: 'id' | 'en'): { label: string; recommendation: string } {
  if (lang === 'en') return { label: check.label, recommendation: check.recommendation }
  return {
    label: CHECK_LABEL_ID[check.label] ?? check.label,
    recommendation: CHECK_RECO_ID[check.recommendation] ?? check.recommendation,
  }
}

/** Legacy backlink type colors to nearest DS chip types. */
const TYPE_CHIP: Record<string, ChipType> = {
  reddit: 'warning',
  medium: 'success',
  forum: 'neutral',
  directory: 'neutral',
  blog: 'neutral',
  community: 'neutral',
}

function scoreTone(score: number): string {
  if (score >= 70) return 'text-brand-token'
  if (score >= 40) return 'text-warning-token'
  return 'text-error-token'
}

/** Pass-count chip color, matching the score tier (readable, never the faint neutral). */
function scoreChipType(score: number): ChipType {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'error'
}

/** Page copy, both languages. Formal "Anda" register; no dashes. */
const COPY = {
  id: {
    title: 'Tools Audit GEO',
    subtitle: 'Periksa seberapa siap website Anda dibaca AI, lalu perbaiki dengan tools di bawah',
    requestFailed: 'Permintaan gagal',
    copy: 'Salin',
    copied: 'Tersalin!',

    geoSection: 'Audit Skor GEO',
    geoDesc:
      'Periksa URL mana pun untuk melihat seberapa siap halaman itu untuk pencarian AI. Anda mendapat skor 0 sampai 100 beserta rekomendasi yang bisa langsung dikerjakan.',
    urlLabel: 'URL halaman',
    auditing: 'Mengaudit...',
    audit: 'Audit Sekarang',
    reaudit: 'Audit Ulang',
    geoScoreAria: (score: number): string => `Skor GEO ${score} dari 100`,
    outOf: 'dari 100',
    scoreCaption: (score: number): string => {
      if (score >= 70) return 'Bagus, halaman ini mudah dipahami AI'
      if (score >= 40) return 'Cukup, halaman ini masih bisa lebih mudah dipahami AI'
      return 'Kurang, AI kesulitan memahami halaman ini'
    },
    checksPassed: (passed: number, total: number): string => `${passed} dari ${total} pemeriksaan lolos`,
    checksHeading: 'Hasil pemeriksaan',
    impactLabels: { high: 'dampak tinggi', medium: 'dampak sedang', low: 'dampak rendah' },
    allPassed: 'Semua pemeriksaan lolos. Pertahankan!',
    copyAllRecs: 'Salin semua rekomendasi',
    copiedToast: 'Tersalin ke clipboard',
    auditDoneToast: (score: number): string => `Audit selesai. Skor ${score} dari 100.`,
    helpLabel: 'Bantuan',
    scoreHelpTitle: 'Apa arti skor ini',
    scoreBands: [
      '70 sampai 100: Bagus. Halaman mudah dipahami AI.',
      '40 sampai 69: Cukup. Masih bisa ditingkatkan.',
      '0 sampai 39: Kurang. AI kesulitan memahami halaman.',
    ],
    scoreWeightNote: 'Pemeriksaan berdampak tinggi memberi bobot skor lebih besar.',

    backlinksSection: 'Target Backlink',
    backlinksDesc:
      'Temukan website tempat brand Anda layak disebut. Publish konten di sana agar brand Anda muncul di lebih banyak tempat yang dibaca AI.',
    findingTargets: 'Mencari target...',
    findTargets: 'Cari Target',
    noTargetsTitle: 'Tidak ada target',
    noTargetsDesc: 'Tidak ada target backlink untuk brand ini.',

    devSection: 'Tools untuk Developer Website Anda',
    devDesc:
      'Dua tools di bawah menghasilkan file dan konfigurasi teknis. Berikan hasilnya kepada developer website Anda untuk dipasang.',
    llmsSection: 'Generator llms.txt',
    llmsDesc:
      'llms.txt adalah file kecil di website Anda yang memberi tahu AI crawler tentang brand Anda. Buat filenya di sini, lalu upload ke root domain Anda.',
    keyFactsLabel: 'Fakta Penting (satu per baris, opsional)',
    keyFactsPlaceholder:
      'Berdiri tahun 2020\nTersedia di Indonesia, Malaysia, Singapura\nLebih dari 50.000 pengguna aktif\nBooking venue olahraga',
    llmsGenerating: 'Membuat...',
    llmsGenerate: 'Generate llms.txt',
    llmsFileName: '/llms.txt',
    llmsOutputHeading: 'Salin isi ini ke file /llms.txt di root domain Anda.',
    llmsDoneToast: 'llms.txt berhasil dibuat',
    nginxSection: 'Config Bot Nginx',
    nginxDesc:
      'Potongan konfigurasi untuk Nginx, software server yang menjalankan website Anda, agar siap melayani bot AI (GPTBot, ClaudeBot, PerplexityBot).',
    domainLabel: 'Domain',
    keyPagesLabel: 'Halaman Penting (satu per baris, opsional)',
    nginxGenerating: 'Membuat...',
    nginxGenerate: 'Generate Config',
    nginxFileName: 'nginx.conf',
    nginxOutputHeading: 'Tempel potongan ini di dalam blok server {} pada konfigurasi Nginx Anda.',
    nginxDoneToast: 'Config Nginx berhasil dibuat',
  },
  en: {
    title: 'GEO Audit Tools',
    subtitle: 'Check how ready your website is for AI, then fix it with the tools below',
    requestFailed: 'Request failed',
    copy: 'Copy',
    copied: 'Copied!',

    geoSection: 'GEO Score Audit',
    geoDesc:
      'Check any URL to see how ready it is for AI search. You get a score from 0 to 100 plus practical recommendations.',
    urlLabel: 'Page URL',
    auditing: 'Auditing...',
    audit: 'Audit Now',
    reaudit: 'Audit Again',
    geoScoreAria: (score: number): string => `GEO score ${score} of 100`,
    outOf: 'of 100',
    scoreCaption: (score: number): string => {
      if (score >= 70) return 'Good, AI can understand this page easily'
      if (score >= 40) return 'Fair, this page could be easier for AI to understand'
      return 'Poor, AI struggles to understand this page'
    },
    checksPassed: (passed: number, total: number): string => `${passed} of ${total} checks passed`,
    checksHeading: 'Check results',
    impactLabels: { high: 'high impact', medium: 'medium impact', low: 'low impact' },
    allPassed: 'All checks passed. Keep it up!',
    copyAllRecs: 'Copy all recommendations',
    copiedToast: 'Copied to clipboard',
    auditDoneToast: (score: number): string => `Audit complete. Score ${score} of 100.`,
    helpLabel: 'Help',
    scoreHelpTitle: 'What this score means',
    scoreBands: [
      '70 to 100: Good. AI understands the page easily.',
      '40 to 69: Fair. Room to improve.',
      '0 to 39: Poor. AI struggles to understand the page.',
    ],
    scoreWeightNote: 'High impact checks contribute more to the score.',

    backlinksSection: 'Backlink Targets',
    backlinksDesc:
      'Find websites worth getting your brand mentioned on. Publish content there so your brand shows up in more places AI reads.',
    findingTargets: 'Finding targets...',
    findTargets: 'Find Targets',
    noTargetsTitle: 'No targets found',
    noTargetsDesc: 'No backlink targets were returned for this brand.',

    devSection: 'Tools for Your Website Developer',
    devDesc:
      'The two tools below generate technical files and configuration. Hand the results to your website developer to install.',
    llmsSection: 'llms.txt Generator',
    llmsDesc:
      'llms.txt is a small file on your website that tells AI crawlers about your brand. Generate it here, then upload it to your domain root.',
    keyFactsLabel: 'Key Facts (one per line, optional)',
    keyFactsPlaceholder:
      'Founded in 2020\nAvailable in Indonesia, Malaysia, Singapore\nOver 50,000 active users\nBooking for sports venues',
    llmsGenerating: 'Generating...',
    llmsGenerate: 'Generate llms.txt',
    llmsFileName: '/llms.txt',
    llmsOutputHeading: 'Copy this into a /llms.txt file at your domain root.',
    llmsDoneToast: 'llms.txt generated',
    nginxSection: 'Nginx Bot Config',
    nginxDesc:
      'A configuration snippet for Nginx, the server software that runs your website, so it serves AI bots (GPTBot, ClaudeBot, PerplexityBot) well.',
    domainLabel: 'Domain',
    keyPagesLabel: 'Key Pages (one per line, optional)',
    nginxGenerating: 'Generating...',
    nginxGenerate: 'Generate Config',
    nginxFileName: 'nginx.conf',
    nginxOutputHeading: 'Paste this inside the server {} block of your Nginx config.',
    nginxDoneToast: 'Nginx config generated',
  },
} as const

/**
 * Generated-output panel, styled like a code editor tab: a filename bar with a
 * copy action, the content, then a one-line "what to do with it" footer.
 */
function ToolOutputCard({
  fileName,
  instruction,
  content,
  copied,
  onCopy,
  maxHeightClass,
}: {
  fileName: string
  instruction: string
  content: string
  copied: boolean
  onCopy: () => void
  maxHeightClass: string
}): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-primary bg-secondary px-4 py-2.5 transition-colors duration-300 ease-standard">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode className="size-4 shrink-0 text-icon-brand" aria-hidden="true" />
          <span className="truncate text-label-medium font-medium text-secondary transition-colors duration-200 ease-standard">
            {fileName}
          </span>
        </div>
        <Button
          type="ghost"
          size="sm"
          iconLeft={copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          onClick={onCopy}
        >
          {copied ? t.copied : t.copy}
        </Button>
      </div>
      {/* font-sans keeps the DS Figtree stack; the DS has no mono font. */}
      <pre
        className={`w-full overflow-auto whitespace-pre-wrap p-4 font-sans text-paragraph-medium text-secondary transition-colors duration-200 ease-standard ${maxHeightClass}`}
      >
        {content}
      </pre>
      <div className="border-t border-neutral-primary px-4 py-3 transition-colors duration-300 ease-standard">
        <p className="text-label-medium text-tertiary transition-colors duration-200 ease-standard">{instruction}</p>
      </div>
    </Card>
  )
}

export default function ToolsPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const toast = useToast()
  const prefersReducedMotion = useReducedMotion()

  // geo score (hero)
  const [auditUrl, setAuditUrl] = useState<string>('')
  const [geoResult, setGeoResult] = useState<GEOResult | null>(null)
  const [geoLoading, setGeoLoading] = useState<boolean>(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  // Animated count-up of the score number + ring sweep (synchronized).
  const [displayScore, setDisplayScore] = useState<number>(0)
  const [ringProgress, setRingProgress] = useState<number>(0)

  // backlinks
  const [backlinks, setBacklinks] = useState<BacklinkTarget[]>([])
  const [backlinksLoading, setBacklinksLoading] = useState<boolean>(false)
  const [backlinksLoaded, setBacklinksLoaded] = useState<boolean>(false)
  const [backlinksError, setBacklinksError] = useState<string | null>(null)

  // llms.txt
  const [keyFacts, setKeyFacts] = useState<string>('')
  const [llmsContent, setLlmsContent] = useState<string>('')
  const [llmsLoading, setLlmsLoading] = useState<boolean>(false)
  const [llmsError, setLlmsError] = useState<string | null>(null)

  // nginx
  const [domain, setDomain] = useState<string>('')
  const [pages, setPages] = useState<string>('')
  const [nginxContent, setNginxContent] = useState<string>('')
  const [nginxLoading, setNginxLoading] = useState<boolean>(false)
  const [nginxError, setNginxError] = useState<string | null>(null)

  const [copiedKey, setCopiedKey] = useState<'llms' | 'nginx' | null>(null)

  // Pre-fill the audit URL (and the nginx domain) from the brand website.
  useEffect(() => {
    let cancelled = false
    apiFetch<{ website?: string }>(`/brands/${id}`)
      .then((brand) => {
        if (cancelled || !brand?.website) return
        setAuditUrl((current) => (current === '' ? brand.website ?? '' : current))
        setDomain((current) =>
          current === ''
            ? (brand.website ?? '').replace(/^https?:\/\//, '').replace(/\/.*$/, '')
            : current,
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Animate the score number (0 -> N) and the ring sweep together over the same
  // duration (DURATION.long, ease-standard). Reduced motion snaps to the final
  // value. The ring's own CSS transition handles the stroke sweep once
  // ringProgress goes 0 -> N on the next frame.
  useEffect(() => {
    if (geoResult == null) {
      setDisplayScore(0)
      setRingProgress(0)
      return
    }
    const target = geoResult.score
    if (prefersReducedMotion) {
      setDisplayScore(target)
      setRingProgress(target)
      return
    }
    setRingProgress(0)
    const raf = requestAnimationFrame(() => setRingProgress(target))
    const controls = animate(0, target, {
      duration: DURATION.long,
      ease: EASE_STANDARD,
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    })
    return () => {
      cancelAnimationFrame(raf)
      controls.stop()
    }
  }, [geoResult, prefersReducedMotion])

  function errorMessage(e: unknown): string {
    return e instanceof Error ? e.message : t.requestFailed
  }

  function handleCopy(key: 'llms' | 'nginx', content: string): void {
    void navigator.clipboard.writeText(content)
    setCopiedKey(key)
    toast.success(t.copiedToast)
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current))
    }, 2000)
  }

  /** Copy every failed check's recommendation (translated) as one block. */
  function copyRecommendations(): void {
    if (geoResult == null) return
    const failed = geoResult.checks.filter((c) => !c.passed)
    if (failed.length === 0) return
    const text = failed
      .map((c) => {
        const tr = translateCheck(c, lang)
        return `- [${t.impactLabels[c.impact]}] ${tr.label}: ${tr.recommendation}`
      })
      .join('\n')
    void navigator.clipboard.writeText(text)
    toast.success(t.copiedToast)
  }

  async function handleGeoScore(): Promise<void> {
    setGeoLoading(true)
    setGeoError(null)
    setGeoResult(null)
    try {
      const result = await apiFetch<GEOResult>(`/brands/${id}/articles/tools/geo-score`, {
        method: 'POST',
        body: JSON.stringify({ url: auditUrl }),
      })
      setGeoResult(result)
      toast.success(t.auditDoneToast(result.score))
    } catch (e) {
      setGeoError(errorMessage(e))
    } finally {
      setGeoLoading(false)
    }
  }

  async function handleBacklinks(): Promise<void> {
    setBacklinksLoading(true)
    setBacklinksError(null)
    try {
      const { targets } = await apiFetch<{ targets: BacklinkTarget[] }>(
        `/brands/${id}/articles/tools/backlinks`,
      )
      setBacklinks(targets)
      setBacklinksLoaded(true)
    } catch (e) {
      setBacklinksError(errorMessage(e))
    } finally {
      setBacklinksLoading(false)
    }
  }

  async function handleLlmsTxt(): Promise<void> {
    setLlmsLoading(true)
    setLlmsError(null)
    try {
      const facts = keyFacts.split('\n').map((f) => f.trim()).filter(Boolean)
      const { content } = await apiFetch<{ content: string }>(
        `/brands/${id}/articles/tools/llms-txt`,
        { method: 'POST', body: JSON.stringify({ keyFacts: facts }) },
      )
      setLlmsContent(content)
      toast.success(t.llmsDoneToast)
    } catch (e) {
      setLlmsError(errorMessage(e))
    } finally {
      setLlmsLoading(false)
    }
  }

  async function handleNginx(): Promise<void> {
    setNginxLoading(true)
    setNginxError(null)
    try {
      const pageList = pages.split('\n').map((p) => p.trim()).filter(Boolean)
      const { content } = await apiFetch<{ content: string }>(
        `/brands/${id}/articles/tools/nginx-config`,
        { method: 'POST', body: JSON.stringify({ domain, pages: pageList }) },
      )
      setNginxContent(content)
      toast.success(t.nginxDoneToast)
    } catch (e) {
      setNginxError(errorMessage(e))
    } finally {
      setNginxLoading(false)
    }
  }

  const sortedChecks =
    geoResult != null ? [...geoResult.checks].sort((a, b) => Number(a.passed) - Number(b.passed)) : []
  const passedCount = geoResult != null ? geoResult.checks.filter((c) => c.passed).length : 0

  return (
    <PageContainer wide className="!gap-10">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {/* ── HERO: GEO Score Audit ─────────────────────────────────────── */}
      <Section title={t.geoSection}>
        <Card variant="brand" className="flex flex-col gap-6 p-6 lg:p-8">
          <div className="grid w-full items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-4">
              <p className="max-w-[560px] text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
                {t.geoDesc}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Input
                  label={t.urlLabel}
                  type="url"
                  className="min-w-0 flex-1"
                  value={auditUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAuditUrl(e.target.value)}
                  placeholder="https://yourdomain.com"
                />
                <Button
                  size="md"
                  onClick={handleGeoScore}
                  disabled={geoLoading || auditUrl === ''}
                  className="shrink-0"
                >
                  {geoLoading ? t.auditing : geoResult != null ? t.reaudit : t.audit}
                </Button>
              </div>
            </div>

            {/* Score zone: ring with the number centered inside. */}
            <div className="flex items-center justify-center lg:min-w-[200px]">
              {geoLoading ? (
                <Skeleton className="size-[140px] !rounded-circle" />
              ) : geoResult != null ? (
                <div className="relative flex items-center justify-center">
                  <ProgressRing
                    progress={ringProgress}
                    size={140}
                    stroke={10}
                    aria-label={t.geoScoreAria(geoResult.score)}
                  />
                  <span className="absolute flex flex-col items-center">
                    <span className={`text-h2 font-semibold tabular-nums ${scoreTone(geoResult.score)}`}>
                      {displayScore}
                    </span>
                    <span className="text-label-medium font-medium text-tertiary">{t.outOf}</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {geoResult != null && !geoLoading && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label-big font-medium text-primary transition-colors duration-200 ease-standard">
                {t.scoreCaption(geoResult.score)}
              </span>
              <Popover
                label={t.helpLabel}
                content={
                  <>
                    <span className="text-label-medium font-medium text-primary">{t.scoreHelpTitle}</span>
                    {t.scoreBands.map((band) => (
                      <span key={band} className="text-paragraph-medium text-secondary">
                        {band}
                      </span>
                    ))}
                    <span className="text-paragraph-medium text-tertiary">{t.scoreWeightNote}</span>
                  </>
                }
              >
                <QuestionIcon className="size-4" />
              </Popover>
              <Chip size="sm" type={scoreChipType(geoResult.score)} className="ml-1">
                {t.checksPassed(passedCount, geoResult.checks.length)}
              </Chip>
            </div>
          )}
        </Card>

        {geoError != null && <ErrorBanner message={geoError} />}

        {geoResult != null && !geoLoading && (
          <Card className="flex flex-col divide-y divide-neutral-primary">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <h3 className="text-label-medium font-medium text-tertiary transition-colors duration-200 ease-standard">
                {t.checksHeading}
              </h3>
              {passedCount < geoResult.checks.length && (
                <Button type="ghost" size="sm" onClick={copyRecommendations}>
                  {t.copyAllRecs}
                </Button>
              )}
            </div>
            {passedCount === geoResult.checks.length && (
              <div className="flex items-center gap-2 px-5 py-4 text-paragraph-medium font-medium text-brand-token">
                <CheckCircleIcon className="size-5" />
                {t.allPassed}
              </div>
            )}
            {sortedChecks.map((check) => {
              const tr = translateCheck(check, lang)
              return (
                <div key={check.label} className="flex flex-col gap-1 px-5 py-4">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {/* Long audit labels must wrap; relax the DS row's nowrap. */}
                    <ValidationCheck checked={check.passed} className="min-w-0 [&>span]:whitespace-normal">
                      {tr.label}
                    </ValidationCheck>
                    {!check.passed && (
                      <Chip size="sm" type={IMPACT_CHIP[check.impact]}>
                        {t.impactLabels[check.impact]}
                      </Chip>
                    )}
                  </div>
                  {!check.passed && (
                    <p className="pl-7 text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
                      {tr.recommendation}
                    </p>
                  )}
                </div>
              )
            })}
          </Card>
        )}
      </Section>

      {/* ── Backlink Targets ──────────────────────────────────────────── */}
      <Section title={t.backlinksSection}>
        <Card className="flex flex-col gap-4 p-5">
          <p className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
            {t.backlinksDesc}
          </p>
          {!backlinksLoaded && (
            <div>
              <Button onClick={handleBacklinks} disabled={backlinksLoading}>
                {backlinksLoading ? t.findingTargets : t.findTargets}
              </Button>
            </div>
          )}
        </Card>
        {backlinksError != null && <ErrorBanner message={backlinksError} />}
        {backlinksLoading && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {!backlinksLoading && backlinksLoaded && backlinks.length === 0 && (
          <EmptyState title={t.noTargetsTitle} description={t.noTargetsDesc} />
        )}
        {!backlinksLoading && backlinks.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
            {backlinks.map((target, i) => (
              <Card key={`${target.platform}-${i}`} className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={target.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-label-medium font-medium text-brand-token underline-offset-2 transition-colors duration-200 ease-standard hover:underline"
                  >
                    {target.platform}
                  </a>
                  <Chip size="sm" type={TYPE_CHIP[target.type] ?? 'neutral'}>
                    {target.type}
                  </Chip>
                </div>
                <p className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
                  {target.relevance}
                </p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* ── Secondary: generators for the website developer ───────────── */}
      <Section title={t.devSection}>
        <p className="text-paragraph-medium text-tertiary transition-colors duration-200 ease-standard">
          {t.devDesc}
        </p>
        <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* llms.txt */}
          <div className="flex flex-col gap-3">
            <Card className="flex flex-col gap-5 p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand transition-colors duration-300 ease-standard">
                  <FileText className="size-6" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-label-big font-medium text-primary transition-colors duration-200 ease-standard">
                      {t.llmsSection}
                    </h3>
                    <span className="rounded-token-4 bg-display-brand px-2 py-0.5 text-label-medium font-medium text-brand-token transition-colors duration-300 ease-standard">
                      /llms.txt
                    </span>
                  </div>
                  <p className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
                    {t.llmsDesc}
                  </p>
                </div>
              </div>
              <div className="border-t border-neutral-primary transition-colors duration-300 ease-standard" />
              <TextBox
                label={t.keyFactsLabel}
                className="!w-full"
                value={keyFacts}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setKeyFacts(e.target.value)}
                placeholder={t.keyFactsPlaceholder}
              />
              <div>
                <Button type="primary-outlined" onClick={handleLlmsTxt} disabled={llmsLoading}>
                  {llmsLoading ? t.llmsGenerating : t.llmsGenerate}
                </Button>
              </div>
            </Card>
            {llmsError != null && <ErrorBanner message={llmsError} />}
            {llmsLoading && <Skeleton className="h-40 w-full" />}
            {!llmsLoading && llmsContent !== '' && (
              <ToolOutputCard
                fileName={t.llmsFileName}
                instruction={t.llmsOutputHeading}
                content={llmsContent}
                copied={copiedKey === 'llms'}
                onCopy={() => handleCopy('llms', llmsContent)}
                maxHeightClass="max-h-80"
              />
            )}
          </div>

          {/* nginx */}
          <div className="flex flex-col gap-3">
            <Card className="flex flex-col gap-5 p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand transition-colors duration-300 ease-standard">
                  <GearSix className="size-6" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-label-big font-medium text-primary transition-colors duration-200 ease-standard">
                      {t.nginxSection}
                    </h3>
                    <span className="rounded-token-4 bg-display-brand px-2 py-0.5 text-label-medium font-medium text-brand-token transition-colors duration-300 ease-standard">
                      nginx.conf
                    </span>
                  </div>
                  <p className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard">
                    {t.nginxDesc}
                  </p>
                </div>
              </div>
              <div className="border-t border-neutral-primary transition-colors duration-300 ease-standard" />
              <Input
                label={t.domainLabel}
                type="text"
                value={domain}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
              />
              <TextBox
                label={t.keyPagesLabel}
                className="!w-full"
                value={pages}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPages(e.target.value)}
                placeholder={'/\n/about\n/features\n/pricing'}
              />
              <div>
                <Button type="primary-outlined" onClick={handleNginx} disabled={nginxLoading || domain === ''}>
                  {nginxLoading ? t.nginxGenerating : t.nginxGenerate}
                </Button>
              </div>
            </Card>
            {nginxError != null && <ErrorBanner message={nginxError} />}
            {nginxLoading && <Skeleton className="h-40 w-full" />}
            {!nginxLoading && nginxContent !== '' && (
              <ToolOutputCard
                fileName={t.nginxFileName}
                instruction={t.nginxOutputHeading}
                content={nginxContent}
                copied={copiedKey === 'nginx'}
                onCopy={() => handleCopy('nginx', nginxContent)}
                maxHeightClass="max-h-96"
              />
            )}
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
