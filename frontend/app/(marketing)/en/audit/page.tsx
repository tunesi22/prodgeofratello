import type { ReactElement } from 'react'
import { AuditGeoPage } from '@/components/marketing/audit/AuditGeoPage'
import { pageMetadata } from '@/lib/marketing/seo'

export const metadata = pageMetadata({
  title: 'Free GEO Audit',
  description:
    'Check your website GEO Score for free: how ready it is to be read by ChatGPT, Gemini, Perplexity, and Claude, with a full list of fixes.',
  path: '/audit',
  lang: 'en',
})

/** Server wrapper: exports metadata and renders the (client) bilingual audit page, English mirror. */
export default function Page(): ReactElement {
  return <AuditGeoPage />
}
