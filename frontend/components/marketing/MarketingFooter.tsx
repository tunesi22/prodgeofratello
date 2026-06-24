import Link from 'next/link'
import type { ReactElement } from 'react'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { Container, CTAButton } from './ui'
import { FOOTER, FOOTER_LEGAL, SITE } from '@/lib/marketing/site'

/** Public marketing footer: brand block, link columns, legal row. */
export function MarketingFooter(): ReactElement {
  const year = 2026
  return (
    <footer className="border-t border-neutral-primary bg-secondary">
      <Container className="py-16">
        {/* CTA band */}
        <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-token-24 border border-neutral-primary bg-card p-8 lg:flex-row lg:items-center lg:p-10">
          <div>
            <h2 className="text-h4 font-semibold tracking-tight text-primary">Siap dilihat oleh AI?</h2>
            <p className="mt-2 max-w-xl text-paragraph-big text-tertiary">
              Lihat seberapa sering brand Anda muncul di jawaban AI, lalu naikkan angkanya.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <CTAButton href={SITE.demoHref} variant="primary">
              Book a demo
            </CTAButton>
            <CTAButton href="/tools/cek-visibilitas-ai" variant="ghost">
              Cek gratis
            </CTAButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 lg:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Fratello, beranda">
              <FratelloLogo className="h-7 w-[46px] text-icon-brand" />
              <span className="font-serif text-[22px] tracking-[-0.45px] text-primary">Fratello</span>
            </Link>
            <p className="mt-4 max-w-xs text-paragraph-medium leading-relaxed text-tertiary">{SITE.tagline}</p>
          </div>

          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-label-medium font-semibold uppercase tracking-wider text-tertiary">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-paragraph-medium text-secondary transition-colors duration-200 ease-standard hover:text-brand-token"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-neutral-primary pt-6 sm:flex-row sm:items-center">
          <p className="text-label-medium text-tertiary">
            {'©'} {year} {SITE.name}. Platform GEO untuk pasar Indonesia.
          </p>
          <div className="flex items-center gap-5">
            {FOOTER_LEGAL.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-label-medium text-tertiary transition-colors duration-200 ease-standard hover:text-brand-token"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
