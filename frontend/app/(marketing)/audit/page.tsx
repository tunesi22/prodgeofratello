import type { ReactElement } from 'react'
import { AuditGeoPage } from '@/components/marketing/audit/AuditGeoPage'
import { pageMetadata } from '@/lib/marketing/seo'

export const metadata = pageMetadata({
  title: 'Audit GEO Gratis',
  description:
    'Cek GEO Score website Anda gratis: seberapa siap website Anda dibaca ChatGPT, Gemini, Perplexity, dan Claude, lengkap dengan daftar perbaikannya.',
  path: '/audit',
})

/** Server wrapper: exports metadata and renders the (client) bilingual audit page. */
export default function Page(): ReactElement {
  return <AuditGeoPage />
}
