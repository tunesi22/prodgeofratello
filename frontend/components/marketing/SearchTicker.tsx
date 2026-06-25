'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { Container } from '@/components/marketing/ui'
import { cn } from '@/lib/cn'

/**
 * "Search ticker": a big count-up number (questions asked to AI per month) over
 * two rows of example search prompts scrolling in opposite directions, to convey
 * that millions of people are already asking AI these questions. Count animates
 * once on scroll-in; marquee + count both honor prefers-reduced-motion.
 */

function CountUp({ target, sep, suffix }: { target: number; sep: string; suffix: string }): ReactElement {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (el == null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return
        started.current = true
        io.disconnect()
        const start = performance.now()
        const duration = 1600
        function tick(now: number): void {
          const p = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(target * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  const formatted = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep)
  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  )
}

function Marquee({ prompts, reverse = false }: { prompts: string[]; reverse?: boolean }): ReactElement {
  const items = [...prompts, ...prompts]
  return (
    <div className="overflow-hidden">
      <div className={cn('flex w-max gap-3 pr-3', reverse ? 'fr-marquee-right' : 'fr-marquee-left')}>
        {items.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-token-12 border border-neutral-primary bg-card px-4 py-2.5 text-paragraph-medium text-secondary"
          >
            <MagnifyingGlass className="size-4 shrink-0 text-icon-brand" aria-hidden="true" />
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SearchTicker(): ReactElement {
  const { lang } = useLanguage()
  const t = MARKETING_COPY[lang].ticker
  const sep = lang === 'id' ? '.' : ','

  return (
    <section className="overflow-hidden py-16 lg:py-24">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-[52px] font-bold leading-none tracking-tight text-primary sm:text-[72px] lg:text-[88px]">
            <CountUp target={t.count} sep={sep} suffix={t.suffix} />
          </div>
          <p className="max-w-xl text-paragraph-big leading-relaxed text-neutral-500">{t.label}</p>
        </div>
      </Container>
      <div
        className="mt-12 flex flex-col gap-3"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
        aria-hidden="true"
      >
        <Marquee prompts={t.prompts} />
        <Marquee prompts={t.prompts} reverse />
      </div>
    </section>
  )
}
