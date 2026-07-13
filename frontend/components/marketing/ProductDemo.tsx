'use client'

import { useEffect, useState, type ReactElement } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  SquaresFour,
  ChatCircleText,
  Quotes,
  ChartBar,
  Sparkle,
  CheckCircle,
  CircleNotch,
  ArrowRight,
  TrendUp,
  FileMd,
  FileHtml,
  Flame,
  Gauge,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { cn } from '@/lib/cn'

/**
 * Cursor.com-style interactive product demo: filter chips select a flow, and a
 * hand-built simulation of the Fratello app plays it out with live animation
 * (counting stats, run strips filling, bars growing, an article being written).
 * Everything is mock data on design tokens — no screenshots, no real backend.
 */

type FlowKey = 'overview' | 'tracking' | 'analytics' | 'articles'

const SIDEBAR_ICONS: Icon[] = [SquaresFour, ChatCircleText, Quotes, ChartBar, Sparkle]
// Which sidebar row lights up for each flow.
const FLOW_SIDEBAR: Record<FlowKey, number> = { overview: 0, tracking: 1, analytics: 3, articles: 4 }
const MODELS = ['openai', 'gemini', 'perplexity', 'anthropic'] as const

const PANEL_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

/** Animated 0 → value counter (once per mount). */
function useCountUp(target: number, duration: number, enabled: boolean): number {
  const [value, setValue] = useState(enabled ? 0 : target)
  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number): void => {
      const k = Math.min(1, (now - start) / duration)
      setValue(Math.round((1 - Math.pow(1 - k, 3)) * target * 10) / 10)
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, enabled])
  return value
}

