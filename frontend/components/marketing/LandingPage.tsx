'use client'

import type { ReactElement } from 'react'
import {
  ChartBar,
  Sparkle,
  ArrowRight,
  MagnifyingGlass,
  Storefront,
  Buildings,
  ShoppingCart,
  Rocket,
  ForkKnife,
  Heartbeat,
  House,
  DotsThreeOutline,
  CheckCircle,
  X,
  ArrowsClockwise,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { Container, Section, SectionHeading, CTAButton, Stat, HERO_BG } from '@/components/marketing/ui'
import { AILogoFlip } from '@/components/marketing/AILogoFlip'
import { BookDemoButton } from '@/components/marketing/DemoModal'
import { SearchTicker } from '@/components/marketing/SearchTicker'
import { FeatureTabs } from '@/components/marketing/FeatureTabs'
import { Reveal, FAQ } from '@/components/marketing/interactive'
import { DashboardPreview, Glow } from '@/components/marketing/visuals'
import { ModelLogo } from '@/components/dashboard/ModelLogo'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { cn } from '@/lib/cn'

const STEP_ICONS: Icon[] = [MagnifyingGlass, ChartBar, Sparkle]
const INDUSTRY_ICONS: Icon[] = [Storefront, Buildings, ShoppingCart, Rocket, ForkKnife, Heartbeat, House, DotsThreeOutline]

export function LandingPage(): ReactElement {
  const { lang } = useLanguage()
  const t = MARKETING_COPY[lang]

  return (
    <>
      {/* Hero — full-screen green; only the buttons differ from the original. */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: `url('/bg-green-landingpage.jpg') center / cover no-repeat, ${HERO_BG}` }}
      >
        <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col items-center justify-center px-6 pb-28 pt-32 text-center">
          <span className="mb-6 inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-label-medium font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
            {t.hero.kicker}
          </span>
          <h1 className="max-w-4xl text-[40px] font-semibold leading-[1.14] tracking-tight text-white-remain sm:text-[56px] lg:text-[64px]">
            {t.hero.titleBefore} <AILogoFlip /> {t.hero.titleAfter}
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <BookDemoButton variant="light" size="lg">
              {t.hero.demo}
            </BookDemoButton>
            <CTAButton href="#bukti-produk" variant="outline-light" size="lg">
              {t.hero.secondary}
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Product preview */}
      <div id="bukti-produk" className="relative scroll-mt-28 overflow-hidden">
        <Container className="relative z-10 pb-20 pt-16 lg:pt-20">
          <Reveal>
            <DashboardPreview />
          </Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-center text-paragraph-medium text-neutral-500">{t.preview.caption}</p>
        </Container>
      </div>

      {/* Search-prompt ticker */}
      <SearchTicker />

      {/* The shift — GEO vs SEO */}
      <Section className="scroll-mt-28">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.shift.eyebrow} title={t.shift.title} lead={t.shift.lead} />
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-4xl items-stretch gap-5 sm:grid-cols-2">
            <Reveal className="h-full">
              <div className="flex h-full flex-col gap-4 rounded-token-24 border border-neutral-primary bg-secondary p-7">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-display-neutral px-3 py-1 text-label-medium font-semibold text-secondary">
                  <MagnifyingGlass className="size-4" /> {t.shift.seoTag}
                </span>
                <p className="text-paragraph-big leading-relaxed text-neutral-500">{t.shift.seoBody}</p>
                <div className="mt-auto flex flex-col gap-2">
                  {[60, 80, 45].map((w, i) => (
                    <span key={i} className="h-3 rounded-full bg-neutral-100" style={{ width: `${w}%` }} />
                  ))}
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-3 w-1/2 rounded-full bg-neutral-200" />
                    <span className="text-label-medium text-neutral-500">{t.shift.seoPos}</span>
                  </span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="h-full">
              <div className="flex h-full flex-col gap-4 rounded-token-24 border border-brand-token bg-card p-7 shadow-regular-lg">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-display-brand px-3 py-1 text-label-medium font-semibold text-brand-token">
                  <Sparkle className="size-4" weight="fill" /> {t.shift.geoTag}
                </span>
                <p className="text-paragraph-big leading-relaxed text-secondary">{t.shift.geoBody}</p>
                <div className="mt-auto rounded-token-16 border border-neutral-primary bg-secondary p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <ModelLogo model="openai" className="size-4" />
                    <span className="text-label-medium font-medium text-neutral-500">{t.shift.answerLabel}</span>
                  </div>
                  <p className="text-paragraph-medium leading-relaxed text-primary">
                    {t.shift.answerText}{' '}
                    <span className="rounded-md bg-display-brand px-1.5 py-0.5 font-semibold text-brand-token">{t.shift.answerBrand}</span>{' '}
                    {t.shift.answerTail}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section id="cara-kerja" className="scroll-mt-28">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.how.eyebrow} title={t.how.title} lead={t.how.lead} />
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {t.how.steps.map((s, i) => {
              const StepIcon = STEP_ICONS[i]
              return (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="relative h-full overflow-hidden rounded-token-24 border border-neutral-primary bg-card p-7">
                    <span className="flex size-12 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
                      <StepIcon className="size-6" />
                    </span>
                    <span className="mt-5 block text-label-medium font-semibold text-brand-token">
                      {t.how.stepLabel} 0{i + 1}
                    </span>
                    <h3 className="mt-1 text-h5 font-semibold text-primary">{s.title}</h3>
                    <p className="mt-2 text-paragraph-medium leading-relaxed text-neutral-500">{s.desc}</p>
                    {i < t.how.steps.length - 1 && (
                      <ArrowRight className="absolute right-5 top-7 hidden size-5 text-brand-300 lg:block" weight="bold" />
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal>
            <p className="mt-8 flex items-center justify-center gap-2 text-paragraph-medium font-medium text-neutral-500">
              <ArrowsClockwise className="size-4 text-brand-token" weight="bold" />
              {t.how.loopNote}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Features */}
      <Section id="fitur" className="scroll-mt-28">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.features.eyebrow} title={t.features.title} lead={t.features.lead} />
          </Reveal>

          <Reveal>
            <div className="mt-14">
              <FeatureTabs />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Comparison */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.comparison.eyebrow} title={t.comparison.title} lead={t.comparison.lead} />
          </Reveal>
          <Reveal>
            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-token-24 border border-neutral-primary bg-card">
              <div className="hidden grid-cols-[1.2fr_1fr_1fr] items-center gap-4 border-b border-neutral-primary px-7 py-4 sm:grid">
                <span className="text-label-medium font-semibold uppercase tracking-wider text-neutral-500">{t.comparison.aspect}</span>
                <span className="text-label-medium font-semibold text-neutral-500">{t.comparison.manual}</span>
                <span className="inline-flex items-center gap-1.5 text-label-big font-semibold text-brand-token">
                  <FratelloMark /> Fratello
                </span>
              </div>
              {t.comparison.rows.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    'flex flex-col gap-2 px-5 py-4 sm:grid sm:grid-cols-[1.2fr_1fr_1fr] sm:items-start sm:gap-4 sm:px-7',
                    i % 2 === 1 && 'bg-secondary',
                  )}
                >
                  <span className="text-paragraph-medium font-semibold text-primary sm:font-medium">{row.label}</span>
                  <span className="flex items-start gap-1.5 text-paragraph-medium text-neutral-500">
                    <X className="mt-0.5 size-4 shrink-0 text-icon-light-gray" weight="bold" />
                    <span className="[overflow-wrap:anywhere]">
                      <span className="font-medium text-secondary sm:hidden">{t.comparison.manual}: </span>
                      {row.manual}
                    </span>
                  </span>
                  <span className="flex items-start gap-1.5 text-paragraph-medium text-primary">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-icon-brand" weight="fill" />
                    <span className="[overflow-wrap:anywhere]">
                      <span className="font-medium text-brand-token sm:hidden">Fratello: </span>
                      {row.fratello}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Solutions */}
      <Section id="solusi" className="scroll-mt-28">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.solutions.eyebrow} title={t.solutions.title} lead={t.solutions.lead} />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.solutions.items.map((it, i) => {
              const IndIcon = INDUSTRY_ICONS[i]
              return (
                <Reveal key={it.name} delay={(i % 4) * 0.06}>
                  <div className="group flex h-full items-start gap-4 rounded-token-16 border border-neutral-primary bg-card p-5 transition-colors duration-200 ease-standard hover:border-brand-token">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
                      <IndIcon className="size-6" />
                    </span>
                    <div>
                      <h3 className="text-label-big font-semibold text-primary">{it.name}</h3>
                      <p className="mt-1 text-paragraph-medium leading-relaxed text-neutral-500">{it.desc}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Stats band (dark) */}
      <Section className="pb-8 pt-8 lg:pb-10 lg:pt-10">
        <Container>
          <Reveal>
            <div
              className="relative overflow-hidden rounded-token-24 px-8 py-14 lg:px-14 lg:py-16"
              style={{ background: 'radial-gradient(70% 90% at 85% 110%, #06472c, transparent 55%), linear-gradient(150deg, #053521, #02120b)' }}
            >
              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {t.stats.map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} onDark>
                    {s.desc}
                  </Stat>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="scroll-mt-28">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.faq.eyebrow} title={t.faq.title} />
          </Reveal>
          <Reveal>
            <div className="mt-12">
              <FAQ items={t.faq.items} />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Closing CTA (dark) */}
      <Section className="pb-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-token-24 px-8 py-16 text-center lg:px-16 lg:py-20" style={{ background: HERO_BG }}>
              <Glow className="right-0 top-0 h-72 w-72 bg-[#6b9b87]/40" />
              <h2 className="mx-auto max-w-2xl text-h3 font-semibold tracking-tight text-white-remain lg:text-h2">{t.closing.title}</h2>
              <p className="mx-auto mt-4 max-w-xl text-paragraph-big text-brand-100">{t.closing.lead}</p>
              <div className="mt-8 flex justify-center">
                <BookDemoButton variant="light" withIcon>
                  {t.closing.demo}
                </BookDemoButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}

function FratelloMark(): ReactElement {
  return (
    <span className="flex size-5 items-center justify-center rounded-md bg-brand-600 text-white-remain">
      <Sparkle className="size-3" weight="fill" />
    </span>
  )
}
