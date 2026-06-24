'use client'

import { useEffect, useState, type ReactElement, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/cn'

/**
 * Shared split-screen shell for the auth pages (sign-in and sign-up), built from
 * Figma 138:649. Left is a green rounded gradient card with the Fratello lockup
 * and an auto-rotating carousel of 3 GEO facts; right is the form column (passed
 * as children) with a centered mobile logo fallback. Keeping the brand panel
 * here means both auth screens stay visually identical from one source.
 */
const FACTS = {
  id: [
    '"Pencarian AI tumbuh 42,8% dalam setahun. Pemasaran berbasis agen sudah menentukan siapa yang direkomendasikan. Bersiaplah."',
    '"60% pembeli bertanya ke asisten AI sebelum ke Google. Jika model tidak mengenal brand Anda, Anda tidak terlihat."',
    '"Disebut oleh ChatGPT atau Perplexity adalah halaman depan yang baru. GEO menempatkan brand Anda di dalam jawaban, bukan sekadar hasil pencarian."',
  ],
  en: [
    '"AI search grew 42.8% in a single year. Agentic marketing is already deciding who gets recommended. Be ready."',
    '"60% of buyers ask an AI assistant before they ask Google. If the model does not know your brand, you are invisible."',
    '"Being named by ChatGPT or Perplexity is the new front page. GEO puts your brand inside the answer, not just the search results."',
  ],
} as const

const SLIDE_ARIA = {
  id: (n: number): string => `Tampilkan fakta ${n}`,
  en: (n: number): string => `Show fact ${n}`,
} as const

/**
 * Brand surface for the panel. The exported Figma artwork is layered on top
 * (public/bg-green-login.jpg) and a deep-green radial gradient from the brand
 * scale sits underneath as a graceful fallback, so the panel still looks right
 * if the image is missing or while it loads.
 */
const PANEL_FALLBACK =
  'radial-gradient(130% 120% at 40% 5%, var(--color-brand-400), var(--color-brand-500) 45%, var(--color-brand-600))'
const PANEL_BG = `url('/bg-green-login.jpg') center / cover no-repeat, ${PANEL_FALLBACK}`

export function AuthLayout({ children }: { children: ReactNode }): ReactElement {
  const { lang, setLang } = useLanguage()
  const pathname = usePathname()
  const facts = FACTS[lang]
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const iv = window.setInterval(() => setSlide((s) => (s + 1) % facts.length), 5500)
    return () => window.clearInterval(iv)
  }, [facts.length])

  return (
    // Sign-in / sign-up are always light, regardless of the saved theme.
    <div data-theme="light" className="relative flex min-h-screen overflow-hidden bg-primary">
      {/* Language switcher (ID / EN) */}
      <div className="absolute right-5 top-5 z-30 flex items-center gap-0.5 rounded-circle border border-neutral-primary bg-card p-0.5 shadow-sm">
        {(['id', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={cn(
              'rounded-circle px-3 py-1 text-label-medium font-semibold uppercase transition-colors duration-200 ease-standard',
              lang === l ? 'bg-display-brand text-brand-token' : 'text-tertiary hover:text-primary',
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {/* LEFT: brand panel (rounded inset card) + GEO-fact carousel */}
      <div className="hidden p-6 lg:flex lg:w-1/2">
        <div
          className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-token-24 p-10"
          style={{ background: PANEL_BG }}
        >
          <Link
            href="/"
            className="relative z-10 inline-flex items-center gap-2.5 transition-opacity duration-200 ease-standard hover:opacity-90"
          >
            <FratelloLogo className="h-[34px] w-[56px] text-white-remain" />
            <span className="font-serif text-[28px] tracking-[-0.5px] text-white-remain">Fratello</span>
          </Link>

          <div className="relative z-10 flex max-w-[560px] flex-col gap-6">
            <div className="min-h-[112px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={slide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="text-h5 font-normal leading-relaxed text-white-remain"
                >
                  {facts[slide]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              {facts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={SLIDE_ARIA[lang](i + 1)}
                  className={cn(
                    'h-2 rounded-circle bg-neutral-0 transition-all duration-300 ease-standard',
                    i === slide ? 'w-6 opacity-100' : 'w-2 opacity-50 hover:opacity-80',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: form column */}
      <div className="flex w-full items-center justify-center bg-primary p-8 lg:w-1/2 lg:p-14">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <span className="inline-flex items-center gap-2.5">
              <FratelloLogo className="h-7 w-[46px] text-icon-brand" />
              <span className="font-serif text-[24px] tracking-[-0.45px] text-brand-token">Fratello</span>
            </span>
          </div>
          {/* Page-switch animation: the form fades and slides in on each auth
              navigation (sign-in <-> sign-up), since this layout remounts per route. */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
