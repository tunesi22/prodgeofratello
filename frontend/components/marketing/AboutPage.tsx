'use client'

import type { ReactElement } from 'react'
import {
  ChatCircleText,
  ShareNetwork,
  BookOpenText,
  Sparkle,
  Target,
  Repeat,
  ChartLineUp,
  MapPinArea,
  CheckCircle,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { Container, Section, SectionHeading, CTAButton, Stat, HERO_BG } from '@/components/marketing/ui'
import { BookDemoButton } from '@/components/marketing/DemoModal'
import { Reveal } from '@/components/marketing/interactive'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { localizeHref } from '@/lib/marketing/locale'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { cn } from '@/lib/cn'

const FRAMEWORK_ICONS: Icon[] = [ChatCircleText, ShareNetwork, BookOpenText]
const DIFF_ICONS: Icon[] = [Sparkle, Repeat, Target, MapPinArea, ChartLineUp]

export function AboutPage(): ReactElement {
  const { lang } = useMarketingLang()
  const t = MARKETING_COPY[lang].about

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ background: HERO_BG }}>
        <Container className="relative flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
          <h1 className="max-w-3xl text-h2 font-semibold text-white-remain sm:text-h1">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-h4 font-normal leading-relaxed text-brand-100">{t.hero.lead}</p>
        </Container>
      </section>

      {/* Problem */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.problem.eyebrow} title={t.problem.title} />
          </Reveal>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-5">
            {t.problem.body.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-paragraph-big leading-relaxed text-neutral-500">{p}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Framework */}
      <Section className="bg-secondary">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.framework.eyebrow} title={t.framework.title} lead={t.framework.lead} />
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {t.framework.layers.map((layer, i) => {
              const LayerIcon = FRAMEWORK_ICONS[i]
              return (
                <Reveal key={layer.title} delay={i * 0.08}>
                  <div className="flex h-full flex-col gap-4 rounded-token-24 border border-neutral-primary bg-card p-7">
                    <span className="flex size-12 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
                      <LayerIcon className="size-6" />
                    </span>
                    <h3 className="text-h5 font-semibold text-primary">{layer.title}</h3>
                    <p className="text-paragraph-medium leading-relaxed text-neutral-500">{layer.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Differentiators */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.differentiators.eyebrow} title={t.differentiators.title} />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.differentiators.items.map((item, i) => {
              const DiffIcon = DIFF_ICONS[i]
              return (
                <Reveal key={item.title} delay={(i % 3) * 0.08} className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : undefined}>
                  <div className="flex h-full flex-col gap-3 rounded-token-16 border border-neutral-primary bg-card p-6">
                    <span className="flex size-10 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
                      <DiffIcon className="size-5" />
                    </span>
                    <h3 className="text-label-big font-semibold text-primary">{item.title}</h3>
                    <p className="text-paragraph-medium leading-relaxed text-neutral-500">{item.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* Full feature list */}
      <Section className="bg-secondary">
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.features.eyebrow} title={t.features.title} lead={t.features.lead} />
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {t.features.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 0.06}>
                <div className="flex items-start gap-3 rounded-token-16 border border-neutral-primary bg-card p-5">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-icon-brand" weight="fill" />
                  <div>
                    <h3 className="text-label-big font-semibold text-primary">{item.title}</h3>
                    <p className="mt-1 text-paragraph-medium leading-relaxed text-neutral-500">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Audience */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading align="center" eyebrow={t.audience.eyebrow} title={t.audience.title} />
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.audience.items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="flex h-full flex-col gap-2 rounded-token-16 border border-neutral-primary bg-card p-5">
                  <h3 className="text-label-big font-semibold text-primary">{item.title}</h3>
                  <p className="text-paragraph-medium leading-relaxed text-neutral-500">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Stats recap */}
      <Section className="pb-8 pt-8 lg:pb-10 lg:pt-10">
        <Container>
          <Reveal>
            <div
              className="relative overflow-hidden rounded-token-24 px-8 py-14 lg:px-14 lg:py-16"
              style={{ background: 'radial-gradient(70% 90% at 85% 110%, #06472c, transparent 55%), linear-gradient(150deg, #053521, #02120b)' }}
            >
              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {MARKETING_COPY[lang].stats.filter((s) => s.value !== '5x').map((s) => (
                  <Stat key={s.label} value={s.value} label={s.label} onDark>
                    {s.desc}
                  </Stat>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section className="pb-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-token-24 px-8 py-16 text-center lg:px-16 lg:py-20" style={{ background: HERO_BG }}>
              <h2 className="mx-auto max-w-2xl text-h3 font-semibold tracking-tight text-white-remain lg:text-h2">{t.closing.title}</h2>
              <p className="mx-auto mt-4 max-w-xl text-paragraph-big text-brand-100">{t.closing.lead}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <BookDemoButton variant="light" withIcon>
                  {t.closing.demo}
                </BookDemoButton>
                <CTAButton href={localizeHref('/blog', lang)} variant="outline-light" iconRight>
                  {t.closing.secondary}
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
