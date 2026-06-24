import type { ReactElement } from 'react'
import Link from 'next/link'
import { Eye, Quotes, ChartBar, Sparkle, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { JsonLd } from '@/components/marketing/JsonLd'
import { Container, Section, SectionHeading, CTAButton, Stat, HERO_BG } from '@/components/marketing/ui'
import { AILogoFlip } from '@/components/marketing/AILogoFlip'
import { pageMetadata, organizationJsonLd, webSiteJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/seo'
import { SITE } from '@/lib/marketing/site'

export const metadata = pageMetadata({
  title: 'Platform GEO untuk Indonesia',
  description:
    'Fratello memantau seberapa sering brand Anda disebut di ChatGPT, Gemini, Perplexity, dan Claude, lalu membantu menaikkannya. GEO (Generative Engine Optimization) untuk pasar Indonesia.',
  path: '/',
})

const CARDS = [
  { title: 'AI Visibility', href: '/fitur/pelacakan-ai', Icon: Eye, desc: 'Lihat seberapa sering brand Anda muncul di jawaban AI, dipantau di empat model sekaligus.' },
  { title: 'Weekly Citations', href: '/fitur/analitik', Icon: Quotes, desc: 'Pantau sumber dan tautan yang dirujuk AI saat menyebut brand Anda, diperbarui rutin.' },
  { title: 'Agent Analytics', href: '/fitur/analitik', Icon: ChartBar, desc: 'Mention rate, share of voice, dan sentimen dalam satu dasbor yang mudah dibaca.' },
  { title: 'Content Agent', href: '/fitur/artikel-ai', Icon: Sparkle, desc: 'Buat artikel yang dioptimalkan untuk AI berdasarkan celah dari pelacakan Anda.' },
]

const STEPS = [
  { n: '01', title: 'Lacak', desc: 'Fratello menanyakan prompt kategori Anda ke empat model AI dan mencatat kapan brand Anda disebut.' },
  { n: '02', title: 'Analisis', desc: 'Lihat mention rate, share of voice, dan sentimen Anda dibanding kompetitor, beserta celahnya.' },
  { n: '03', title: 'Optimalkan', desc: 'Buat artikel dan distribusi yang menutup celah, lalu pantau angkanya naik.' },
]

export default function HomePage(): ReactElement {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd(), softwareApplicationJsonLd()]} />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: `url('/bg-green-landingpage.jpg') center / cover no-repeat, ${HERO_BG}` }}
      >
        <div className="mx-auto flex min-h-[86vh] max-w-[1200px] flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
          <h1 className="max-w-4xl text-[40px] font-semibold leading-[1.14] tracking-tight text-white-remain sm:text-[56px] lg:text-[64px]">
            Buat brand Anda dibaca <AILogoFlip /> lalu direkomendasikan ke manusia.
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CTAButton href={SITE.demoHref} variant="light" size="lg" iconRight>
              Book a demo
            </CTAButton>
            <CTAButton href="/tools/cek-visibilitas-ai" variant="outline-light" size="lg">
              Cek visibilitas gratis
            </CTAButton>
          </div>
        </div>
      </section>

      {/* AI Search Optimization (Figma 117:1271) */}
      <Section className="bg-secondary">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-circle bg-display-brand px-3.5 py-1.5 text-label-medium font-semibold text-brand-token">
              Optimasi Pencarian AI
            </span>
            <h2 className="mt-5 text-h3 font-semibold tracking-tight text-primary lg:text-h2">
              Sudah waktunya nama brand atau perusahaan Anda menang di pencarian AI.
            </h2>
            <p className="mt-4 text-paragraph-big leading-relaxed text-tertiary">
              Pantau, analisis, dan optimalkan kehadiran brand Anda di ChatGPT, Claude, Gemini, Perplexity, dan mesin
              pencari AI lainnya.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-token-24 border border-neutral-primary bg-card p-6 transition-colors duration-200 ease-standard hover:border-brand-token"
              >
                <div className="relative z-10">
                  <span className="flex size-11 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
                    <c.Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-label-big font-semibold text-primary">{c.title}</h3>
                  <p className="mt-2 text-paragraph-medium leading-relaxed text-tertiary">{c.desc}</p>
                </div>
                <div className="relative z-10 flex items-center gap-1.5 text-paragraph-medium font-semibold text-brand-token opacity-0 transition-opacity duration-200 ease-standard group-hover:opacity-100">
                  Pelajari
                  <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
                </div>
                {/* decorative oversized mark filling the tall card */}
                <c.Icon className="pointer-events-none absolute -bottom-6 -right-4 size-40 text-brand-50" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why GEO / stats */}
      <Section>
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <SectionHeading
              eyebrow="Pergeseran sedang terjadi"
              title="Pelanggan kini bertanya ke AI, bukan hanya ke Google."
              lead="Saat seseorang meminta rekomendasi ke ChatGPT atau Perplexity, jawabannya hanya menyebut beberapa brand. Kalau model tidak mengenal Anda, Anda tidak terlihat. GEO memastikan brand Anda ada di dalam jawaban itu."
            />
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:pt-4">
              <Stat value="42,8%" label="Pertumbuhan AI search">Pencarian berbasis AI tumbuh hampir setengah kali lipat dalam setahun.</Stat>
              <Stat value="4 Model" label="Dipantau sekaligus">ChatGPT, Gemini, Perplexity, dan Claude dalam satu tempat.</Stat>
              <Stat value="5x" label="Per prompt">Tiap prompt diuji lima kali agar mention rate akurat.</Stat>
              <Stat value="100%" label="Otomatis">Antrian pekerjaan menjalankan pelacakan tanpa kerja manual.</Stat>
            </div>
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section className="bg-secondary">
        <Container>
          <SectionHeading align="center" eyebrow="Cara kerja" title="Tiga langkah, dari tidak terlihat menjadi direkomendasikan" />
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-token-16 border border-neutral-primary bg-card p-7">
                <span className="text-h4 font-semibold text-brand-token">{s.n}</span>
                <h3 className="mt-3 text-label-big font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-paragraph-medium leading-relaxed text-tertiary">{s.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section className="pb-28">
        <Container>
          <div className="relative overflow-hidden rounded-token-24 px-8 py-16 text-center lg:px-16 lg:py-20" style={{ background: HERO_BG }}>
            <h2 className="mx-auto max-w-2xl text-h3 font-semibold tracking-tight text-white-remain lg:text-h2">
              Lihat di mana brand Anda berdiri di mata AI.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-paragraph-big text-brand-100">
              Mulai dari pemindaian gratis, atau jadwalkan demo untuk melihat Fratello bekerja pada brand Anda.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <CTAButton href={SITE.demoHref} variant="light" iconRight>
                Book a demo
              </CTAButton>
              <CTAButton href="/tools/cek-visibilitas-ai" variant="outline-light">
                Cek visibilitas gratis
              </CTAButton>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
