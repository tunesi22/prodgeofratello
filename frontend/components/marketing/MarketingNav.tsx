'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { List, X, Globe, CaretDown, Sparkle, ArrowsClockwise, Storefront, Question, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/marketing/site'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import { useDemoModal } from '@/components/marketing/DemoModal'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { delocalizePath, localizeHomeHash, localizeHref } from '@/lib/marketing/locale'

// Section ids are language-independent, so derive scroll-spy targets once.
const NAV_IDS = MARKETING_COPY.id.nav.product.items.map((i) => i.href.replace('#', ''))
// One icon per product-dropdown item, matched by index.
const PRODUCT_ICONS: Icon[] = [Sparkle, ArrowsClockwise, Storefront, Question]

/**
 * Public marketing top nav: a floating, contained dark-glass bar (rounded, with
 * side margins) that reads cleanly over both the green hero and the light
 * content. The on-page product sections (features, how it works, solutions,
 * FAQ) are grouped under one "Product" dropdown so the bar stays uncluttered;
 * Blog and About remain top-level. Scroll-spy highlights the dropdown trigger
 * while any product section is in view; the bar hides on scroll down and
 * reappears on scroll up. "Book a demo" opens the demo modal.
 */
export function MarketingNav(): ReactElement {
  const pathname = usePathname()
  const { openDemo } = useDemoModal()
  const { lang, toggleLang } = useMarketingLang()
  const t = MARKETING_COPY[lang].nav
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)
  const [active, setActive] = useState<string>('')
  const productRef = useRef<HTMLDivElement>(null)
  // Small close delay so the pointer can travel from trigger to panel.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openProduct(): void {
    if (closeTimer.current != null) clearTimeout(closeTimer.current)
    setProductOpen(true)
  }
  function scheduleCloseProduct(): void {
    if (closeTimer.current != null) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setProductOpen(false), 140)
  }

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

  useEffect(() => {
    setMobileOpen(false)
    setProductOpen(false)
  }, [pathname])

  // Close the product dropdown on outside click or Escape.
  useEffect(() => {
    if (!productOpen) return
    function onPointerDown(e: MouseEvent): void {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductOpen(false)
      }
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setProductOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [productOpen])

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

  const onHome = delocalizePath(pathname) === '/'
  const productActive = t.product.items.some((item) => active === item.href)

  const itemCls = (isActive: boolean): string =>
    cn(
      'rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors duration-200 ease-standard',
      isActive ? 'bg-white/10 text-white-remain' : 'text-brand-100 hover:bg-white/10 hover:text-white-remain',
    )

  /** Anchor items only resolve on the homepage; elsewhere, route to "/#id". */
  function anchorItem(item: { label: string; href: string }, className: string, onNavigate?: () => void): ReactElement {
    return onHome ? (
      <a key={item.href} href={item.href} onClick={onNavigate} className={className}>{item.label}</a>
    ) : (
      <Link key={item.href} href={localizeHomeHash(item.href, lang)} onClick={onNavigate} className={className}>{item.label}</Link>
    )
  }

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
        <Link href={localizeHref('/', lang)} className="inline-flex items-center gap-2.5 pl-1" aria-label={lang === 'en' ? 'Fratello, homepage' : 'Fratello, beranda'}>
          <FratelloLogo className="h-7 w-[46px] text-white-remain" />
          <span className="font-serif text-[22px] tracking-[-0.5px] text-white-remain">Fratello</span>
        </Link>

        {/* Center links (desktop): Product dropdown + real pages */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          <div ref={productRef} className="relative" onMouseEnter={openProduct} onMouseLeave={scheduleCloseProduct}>
            <button
              type="button"
              onClick={() => setProductOpen((v) => !v)}
              aria-expanded={productOpen}
              aria-haspopup="menu"
              className={cn(itemCls(productOpen || productActive), 'inline-flex items-center gap-1')}
            >
              {t.product.label}
              <CaretDown
                className={cn('size-3.5 transition-transform duration-200 ease-standard', productOpen && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence>
              {productOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute -left-3 top-full origin-top pt-2.5"
                >
                  <div className="w-[360px] rounded-token-16 bg-white p-2 shadow-regular-xl">
                    {t.product.items.map((item, i) => {
                      const ItemIcon = PRODUCT_ICONS[i]
                      const inner = (
                        <>
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-brand-token transition-colors duration-200 ease-standard group-hover/item:bg-brand-100">
                            <ItemIcon className="size-5" weight="fill" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                              {item.label}
                              <ArrowRight className="size-3.5 -translate-x-1 text-brand-token opacity-0 transition-all duration-200 ease-standard group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                            </span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">{item.desc}</span>
                          </span>
                        </>
                      )
                      const cls =
                        'group/item flex items-center gap-3 rounded-token-12 px-3 py-2.5 transition-colors duration-200 ease-standard hover:bg-secondary'
                      return onHome ? (
                        <a key={item.href} href={item.href} onClick={() => setProductOpen(false)} className={cls}>
                          {inner}
                        </a>
                      ) : (
                        <Link key={item.href} href={localizeHomeHash(item.href, lang)} onClick={() => setProductOpen(false)} className={cls}>
                          {inner}
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {t.links.map((item) => (
            <Link key={item.href} href={localizeHref(item.href, lang)} className={itemCls(pathname === localizeHref(item.href, lang))}>
              {item.label}
            </Link>
          ))}
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
            href={localizeHref(SITE.loginHref, lang)}
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
          aria-label={mobileOpen ? (lang === 'en' ? 'Close menu' : 'Tutup menu') : (lang === 'en' ? 'Open menu' : 'Buka menu')}
          aria-expanded={mobileOpen}
          className="flex size-9 items-center justify-center rounded-lg text-white-remain transition-colors hover:bg-white/10 lg:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <List className="size-6" />}
        </button>
      </div>

      {/* Mobile menu: product group first (labelled), then real pages */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-[1180px] rounded-token-16 border border-white/10 bg-[#02120b]/95 px-4 py-4 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-1">
            <span className="px-3 pb-1 pt-2 text-[13px] font-semibold text-brand-100">{t.product.label}</span>
            {t.product.items.map((item) =>
              anchorItem(
                item,
                'rounded-lg px-3 py-3 text-[16px] font-medium text-white-remain transition-colors hover:bg-white/10',
                () => setMobileOpen(false),
              ),
            )}
            <div className="my-2 border-t border-white/10" />
            {t.links.map((item) => (
              <Link
                key={item.href}
                href={localizeHref(item.href, lang)}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-[16px] font-medium text-white-remain transition-colors hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
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
                href={localizeHref(SITE.loginHref, lang)}
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