export function ProductDemo(): ReactElement {
  const { lang } = useMarketingLang()
  const t = MARKETING_COPY[lang].demo
  const reduce = useReducedMotion() ?? false
  const [flow, setFlow] = useState<FlowKey>('overview')

  return (
    <div>
      {/* Flow chips */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {t.chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setFlow(chip.key as FlowKey)}
            aria-pressed={flow === chip.key}
            className={cn(
              'rounded-full px-5 py-2.5 text-label-medium font-semibold transition-colors duration-200 ease-standard',
              flow === chip.key
                ? 'bg-brand-600 text-white-remain'
                : 'bg-secondary text-neutral-500 hover:bg-neutral-100 hover:text-primary',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Browser frame */}
      <div className="overflow-hidden rounded-token-24 border border-neutral-primary bg-card shadow-regular-xl">
        <div className="flex items-center gap-2 border-b border-neutral-primary bg-secondary px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-neutral-200" />
            <span className="size-2.5 rounded-full bg-neutral-200" />
            <span className="size-2.5 rounded-full bg-neutral-200" />
          </span>
          <span className="mx-auto rounded-full bg-card px-4 py-1 text-label-medium text-neutral-500">app.hifratello.com</span>
          <span className="w-12" aria-hidden="true" />
        </div>

        <div className="flex h-[480px] sm:h-[460px]">
          {/* Mini sidebar */}
          <aside className="hidden w-52 shrink-0 flex-col border-r border-neutral-primary bg-secondary p-4 md:flex">
            <FratelloLogo className="h-5 w-auto self-start text-icon-brand" />
            <div className="mt-5 flex items-center gap-2.5 rounded-token-12 border border-neutral-primary bg-card px-3 py-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-display-brand text-label-small font-bold text-brand-token">
                {t.brand.name.charAt(0)}
              </span>
              <span className="text-label-medium font-semibold text-primary">{t.brand.name}</span>
            </div>
            <nav className="mt-5 flex flex-col gap-1">
              {t.sidebar.map((label, i) => {
                const NavIcon = SIDEBAR_ICONS[i]
                const isActive = FLOW_SIDEBAR[flow] === i
                return (
                  <span
                    key={label}
                    className={cn(
                      'flex items-center gap-2.5 rounded-token-8 px-3 py-2 text-label-medium transition-colors duration-200 ease-standard',
                      isActive ? 'bg-display-brand font-semibold text-brand-token' : 'text-neutral-500',
                    )}
                  >
                    <NavIcon className="size-4" weight={isActive ? 'fill' : 'regular'} />
                    {label}
                  </span>
                )
              })}
            </nav>
          </aside>

          {/* Flow panel */}
          <div className="min-w-0 flex-1 overflow-hidden p-5 sm:p-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={flow}
                variants={reduce ? undefined : PANEL_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="h-full"
              >
                {flow === 'overview' && <OverviewFlow lang={lang} reduce={reduce} />}
                {flow === 'tracking' && <TrackingFlow lang={lang} reduce={reduce} />}
                {flow === 'analytics' && <AnalyticsFlow lang={lang} reduce={reduce} />}
                {flow === 'articles' && <ArticlesFlow lang={lang} reduce={reduce} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FlowProps {
  lang: 'id' | 'en'
  reduce: boolean
}

function OverviewFlow({ lang, reduce }: FlowProps): ReactElement {
  const t = MARKETING_COPY[lang].demo.overview
  const rate = useCountUp(56.7, 1300, !reduce)
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-token-16 border border-brand-token/30 bg-display-brand/40 p-5">
        <p className="flex flex-wrap items-baseline gap-x-2 text-h5 font-semibold text-primary sm:text-h4">
          {t.banner}
          <span className="text-h3 font-semibold tabular-nums text-brand-token sm:text-h2">
            {rate.toFixed(1).replace('.', lang === 'id' ? ',' : '.')}%
          </span>
          {t.bannerTail}
        </p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-label-medium font-semibold text-brand-token">
          <TrendUp className="size-4" weight="bold" />
          {t.delta}
        </p>
        <p className="mt-2 text-paragraph-medium text-neutral-500">{t.sub}</p>
      </div>
      <div className="min-h-0 flex-1">
        <p className="text-label-medium font-semibold text-neutral-500">{t.queueTitle}</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {t.items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.3 }}
              className="flex items-center justify-between gap-3 rounded-token-12 border border-neutral-primary bg-card px-4 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-paragraph-medium text-primary">
                {item.impact === 'high' ? (
                  <Flame className="size-4 shrink-0 text-error-token" weight="fill" />
                ) : (
                  <Gauge className="size-4 shrink-0 text-warning-token" weight="fill" />
                )}
                <span className="truncate">{item.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'hidden rounded-full px-2.5 py-0.5 text-label-small font-semibold sm:inline',
                    item.impact === 'high' ? 'bg-display-error text-error-token' : 'bg-display-warning text-warning-token',
                  )}
                >
                  {item.impact === 'high' ? t.impactHigh : t.impactMedium}
                </span>
                <ArrowRight className="size-4 text-neutral-500" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** One prompt row: per-model 5-run strips that fill in one by one. */
function TrackingFlow({ lang, reduce }: FlowProps): ReactElement {
  const t = MARKETING_COPY[lang].demo.tracking
  // Deterministic mock: which of the 5 runs mention the brand, per prompt × model.
  const RUNS = [
    [
      [1, 1, 0, 1, 1],
      [1, 0, 1, 1, 0],
      [1, 1, 1, 0, 1],
      [0, 1, 1, 1, 0],
    ],
    [
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 1],
      [1, 1, 0, 1, 0],
      [1, 0, 1, 0, 0],
    ],
    [
      [0, 1, 1, 1, 1],
      [1, 1, 0, 0, 1],
      [0, 1, 1, 0, 1],
      [1, 0, 0, 1, 1],
    ],
  ]
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-token-12 border border-neutral-primary bg-secondary px-4 py-2.5">
        <span className="flex items-center gap-2 text-label-medium font-semibold text-primary">
          <CircleNotch className="size-4 animate-spin text-brand-token" />
          {t.scanning}
        </span>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-neutral-100 sm:w-40">
          <motion.div
            className="h-full rounded-full bg-brand-600"
            initial={reduce ? { width: '78%' } : { width: '12%' }}
            animate={{ width: '78%' }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden">
        {t.prompts.map((prompt, pi) => (
          <div key={prompt} className="rounded-token-12 border border-neutral-primary bg-card p-3.5">
            <p className="truncate text-paragraph-medium font-medium text-primary">&ldquo;{prompt}&rdquo;</p>
            <div className="mt-2.5 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4">
              {MODELS.map((model, mi) => (
                <div key={model} className="flex items-center gap-2">
                  <ModelLogo model={model} className="size-4 shrink-0" />
                  <span className="flex gap-1">
                    {RUNS[pi][mi].map((hit, ri) => (
                      <motion.span
                        key={ri}
                        initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + pi * 0.35 + ri * 0.12, duration: 0.2 }}
                        className={cn('size-2.5 rounded-[3px]', hit === 1 ? 'bg-brand-500' : 'bg-neutral-100')}
                      />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsFlow({ lang, reduce }: FlowProps): ReactElement {
  const t = MARKETING_COPY[lang].demo.analytics
  const TREND = [41, 46, 52, 49, 57]
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-label-medium font-semibold text-neutral-500">{t.sovTitle}</p>
        <div className="mt-3 flex flex-col gap-2.5">
          {t.brands.map((b, i) => (
            <div key={b.name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-label-medium text-neutral-500 sm:w-28">
                {i === 0 ? <span className="font-semibold text-primary">{b.name}</span> : b.name}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded-token-8 bg-secondary">
                <motion.div
                  className={cn('flex h-full items-center justify-end rounded-token-8 px-2', i === 0 ? 'bg-brand-600' : 'bg-neutral-200')}
                  initial={reduce ? { width: `${b.value}%` } : { width: '4%' }}
                  animate={{ width: `${b.value}%` }}
                  transition={{ delay: 0.15 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                >
                  <span className={cn('text-label-small font-semibold tabular-nums', i === 0 ? 'text-white-remain' : 'text-secondary')}>
                    {b.value}%
                  </span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <p className="text-label-medium font-semibold text-neutral-500">{t.trendTitle}</p>
        <div className="mt-3 flex h-[calc(100%-2rem)] max-h-40 items-end gap-3 sm:gap-4">
          {TREND.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-label-small font-semibold tabular-nums text-neutral-500">{v}%</span>
              <motion.div
                className={cn('w-full rounded-t-token-8', i === TREND.length - 1 ? 'bg-brand-600' : 'bg-brand-100')}
                initial={reduce ? { height: `${v}%` } : { height: '6%' }}
                animate={{ height: `${v}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.55, ease: 'easeOut' }}
              />
              <span className="text-label-small text-neutral-500">W{21 + i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** An article visibly "writes itself", then flips to ready with export chips. */
function ArticlesFlow({ lang, reduce }: FlowProps): ReactElement {
  const t = MARKETING_COPY[lang].demo.articles
  const [written, setWritten] = useState(reduce)
  useEffect(() => {
    if (reduce) return
    const id = setTimeout(() => setWritten(true), 2600)
    return () => clearTimeout(id)
  }, [reduce])
  const LINES = [100, 92, 96, 60, 0, 88, 95, 72]
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Generating card */}
      <div className="flex-1 rounded-token-12 border border-neutral-primary bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-paragraph-medium font-semibold text-primary">{t.items[0]}</p>
          {written ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-display-brand px-2.5 py-0.5 text-label-small font-semibold text-brand-token">
              <CheckCircle className="size-3.5" weight="fill" /> {t.ready}
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-label-small font-medium text-neutral-500">
              <CircleNotch className="size-3.5 animate-spin text-brand-token" /> {t.generating}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {LINES.map((w, i) =>
            w === 0 ? (
              <span key={i} className="h-1" aria-hidden="true" />
            ) : (
              <motion.span
                key={i}
                aria-hidden="true"
                className="block h-2 rounded-full bg-neutral-100"
                initial={reduce ? { width: `${w}%`, opacity: 1 } : { width: 0, opacity: 0 }}
                animate={{ width: `${w}%`, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.28, duration: 0.34, ease: 'easeOut' }}
              />
            ),
          )}
        </div>
        <AnimatePresence>
          {written && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex gap-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-primary px-3 py-1 text-label-small font-semibold text-primary">
                <FileMd className="size-4 text-brand-token" /> .md
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-primary px-3 py-1 text-label-small font-semibold text-primary">
                <FileHtml className="size-4 text-brand-token" /> .html
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Second article, already drafted */}
      <div className="rounded-token-12 border border-neutral-primary bg-secondary px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-paragraph-medium font-medium text-primary">{t.items[1]}</p>
          <span className="shrink-0 rounded-full bg-display-neutral px-2.5 py-0.5 text-label-small font-semibold text-secondary">
            {t.draft}
          </span>
        </div>
      </div>
    </div>
  )
}
