import type { Metadata } from 'next'
import { SITE } from './site'
import { localizeHref, type Lang } from './locale'
import { MARKETING_COPY } from './copy'

/**
 * Per-page metadata builder for the marketing site. Produces a canonical URL,
 * hreflang alternates (id/en/x-default), Open Graph, and Twitter card from one
 * call so every page is SEO-consistent across both locales.
 *
 * Usage in a page/layout:
 *   export const metadata = pageMetadata({
 *     title: 'GEO vs SEO',
 *     description: '...',
 *     path: '/blog/geo-vs-seo',
 *     lang: 'en',
 *   })
 */
interface PageMetaInput {
  title: string
  description: string
  /** Logical (Indonesian-shaped) absolute path beginning with "/", e.g. '/about', '/blog/apa-itu-geo'. */
  path: string
  /** Locale this specific page renders in. Defaults to 'id'. */
  lang?: Lang
  /** Set true on utility pages that should not be indexed (e.g. /sign-in). */
  noindex?: boolean
  /** Optional social share image path (relative to the site root). */
  image?: string
}

export function pageMetadata({ title, description, path, lang = 'id', noindex, image }: PageMetaInput): Metadata {
  const url = `${SITE.url}${localizeHref(path, lang)}`
  const ogImage = image ?? '/og-default.jpg'
  const fullTitle =
    path === '/'
      ? lang === 'en'
        ? `${SITE.name}, the GEO Platform for Indonesia`
        : `${SITE.name}, Platform GEO untuk Indonesia`
      : `${title} | ${SITE.name}`
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        id: `${SITE.url}${localizeHref(path, 'id')}`,
        en: `${SITE.url}${localizeHref(path, 'en')}`,
        'x-default': `${SITE.url}${localizeHref(path, 'id')}`,
      },
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: lang === 'en' ? 'en_US' : 'id_ID',
      url,
      title: fullTitle,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}

/** A single breadcrumb step. */
export interface Crumb {
  name: string
  path: string
}

/** Build a schema.org BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbJsonLd(crumbs: Crumb[], lang: Lang = 'id'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${localizeHref(c.path, lang)}`,
    })),
  }
}

/** schema.org Organization, emitted once on the homepage. */
export function organizationJsonLd(lang: Lang = 'id'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: MARKETING_COPY[lang].footer.tagline,
    sameAs: [],
  }
}

/** schema.org WebSite with a search action, emitted once on the homepage. */
export function webSiteJsonLd(lang: Lang = 'id'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: `${SITE.url}${localizeHref('/', lang)}`,
    inLanguage: lang === 'en' ? 'en-US' : 'id-ID',
  }
}

/** schema.org SoftwareApplication for the product. */
export function softwareApplicationJsonLd(lang: Lang = 'id'): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: MARKETING_COPY[lang].footer.tagline,
    offers: { '@type': 'Offer', priceCurrency: 'IDR' },
  }
}

/** schema.org FAQPage from question/answer pairs. */
export function faqJsonLd(items: Array<{ q: string; a: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}
