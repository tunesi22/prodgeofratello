import type { ReactElement } from 'react'
import { AboutPage } from '@/components/marketing/AboutPage'
import { pageMetadata, organizationJsonLd } from '@/lib/marketing/seo'
import { JsonLd } from '@/components/marketing/JsonLd'

export const metadata = pageMetadata({
  title: 'Tentang Fratello',
  description:
    'Fratello adalah platform GEO (Generative Engine Optimization) yang melacak, menganalisis, dan menaikkan seberapa sering brand Anda disebut ChatGPT, Gemini, Perplexity, dan Claude.',
  path: '/about',
})

/** Server wrapper: exports metadata and renders the (client) bilingual about page. */
export default function Page(): ReactElement {
  return (
    <>
      <JsonLd data={[organizationJsonLd()]} />
      <AboutPage />
    </>
  )
}
