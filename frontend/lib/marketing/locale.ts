export type Lang = 'id' | 'en'

export const EN_PREFIX = '/en'

/** Logical paths that are part of the localized marketing surface. Everything
 * else (dashboard routes, /sign-in, etc.) never gets an /en prefix. */
export function isLocalizedPath(path: string): boolean {
  return path === '/' || path === '/about' || path === '/blog' || path.startsWith('/blog/')
}

/** Given a logical (Indonesian-shaped) path, return the concrete href for `lang`. */
export function localizeHref(path: string, lang: Lang): string {
  if (path.startsWith('#')) return path
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path // http(s):, mailto:, tel:, etc.
  if (lang === 'id' || !isLocalizedPath(path)) return path
  return path === '/' ? EN_PREFIX : `${EN_PREFIX}${path}`
}

/** Cross-page href for a homepage section anchor, e.g. '#fitur' -> '/#fitur' or '/en#fitur'. */
export function localizeHomeHash(hash: string, lang: Lang): string {
  return lang === 'en' ? `${EN_PREFIX}${hash}` : `/${hash}`
}

/** Strip a leading /en from a pathname to recover the logical (Indonesian-shaped) path. */
export function delocalizePath(pathname: string): string {
  if (pathname === EN_PREFIX) return '/'
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length)
  return pathname
}

export function langFromPathname(pathname: string): Lang {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'id'
}
