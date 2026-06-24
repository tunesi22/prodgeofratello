'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown, List, X } from '@phosphor-icons/react/dist/ssr'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { cn } from '@/lib/cn'
import { NAV, SITE } from '@/lib/marketing/site'

/**
 * Public marketing top nav. Transparent over the green hero, gains a solid dark
 * green bar on scroll. The centered pill holds the four nav groups; Fitur /
 * Solusi / Sumber Daya open mega-menus on hover (with a small close delay so the
 * cursor can cross into the panel), Harga is a direct link.
 *
 * Note: uses solid brand/neutral tokens only. Tailwind alpha modifiers (bg-x/40)
 * do not render against this project's CSS-variable color tokens.
 */
export function MarketingNav(): ReactElement {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onScroll(): void {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpenMenu(null)
    setMobileOpen(false)
  }, [pathname])

  function open(label: string): void {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenMenu(label)
  }
  function scheduleClose(): void {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }

  const active = NAV.find((g) => g.label === openMenu)
  const solid = scrolled || openMenu !== null

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b pt-4 transition-colors duration-300 ease-standard',
        solid ? 'border-brand-700 bg-brand-900' : 'border-transparent',
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Fratello, beranda">
          <FratelloLogo className="h-8 w-[52px] text-white-remain" />
          <span className="font-serif text-[24px] tracking-[-0.5px] text-white-remain">Fratello</span>
        </Link>

        {/* Center pill (desktop) */}
        <nav className="hidden items-center gap-1 rounded-circle bg-neutral-950 px-2 py-1.5 lg:flex">
          {NAV.map((group) =>
            group.columns.length === 0 ? (
              <Link
                key={group.label}
                href={group.href}
                className="rounded-circle px-3.5 py-1.5 text-paragraph-medium font-medium text-white-remain transition-colors duration-200 ease-standard hover:bg-neutral-800"
              >
                {group.label}
              </Link>
            ) : (
              <button
                key={group.label}
                type="button"
                onMouseEnter={() => open(group.label)}
                onFocus={() => open(group.label)}
                aria-expanded={openMenu === group.label}
                className={cn(
                  'inline-flex items-center gap-1 rounded-circle px-3.5 py-1.5 text-paragraph-medium font-medium text-white-remain transition-colors duration-200 ease-standard',
                  openMenu === group.label ? 'bg-neutral-800' : 'hover:bg-neutral-800',
                )}
              >
                {group.label}
                <CaretDown
                  className={cn('size-4 transition-transform duration-200', openMenu === group.label && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            ),
          )}
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={SITE.loginHref}
            className="rounded-circle px-4 py-2 text-paragraph-medium font-medium text-brand-100 transition-colors duration-200 ease-standard hover:text-white-remain"
          >
            Masuk
          </Link>
          <Link
            href={SITE.demoHref}
            className="rounded-circle bg-white-remain px-4 py-2 text-paragraph-medium font-semibold text-brand-token transition-colors duration-200 ease-standard hover:bg-brand-50"
          >
            Book a demo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileOpen}
          className="flex size-10 items-center justify-center rounded-token-8 text-white-remain lg:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <List className="size-6" />}
        </button>
      </div>

      {/* Desktop mega-menu panel */}
      {active && active.columns.length > 0 && (
        <div
          onMouseEnter={() => open(active.label)}
          onMouseLeave={scheduleClose}
          className="absolute inset-x-0 top-[88px] hidden lg:block"
        >
          <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8">
            <div className="ml-auto mr-0 w-full max-w-3xl rounded-token-16 border border-neutral-primary bg-card p-6 shadow-lg">
              <div className={cn('grid gap-x-8 gap-y-6', active.columns.length > 1 ? 'sm:grid-cols-3' : 'sm:grid-cols-1')}>
                {active.columns.map((col) => (
                  <div key={col.title}>
                    <p className="mb-3 text-label-medium font-semibold uppercase tracking-wider text-tertiary">{col.title}</p>
                    <ul className="flex flex-col gap-1">
                      {col.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block rounded-token-8 px-2 py-1.5 transition-colors duration-200 ease-standard hover:bg-secondary"
                          >
                            <span className="block text-paragraph-medium font-medium text-primary">{link.label}</span>
                            {link.desc && <span className="mt-0.5 block text-label-medium leading-snug text-tertiary">{link.desc}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="max-h-[calc(100vh-88px)] overflow-y-auto border-t border-brand-700 bg-brand-900 px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-6">
            {NAV.map((group) => (
              <div key={group.label}>
                <Link href={group.href} className="text-label-big font-semibold text-white-remain">
                  {group.label}
                </Link>
                {group.columns.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 pl-1">
                    {group.columns.flatMap((c) => c.links).map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="block py-1 text-paragraph-medium text-brand-100">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 border-t border-brand-700 pt-5">
              <Link href={SITE.loginHref} className="rounded-circle border border-brand-300 px-4 py-2.5 text-center text-paragraph-medium font-semibold text-white-remain">
                Masuk
              </Link>
              <Link href={SITE.demoHref} className="rounded-circle bg-white-remain px-4 py-2.5 text-center text-paragraph-medium font-semibold text-brand-token">
                Book a demo
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
