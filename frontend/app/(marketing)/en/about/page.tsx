import type { ReactElement } from 'react'
import { AboutPage } from '@/components/marketing/AboutPage'
import { pageMetadata, organizationJsonLd } from '@/lib/marketing/seo'
import { JsonLd } from '@/components/marketing/JsonLd'

export const metadata = pageMetadata({
  title: 'About Fratello',
  description:
    'Fratello is a GEO (Generative Engine Optimization) platform that tracks, analyzes, and raises how often your brand is mentioned by ChatGPT, Gemini, Perplexity, and Claude.',
  path: '/about',
  lang: 'en',
})

/** Server wrapper: exports metadata and renders the (client) bilingual about page, English mirror. */
export default function Page(): ReactElement {
  return (
    <>
      <JsonLd data={[organizationJsonLd('en')]} />
      <AboutPage />
    </>
  )
}
