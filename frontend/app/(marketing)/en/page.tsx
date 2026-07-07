import type { ReactElement } from 'react'
import { JsonLd } from '@/components/marketing/JsonLd'
import { LandingPage } from '@/components/marketing/LandingPage'
import { pageMetadata, organizationJsonLd, webSiteJsonLd, softwareApplicationJsonLd } from '@/lib/marketing/seo'

export const metadata = pageMetadata({
  title: 'GEO Platform for Indonesia',
  description:
    'Fratello tracks how often your brand is mentioned by ChatGPT, Gemini, Perplexity, and Claude, then helps you raise it automatically. GEO (Generative Engine Optimization) for the Indonesian market.',
  path: '/',
  lang: 'en',
})

/** Server wrapper: exports metadata and renders the (client) bilingual landing, English mirror. */
export default function HomePage(): ReactElement {
  return (
    <>
      <JsonLd data={[organizationJsonLd('en'), webSiteJsonLd('en'), softwareApplicationJsonLd('en')]} />
      <LandingPage />
    </>
  )
}
