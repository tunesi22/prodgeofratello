'use client'

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle, CircleNotch, LockSimple, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { Container, Section, HERO_BG } from '@/components/marketing/ui'
import { BookDemoButton } from '@/components/marketing/DemoModal'
import { Glow } from '@/components/marketing/visuals'
import { Reveal } from '@/components/marketing/interactive'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { cn } from '@/lib/cn'

// The three.js scene only loads once a result exists, so the marketing bundle
// stays lean and the page works without WebGL until it is actually needed.
const StoreScene = dynamic(() => import('./StoreScene').then((m) => m.StoreScene), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-white/20" aria-hidden="true" />,
})

// SSR-safe layout effect: runs before paint on the client (so the GSAP reveal
// never flashes an un-styled frame) and is a no-op during SSR.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// The public endpoint reveals the headline `score` (the store visualizes it),
// but never the per-check fix list — that stays gated (see app/api/audit/route.ts).
interface AuditResult {
  domain: string
  brandName: string
  score: number
}

// Teaser rows for the locked reason cards: GENERIC check names from the public
// marketing copy (what we audit), NOT this site's actual results — those never
// reach the client. Blur increases top-to-bottom so the first line is readable
// and curiosity does the rest. Per-row blur px + opacity:
const TEASE_STEPS = [
  { blur: 1.5, opacity: 0.9 },
  { blur: 3.5, opacity: 0.7 },
  { blur: 6, opacity: 0.5 },
]
const FIX_KEYS = ['ai-crawlers', 'direct-answers', 'llms-txt'] as const
const PASS_KEYS = ['crawlable', 'org-schema', 'headings'] as const

