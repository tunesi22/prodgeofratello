'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useApiFetch } from '@/lib/useApiFetch'
import { ONBOARDING_COPY } from '@/lib/onboarding-copy'
import { fadeUp, staggerContainer, transitionEnter } from '@/lib/motion'
import { LoadingScreen } from '@/components/onboarding/LoadingScreen'
import { BrandNameStep } from '@/components/onboarding/steps/BrandNameStep'
import { WebsiteStep } from '@/components/onboarding/steps/WebsiteStep'
import { IndustryStep } from '@/components/onboarding/steps/IndustryStep'
import { CompetitorsStep } from '@/components/onboarding/steps/CompetitorsStep'
import type { Competitor } from '@/components/onboarding/steps/CompetitorsStep'
import { CheckCircleIcon, InfoIcon } from '@/components/onboarding/icons'
import { NewProjectHeader } from './NewProjectHeader'

/**
 * /brands/new, "New project" creation flow.
 *
 * A full-screen takeover that reuses the onboarding stepper experience (same
 * steps, same motion, same DS components) for adding a brand from inside the
 * app. Order matches onboarding so every step component is reused unmodified:
 *   1 brand name → 2 website → (analyze) → 3 industry → 4 competitors.
 *
 * After the website step we call POST /api/brands/analyze (mocked today, see
 * `app/api/brands/analyze/route.ts` + `catatan backend.md`) to crawl the site
 * and pre-fill industry + competitors, and to surface whether our engine can
 * read the site at all. Everything detected stays editable.
 */

// 1 brand name, 2 website, 3 industry, 4 competitors. Analyzing/finishing are
// the loading interstitials between steps.
type Step = 1 | 2 | 3 | 4 | 'analyzing' | 'finishing'

/** Minimum time each loading interstitial stays up, so it never flickers. */
const ANALYZING_MS = 2000
const FINISHING_MIN_MS = 1800

interface AnalyzeResult {
  crawlable: boolean
  brandName: string
  industry: string
  competitors: Competitor[]
  summary: string
}

/** Crawl status carried into the review steps to reassure / warn the user. */
interface CrawlStatus {
  crawlable: boolean
  host: string
}

/** New-project-only copy. Step content reuses ONBOARDING_COPY. */
const COPY = {
  id: {
    cancel: 'Batal',
    crawlOk: (host: string): string =>
      `Kami berhasil membaca ${host}. Industri dan kompetitor di bawah kami isi otomatis, silakan ubah bila perlu.`,
    crawlWarn: (host: string): string =>
      `Kami belum bisa membaca ${host} sepenuhnya. Isi detailnya manual, dan pastikan website dapat diakses publik agar engine kami bisa memantaunya.`,
  },
  en: {
    cancel: 'Cancel',
    crawlOk: (host: string): string =>
      `We read ${host}. The industry and competitors below are pre-filled, edit anything that looks off.`,
    crawlWarn: (host: string): string =>
      `We could not fully read ${host}. Fill in the details manually, and make sure the site is publicly accessible so our engine can track it.`,
  },
} as const

