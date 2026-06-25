'use client'

import Link from 'next/link'
import type { ReactElement } from 'react'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { Container } from './ui'
import { SITE } from '@/lib/marketing/site'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { useLanguage } from '@/components/providers/LanguageProvider'

/** Public marketing footer: brand block, link columns, legal row. */
export function MarketingFooter(): ReactElement {
  const { lang } = useLanguage()
  const t = MARKETING_COPY[lang].footer

  return (
    <footer className="relative z-10 border-t border-neutral-primary bg-secondary">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Fratello, beranda">
              <FratelloLogo className="h-7 w-[46px] text-icon-brand" />
              <span className="font-serif text-[22px] tracking-[-0.45px] text-primary">Fratello</span>
            </Link>
            <p className="mt-4 max-w-xs text-paragraph-medium leading-relaxed text-neutral-500">{t.tagline}</p>
          </div>

          {t.columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-label-medium font-semibold uppercase tracking-wider text-neutral-500">{col.title}</p>
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
          <p className="text-label-medium text-neutral-500">
            {'©'} 2026 {SITE.name}. {t.rights}
          </p>
          <div className="flex items-center gap-5">
            {t.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-label-medium text-neutral-500 transition-colors duration-200 ease-standard hover:text-brand-token"
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