/** Animated 0 → score counter for the big revealed number. */
function ScoreNumber({ score, animate }: { score: number; animate: boolean }): ReactElement {
  const [shown, setShown] = useState(animate ? 0 : score)
  useEffect(() => {
    if (!animate) {
      setShown(score)
      return
    }
    let frame = 0
    const start = performance.now()
    const duration = 1400
    const tick = (now: number): void => {
      const k = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - k, 3)
      setShown(Math.round(eased * score))
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [score, animate])
  return <span className="tabular-nums">{shown}</span>
}

export function AuditGeoPage(): ReactElement {
  const { lang } = useMarketingLang()
  const t = MARKETING_COPY[lang].audit
  const reduce = useReducedMotion()

  const [website, setWebsite] = useState('')
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AuditResult | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Advance the analyzing steps on a timer while the request runs.
  useEffect(() => {
    if (phase !== 'running') return
    setStep(0)
    const iv = setInterval(() => {
      setStep((s) => Math.min(s + 1, t.analyzing.length - 1))
    }, 750)
    return () => clearInterval(iv)
  }, [phase, t.analyzing.length])

  useEffect(() => {
    if (phase === 'done' && resultsRef.current != null) {
      resultsRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }, [phase, reduce])

  // GSAP staggered reveal for the insight cards (store, score, reason cards).
  // Runs once the results mount; scoped + reverted so it never leaks styles.
  useIsoLayoutEffect(() => {
    if (phase !== 'done' || result == null || reduce) return
    const scope = resultsRef.current
    if (scope == null) return
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 34,
        scale: 0.985,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.14,
        clearProps: 'opacity,transform',
      })
    }, scope)
    return () => ctx.revert()
  }, [phase, result, reduce])

  async function run(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (phase === 'running') return
    const value = website.trim()
    if (value === '' || !value.includes('.')) {
      setError(t.invalid)
      return
    }
    setError('')
    setPhase('running')
    const startedAt = Date.now()
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: value }),
      })
      if (!res.ok) {
        setError(res.status === 400 ? t.invalid : t.failed)
        setPhase('idle')
        return
      }
      const data = (await res.json()) as AuditResult
      // Let the analyzing choreography finish so the reveal feels earned.
      const minShow = t.analyzing.length * 750 + 300
      const elapsed = Date.now() - startedAt
      if (elapsed < minShow) await new Promise((r) => setTimeout(r, minShow - elapsed))
      setResult(data)
      setPhase('done')
    } catch {
      setError(t.failed)
      setPhase('idle')
    }
  }

  const bandText = result == null ? '' : result.score >= 70 ? t.bands.high : result.score >= 40 ? t.bands.mid : t.bands.low

  return (
    <>
      {/* Dark hero with the audit form — full-height, like the home hero. */}
      <section className="relative w-full overflow-hidden" style={{ background: HERO_BG }}>
        <Container className="relative z-10 flex min-h-screen flex-col items-center justify-center pb-28 pt-32 text-center">
          <h1 className="max-w-3xl text-h2 font-semibold text-white-remain sm:text-h1">
            {t.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-h4 font-normal leading-relaxed text-brand-100">{t.lead}</p>

          {/* One white capsule with the submit button embedded on the right —
              reads as a single, product-grade control instead of two pills. */}
          <form onSubmit={(e) => void run(e)} noValidate className="mt-9 w-full max-w-xl">
            <label className="sr-only" htmlFor="audit-website">
              Website
            </label>
            <div
              className={cn(
                'flex items-center gap-2 rounded-full border bg-white p-1.5 pl-5 shadow-regular-lg transition-all duration-200 ease-standard',
                error !== ''
                  ? 'border-[#e5484d] ring-4 ring-[#e5484d]/25'
                  : 'border-white/40 focus-within:ring-4 focus-within:ring-white/25',
              )}
            >
              <MagnifyingGlass className="size-5 shrink-0 text-neutral-500" aria-hidden="true" />
              <input
                id="audit-website"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder={t.placeholder}
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value)
                  setError('')
                }}
                aria-invalid={error !== ''}
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-primary caret-brand-600 placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={phase === 'running'}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-[15px] font-semibold text-white-remain transition-colors duration-200 ease-standard hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-80 sm:px-6"
              >
                {phase === 'running' && <CircleNotch className="size-5 animate-spin" aria-hidden="true" />}
                {t.submit}
              </button>
            </div>
          </form>
          <AnimatePresence>
            {error !== '' && (
              <motion.div
                role="alert"
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#ff9a8a]/25 bg-[#4a1512]/50 px-4 py-2 text-label-medium font-medium text-[#ffd0c8] backdrop-blur-sm"
              >
                <WarningCircle className="size-4 shrink-0 text-[#ff9a8a]" weight="fill" aria-hidden="true" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyzing choreography: a self-contained glass panel with FIXED
              colors (plain white/green, no theme tokens), so it can never
              flash dark text no matter what theme or autofill state the
              browser is in. */}
          <AnimatePresence>
            {phase === 'running' && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
                className="mt-10 w-full max-w-md rounded-token-24 border border-white/15 bg-[#02120b]/65 p-6 text-left backdrop-blur-md"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold text-white">{website.trim()}</span>
                  <CircleNotch className="size-5 shrink-0 animate-spin text-[#7fd4a8]" aria-hidden="true" />
                </div>
                <ul className="flex flex-col gap-2.5">
                  {t.analyzing.map((label, i) => (
                    <li
                      key={label}
                      className={cn(
                        'flex items-center gap-2.5 text-[15px] transition-colors duration-300 ease-standard',
                        i < step ? 'text-white/55' : i === step ? 'text-white' : 'text-white/30',
                      )}
                    >
                      {i < step ? (
                        <CheckCircle className="size-5 shrink-0 text-[#7fd4a8]" weight="fill" aria-hidden="true" />
                      ) : i === step ? (
                        <CircleNotch className="size-5 shrink-0 animate-spin text-white/80" aria-hidden="true" />
                      ) : (
                        <span className="mx-0.5 size-4 shrink-0 rounded-full border border-white/25" aria-hidden="true" />
                      )}
                      {label}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#7fd4a8] transition-[width] duration-500 ease-standard"
                    style={{ width: `${Math.round(((step + 1) / t.analyzing.length) * 92)}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* Results */}
      {result != null && phase === 'done' && (
        <div ref={resultsRef} className="scroll-mt-24 bg-brand-10">
          <Section>
            <Container>
              <div className="grid items-stretch gap-6 lg:grid-cols-12">
                {/* The store — neutral studio backdrop on the light canvas. */}
                <div data-reveal className="lg:col-span-7">
                  <div
                    className="relative h-[340px] overflow-hidden rounded-token-24 border border-neutral-primary shadow-regular-lg sm:h-[420px] lg:h-full lg:min-h-[460px]"
                    style={{ background: 'radial-gradient(90% 80% at 50% 20%, #f2f4f5 0%, #e4e8ea 55%, #d3d9dd 100%)' }}
                  >
                    <StoreScene score={result.score} animate={!reduce} />
                    <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#02120b]/70 px-3.5 py-1.5 text-label-medium font-semibold text-white-remain backdrop-blur-sm">
                      {result.domain}
                    </span>
                  </div>
                </div>

                {/* The score — REVEALED. White card with a soft brand halo. */}
                <div data-reveal className="lg:col-span-5">
                  <div className="relative flex h-full flex-col gap-5 overflow-hidden rounded-token-24 border border-neutral-primary bg-card p-7 shadow-regular-lg lg:p-8">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-display-brand opacity-60 blur-3xl"
                    />
                    <span className="relative text-label-big font-semibold text-neutral-500">{t.scoreTitle}</span>
                    <div className="relative flex items-baseline gap-3">
                      <span
                        className={cn(
                          'text-[72px] font-semibold leading-none tracking-tight lg:text-[88px]',
                          result.score >= 70 ? 'text-brand-token' : result.score >= 40 ? 'text-warning-token' : 'text-error-token',
                        )}
                      >
                        <ScoreNumber score={result.score} animate={!reduce} />
                      </span>
                      <span className="text-paragraph-big text-neutral-500">{t.scoreOf}</span>
                    </div>
                    <p className="relative text-paragraph-big leading-relaxed text-primary">{bandText}</p>
                    <p className="relative text-paragraph-medium leading-relaxed text-neutral-500">{t.storeHint}</p>
                    <div className="relative mt-auto flex flex-col gap-4 border-t border-neutral-primary pt-5">
                      <p className="text-label-medium leading-relaxed text-neutral-500">{t.disclaimer}</p>
                      <BookDemoButton variant="primary" size="lg" withIcon className="w-full">
                        {t.contactCta}
                      </BookDemoButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons — LOCKED. Teaser rows show generic check names (public
                  copy, not this site's results) with blur increasing downward;
                  the real findings are never sent to the client. */}
              <div className="mt-6 grid items-stretch gap-6 lg:grid-cols-2">
                <div data-reveal>
                  <LockedReasonCard
                    title={t.fixTitle}
                    rows={FIX_KEYS.map((k) => t.checks[k])}
                    tone="fix"
                    note={t.locked.title}
                  />
                </div>
                <div data-reveal>
                  <LockedReasonCard
                    title={t.passTitle}
                    rows={PASS_KEYS.map((k) => t.checks[k])}
                    tone="pass"
                    note={t.locked.title}
                  />
                </div>
              </div>
            </Container>
          </Section>

          {/* Closing CTA — a contained dark-green panel: dark hero → light
              results → dark CTA gives the page its rhythm. */}
          <Section className="pb-28 pt-0">
            <Container>
              <Reveal>
                <div className="relative overflow-hidden rounded-token-24 px-8 py-16 text-center lg:px-16 lg:py-18" style={{ background: HERO_BG }}>
                  <Glow className="right-0 top-0 h-72 w-72 bg-[#6b9b87]/40" />
                  <h2 className="mx-auto max-w-2xl text-h3 font-semibold tracking-tight text-white-remain lg:text-h2">{t.ctaTitle}</h2>
                  <p className="mx-auto mt-4 max-w-xl text-paragraph-big text-brand-100">{t.ctaLead}</p>
                  <div className="mt-8 flex justify-center">
                    <BookDemoButton variant="light" withIcon>
                      {MARKETING_COPY[lang].nav.demo}
                    </BookDemoButton>
                  </div>
                </div>
              </Reveal>
            </Container>
          </Section>
        </div>
      )}
    </>
  )
}

/**
 * A locked "reasons" card: teaser rows with GENERIC check names (from public
 * marketing copy — what Fratello audits, never this site's actual results).
 * Blur increases top-to-bottom, paywall style: the first line is almost
 * readable so visitors see exactly what kind of insight they are missing.
 */
function LockedReasonCard({
  title,
  rows,
  tone,
  note,
}: {
  title: string
  rows: readonly { label: string; rec: string }[]
  tone: 'fix' | 'pass'
  note: string
}): ReactElement {
  return (
    <div className="flex h-full flex-col gap-4 rounded-token-24 border border-neutral-primary bg-card p-7 shadow-regular-lg">
      <h2 className="text-h5 font-semibold text-primary">{title}</h2>
      <div className="relative min-h-[190px] flex-1">
        {/* Teaser rows — generic copy, decorative, unselectable. */}
        <div aria-hidden="true" className="flex select-none flex-col gap-3.5">
          {rows.map((row, i) => {
            const step = TEASE_STEPS[Math.min(i, TEASE_STEPS.length - 1)]
            return (
              <div
                key={row.label}
                className="flex items-start gap-3"
                style={{ filter: `blur(${step.blur}px)`, opacity: step.opacity }}
              >
                {tone === 'fix' ? (
                  <WarningCircle className="mt-0.5 size-5 shrink-0 text-icon-error" weight="fill" />
                ) : (
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-icon-brand" weight="fill" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-paragraph-medium font-semibold text-primary">{row.label}</p>
                  <p className="mt-0.5 truncate text-paragraph-medium text-neutral-500">{row.rec}</p>
                </div>
              </div>
            )
          })}
        </div>
        {/* Fade-out into the lock, so the list clearly continues below. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-card)] to-transparent" aria-hidden="true" />
        {/* Lock badge, anchored low where the content dissolves. */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 pb-1 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-display-brand text-brand-token">
            <LockSimple className="size-5" weight="fill" aria-hidden="true" />
          </span>
          <p className="max-w-[240px] text-label-medium font-semibold text-primary">{note}</p>
        </div>
      </div>
    </div>
  )
}
