import type { ReactElement } from 'react'
import { JsonLd } from '@/components/marketing/JsonLd'
import { LandingPage } from '@/components/marketing/LandingPage'
import { pageMetadata, organizationJsonLd, webSiteJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/seo'

export const metadata = pageMetadata({
  title: 'Platform GEO untuk Indonesia',
  description:
    'Fratello memantau seberapa sering brand Anda disebut di ChatGPT, Gemini, Perplexity, dan Claude, lalu membantu menaikkannya secara otomatis. GEO (Generative Engine Optimization) untuk pasar Indonesia.',
  path: '/',
})

/** Server wrapper: exports metadata and renders the (client) bilingual landing. */
export default function HomePage(): ReactElement {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd(), softwareApplicationJsonLd()]} />
      <LandingPage />
    </>
  )
}
