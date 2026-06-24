import type { Metadata } from 'next'
import { SITE } from './site'

/**
 * Per-page metadata builder for the marketing site. Produces a canonical URL,
 * Open Graph, and Twitter card from one call so every page is SEO-consistent.
 *
 * Usage in a page/layout:
 *   export const metadata = pageMetadata({
 *     title: 'GEO vs SEO',
 *     description: '...',
 *     path: '/belajar/geo-vs-seo',
 *   })
 */
interface PageMetaInput {
  title: string
  description: string
  /** Absolute path beginning with "/". Used for the canonical URL. */
  path: string
  /** Set true on utility pages that should not be indexed (e.g. /sign-in). */
  noindex?: boolean
  /** Optional social share image path (relative to the site root). */
  image?: string
}

export function pageMetadata({ title, description, path, noindex, image }: PageMetaInput): Metadata {
  const url = `${SITE.url}${path}`
  const ogImage = image ?? '/og-default.jpg'
  const fullTitle = path === '/' ? `${SITE.name}, Platform GEO untuk Indonesia` : `${title} | ${SITE.name}`
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
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
export function breadcrumbJsonLd(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path}`,
    })),
  }
}

/** schema.org Organization, emitted once on the homepage. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    description: SITE.tagline,
    sameAs: [],
  }
}

/** schema.org WebSite with a search action, emitted once on the homepage. */
export function webSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'id-ID',
  }
}

/** schema.org SoftwareApplication for the product. */
export function softwareApplicationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SITE.tagline,
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