/** Prepend https:// when the user typed a bare domain. */
function normalizeWebsite(value: string): string {
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function hostOf(website: string): string {
  try {
    return new URL(normalizeWebsite(website)).hostname.replace(/^www\./, '')
  } catch {
    return website.trim()
  }
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

export function NewProjectFlow(): ReactElement {
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const copy = ONBOARDING_COPY[lang]
  const t = COPY[lang]

  const [step, setStep] = useState<Step>(1)
  const [brandName, setBrandName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [detectedIndustry, setDetectedIndustry] = useState('')
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [crawl, setCrawl] = useState<CrawlStatus | null>(null)
  const [flowError, setFlowError] = useState<string | undefined>(undefined)
  const submitting = useRef(false)

  function cancel(): void {
    router.push('/brands')
  }

  async function createBrand(): Promise<void> {
    if (submitting.current) return
    submitting.current = true
    setFlowError(undefined)
    try {
      const [brand] = await Promise.all([
        apiFetch<{ _id: string }>('/brands', {
          method: 'POST',
          body: JSON.stringify({
            name: brandName.trim(),
            website: normalizeWebsite(website),
            industry: industry.trim(),
            // Backend Brand.competitors is string[] today, so we send names
            // only. The richer {domain, includeSubdomains} awaits the schema
            // upgrade documented in `catatan backend.md`.
            competitors: competitors.map((c) => c.name.trim()).filter(Boolean),
          }),
        }),
        delay(FINISHING_MIN_MS),
      ])
      router.push(`/brands/${brand._id}`)
    } catch (err) {
      setFlowError(err instanceof Error ? err.message : copy.errors.createFailed)
      setStep(4) // back to competitors to retry
    } finally {
      submitting.current = false
    }
  }

  // Drive the loading interstitials.
  useEffect(() => {
    if (step === 'analyzing') {
      let cancelled = false
      const start = Date.now()

      void (async () => {
        try {
          const data = await apiFetch<AnalyzeResult>('/brands/analyze', {
            method: 'POST',
            body: JSON.stringify({ website: normalizeWebsite(website), brandName: brandName.trim() }),
          })
          if (!cancelled) {
            setCrawl({ crawlable: data.crawlable, host: hostOf(website) })
            if (typeof data.industry === 'string' && data.industry.trim() !== '') {
              setDetectedIndustry(data.industry.trim())
              setIndustry(data.industry.trim())
            }
            if (Array.isArray(data.competitors)) {
              setCompetitors(data.competitors.filter((c) => c.name?.trim()))
            }
          }
        } catch {
          // Network/parse failure → treat as "could not read", user fills manually.
          if (!cancelled) setCrawl({ crawlable: false, host: hostOf(website) })
        }
        if (!cancelled) {
          const remaining = Math.max(0, ANALYZING_MS - (Date.now() - start))
          setTimeout(() => setStep(3), remaining)
        }
      })()

      return () => {
        cancelled = true
      }
    }
    if (step === 'finishing') {
      void createBrand()
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const isLoading = step === 'analyzing' || step === 'finishing'
  const headerStep = typeof step === 'number' ? step : step === 'analyzing' ? 2 : 4
  const showCrawlNotice = (step === 3 || step === 4) && crawl !== null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-green transition-colors duration-300 ease-standard">
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen
              key={step}
              message={step === 'analyzing' ? copy.loading.analyzing : copy.loading.almostThere}
            />
          ) : (
            <motion.div
              key="chrome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: transitionEnter() }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="flex min-h-screen flex-col"
            >
              <NewProjectHeader
                step={headerStep}
                cancelLabel={t.cancel}
                onCancel={cancel}
                onStepClick={(target) => setStep(target as Step)}
              />

              {showCrawlNotice && crawl !== null && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex justify-center px-20 pt-6"
                >
                  <div className="flex max-w-[756px] items-center gap-2 rounded-token-8 border border-neutral-primary bg-card px-4 py-2 transition-colors duration-300 ease-standard">
                    {crawl.crawlable ? (
                      <CheckCircleIcon className="size-5 shrink-0 text-icon-brand" />
                    ) : (
                      <InfoIcon className="size-5 shrink-0 text-warning-token" />
                    )}
                    <span className="text-paragraph-medium text-secondary">
                      {crawl.crawlable ? t.crawlOk(crawl.host) : t.crawlWarn(crawl.host)}
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="flex w-full flex-1 overflow-y-auto px-20 py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={String(step)}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={staggerContainer}
                    className="flex w-full flex-1 flex-col"
                  >
                    {step === 1 && (
                      <BrandNameStep
                        copy={copy}
                        value={brandName}
                        onChange={setBrandName}
                        onNext={() => setStep(2)}
                      />
                    )}
                    {step === 2 && (
                      <WebsiteStep
                        copy={copy}
                        value={website}
                        onChange={setWebsite}
                        onNext={() => setStep('analyzing')}
                        onBack={() => setStep(1)}
                      />
                    )}
                    {step === 3 && (
                      <IndustryStep
                        copy={copy}
                        selected={industry}
                        detectedIndustry={detectedIndustry}
                        onSelect={setIndustry}
                        onNext={() => setStep(4)}
                        onBack={() => setStep(2)}
                      />
                    )}
                    {step === 4 && (
                      <CompetitorsStep
                        copy={copy}
                        competitors={competitors}
                        onChange={setCompetitors}
                        onFinish={() => setStep('finishing')}
                        onBack={() => setStep(3)}
                        error={flowError}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  )
}
