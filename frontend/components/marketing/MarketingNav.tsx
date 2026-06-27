'use client'

import { useEffect, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { List, X, Globe } from '@phosphor-icons/react/dist/ssr'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/marketing/site'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { useDemoModal } from '@/components/marketing/DemoModal'
import { useLanguage } from '@/components/providers/LanguageProvider'

// Section ids are language-independent, so derive scroll-spy targets once.
const NAV_IDS = MARKETING_COPY.id.nav.items.map((i) => i.href.replace('#', ''))

/**
 * Public marketing top nav: a floating, contained dark-glass bar (rounded, with
 * side margins) that reads cleanly over both the green hero and the light
 * content. Centered anchor links with scroll-spy; the bar hides on scroll down
 * and reappears on scroll up. "Book a demo" opens the demo modal.
 */
export function MarketingNav(): ReactElement {
  const pathname = usePathname()
  const { openDemo } = useDemoModal()
  const { lang, toggleLang } = useLanguage()
  const t = MARKETING_COPY[lang].nav
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    let lastY = window.scrollY
    function onScroll(): void {
      const y = window.scrollY
      setScrolled(y > 24)
      if (y > lastY && y > 280) setHidden(true)
      else if (y < lastY - 4) setHidden(false)
      lastY = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  // Scroll-spy: highlight the nav item for the section currently in view.
  useEffect(() => {
    const sections = NAV_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null)
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 px-4 pt-3 transition-transform duration-300 ease-standard',
        hidden && !mobileOpen ? '-translate-y-[130%]' : 'translate-y-0',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[1180px] items-center justify-between gap-4 rounded-token-16 px-3 py-2.5 backdrop-blur-md transition-colors duration-300 ease-standard sm:px-4',
          scrolled ? 'bg-[#02120b]/85' : 'bg-[#02120b]/55',
        )}
      >
        <Link href="/" className="inline-flex items-center gap-2.5 pl-1" aria-label="Fratello, beranda">
          <FratelloLogo className="h-7 w-[46px] text-white-remain" />
          <span className="font-serif text-[22px] tracking-[-0.5px] text-white-remain">Fratello</span>
        </Link>

        {/* Center links (desktop) */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {t.items.map((item) => {
            const isPage = !item.href.startsWith('#')
            const isActive = isPage ? pathname === item.href : active === item.href
            const cls = cn(
              'rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors duration-200 ease-standard',
              isActive ? 'bg-white/10 text-white-remain' : 'text-brand-100 hover:bg-white/10 hover:text-white-remain',
            )
            return isPage ? (
              <Link key={item.href} href={item.href} className={cls}>{item.label}</Link>
            ) : (
              <a key={item.href} href={item.href} className={cls}>{item.label}</a>
            )
          })}
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-brand-100 transition-colors duration-200 ease-standard hover:bg-white/10 hover:text-white-remain"
          >
            <Globe className="size-4" />
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <Link
            href={SITE.loginHref}
            className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-brand-100 transition-colors duration-200 ease-standard hover:text-white-remain"
          >
            {t.login}
          </Link>
          <button
            type="button"
            onClick={openDemo}
            className="rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-brand-700 transition-colors duration-200 ease-standard hover:bg-brand-10"
          >
            {t.demo}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileOpen}
          className="flex size-9 items-center justify-center rounded-lg text-white-remain transition-colors hover:bg-white/10 lg:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <List className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-[1180px] rounded-token-16 border border-white/10 bg-[#02120b]/95 px-4 py-4 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-1">
            {t.items.map((item) => {
              const isPage = !item.href.startsWith('#')
              const cls = 'rounded-lg px-3 py-3 text-[16px] font-medium text-white-remain transition-colors hover:bg-white/10'
              return isPage ? (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cls}>{item.label}</Link>
              ) : (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cls}>{item.label}</a>
              )
            })}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={toggleLang}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-center text-[15px] font-semibold text-white-remain transition-colors hover:bg-white/10"
              >
                <Globe className="size-4" />
                {lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              </button>
              <Link
                href={SITE.loginHref}
                className="rounded-lg border border-white/30 px-4 py-3 text-center text-[15px] font-semibold text-white-remain"
              >
                {t.login}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  openDemo()
                }}
                className="rounded-lg bg-white px-4 py-3 text-center text-[15px] font-semibold text-brand-700"
              >
                {t.demo}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
