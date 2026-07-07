'use client'

import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { delocalizePath, langFromPathname, localizeHref, type Lang } from './locale'

/**
 * URL-derived language for the public marketing surface (/, /about, /blog, /blog/*).
 * Unlike the dashboard's `useLanguage()` (client state + localStorage, see
 * LanguageProvider.tsx), this has no Context and no persisted state: the current
 * URL is the only source of truth, so /en pages are always English server-side,
 * for real crawlers, not just for a client toggle.
 */
export function useMarketingLang(): { lang: Lang; setLang: (lang: Lang) => void; toggleLang: () => void } {
  const pathname = usePathname()
  const router = useRouter()
  const lang = langFromPathname(pathname)

  const navigateTo = useCallback(
    (next: Lang): void => {
      if (next === lang) return
      const logical = delocalizePath(pathname)
      router.push(localizeHref(logical, next))
    },
    [lang, pathname, router],
  )

  return {
    lang,
    setLang: navigateTo,
    toggleLang: () => navigateTo(lang === 'id' ? 'en' : 'id'),
  }
}
