'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ONBOARDING_COPY } from '@/lib/onboarding-copy'
import { staggerContainer, transitionEnter } from '@/lib/motion'
import { OnboardingHeader } from './OnboardingHeader'
import { FooterToggles } from './FooterToggles'
import { LoadingScreen } from './LoadingScreen'
import { WelcomeStep } from './steps/WelcomeStep'
import { BrandNameStep } from './steps/BrandNameStep'
import { WebsiteStep } from './steps/WebsiteStep'
import { IndustryStep } from './steps/IndustryStep'
import { CompetitorsStep } from './steps/CompetitorsStep'
import type { Competitor } from './steps/CompetitorsStep'

type Step = 'welcome' | 1 | 2 | 3 | 4 | 'analyzing' | 'finishing'

/** How long each loading interstitial shows at minimum. */
const ANALYZING_MS = 2200
const FINISHING_MIN_MS = 1900

/**
 * Competitors pre-filled from "analysis". This is mocked client-side, there is
 * no real website-analysis backend yet (see docs/README-BACKEND.md). The richer
 * shape (domain + includeSubdomains) is collected in the UI but only the names
 * are persisted, since the Brand.competitors schema is still string[].
 */
const SUGGESTED_COMPETITORS: Competitor[] = [
  { name: 'Unilever', domain: 'unilever.com', includeSubdomains: true },
  { name: 'Maju Bersama', domain: 'majubersama.co.id', includeSubdomains: false },
  { name: 'Mayora', domain: 'mayora.com', includeSubdomains: false },
]

/** Prepend https:// when the user typed a bare domain. */
function normalizeWebsite(value: string): string {
  const trimmed = value.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

export function OnboardingFlow(): ReactElement {
  const router = useRouter()
  const { lang } = useLanguage()
  const copy = ONBOARDING_COPY[lang]

  const [step, setStep] = useState<Step>('welcome')
  const [brandName, setBrandName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [detectedIndustry, setDetectedIndustry] = useState('')
  const [competitors, setCompetitors] = useState<Competitor[]>(SUGGESTED_COMPETITORS)
  const [flowError, setFlowError] = useState<string | undefined>(undefined)
  const submitting = useRef(false)

  async function createBrand(): Promise<void> {
    if (submitting.current) return
    submitting.current = true
    setFlowError(undefined)
    try {
      const [res] = await Promise.all([
        fetch('/api/brands', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: brandName.trim(),
            website: normalizeWebsite(website),
            industry,
            // Backend Brand.competitors is string[] today, so we send names only.
            // The richer {domain, includeSubdomains} captured in the UI awaits a
            // schema change, see docs/README-BACKEND.md.
            competitors: competitors.map((c) => c.name.trim()).filter(Boolean),
          }),
        }),
        delay(FINISHING_MIN_MS),
      ])
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(typeof data.error === 'string' ? data.error : copy.errors.createFailed)
      }
      router.push('/brands')
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
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8000)
          const res = await fetch('/api/brands/detect-industry', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ website: normalizeWebsite(website) }),
            signal: controller.signal,
          })
          clearTimeout(timeout)
          if (!cancelled && res.ok) {
            const data = await res.json()
            if (typeof data.industry === 'string' && data.industry.trim()) {
              const detected = data.industry.trim()
              setDetectedIndustry(detected)
              setIndustry(detected)
            }
          }
        } catch {
          // fail silently — user picks manually on next step
        }
        if (!cancelled) {
          const elapsed = Date.now() - start
          const remaining = Math.max(0, ANALYZING_MS - elapsed)
          setTimeout(() => setStep(3), remaining)
        }
      })()

      return () => { cancelled = true }
    }
    if (step === 'finishing') {
      void createBrand()
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const isLoading = step === 'analyzing' || step === 'finishing'
  const headerStep = typeof step === 'number' ? step : null

  return (
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
            className="flex min-h-screen flex-col bg-brand-green transition-colors duration-300 ease-standard"
          >
            <OnboardingHeader step={headerStep} onStepClick={(target) => setStep(target as Step)} />

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
                  {step === 'welcome' && <WelcomeStep copy={copy} onStart={() => setStep(1)} />}
                  {step === 1 && (
                    <BrandNameStep copy={copy} value={brandName} onChange={setBrandName} onNext={() => setStep(2)} />
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

            <footer className="flex justify-center px-20 pb-10">
              <FooterToggles />
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
