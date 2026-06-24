'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import { PageContainer, PageHeader, Card } from '@/components/dashboard/primitives'
import { Chip } from '@/components/ui'
import { CitationIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * Citations: the sources / URLs the AI references in its answers, a distinct
 * concept from brand mentions. The data needs backend extraction first
 * (see docs/README-BACKEND.md, FB-6), so this is an informative "coming soon".
 */
const COPY = {
  id: {
    title: 'Sitasi',
    subtitle: 'Sumber dan URL yang dirujuk AI saat menjawab. Berbeda dari penyebutan brand.',
    soon: 'Segera hadir',
    heading: 'Lihat sumber yang dirujuk AI',
    body: 'Sitasi menampilkan situs dan URL yang AI ambil sebagai rujukan dalam jawabannya, misalnya sumber yang dikutip Perplexity atau ChatGPT. Berbeda dari Penyebutan Brand: brand Anda bisa disebut tanpa situs Anda dirujuk, atau sebaliknya.',
    note: 'Tampilan ini sedang disiapkan. Backend perlu mengekstrak tautan sitasi dari jawaban AI yang sudah tersimpan sebelum data ini bisa muncul.',
  },
  en: {
    title: 'Citations',
    subtitle: 'The sources and URLs the AI references when it answers. Different from brand mentions.',
    soon: 'Coming soon',
    heading: 'See the sources AI references',
    body: 'Citations show the websites and URLs the AI pulls from as references in its answers, for example the sources Perplexity or ChatGPT cite. This is different from Mentions: your brand can be mentioned without your site being cited, or the other way around.',
    note: 'This view is being built. The backend needs to extract citation links from the stored AI answers before this data can appear.',
  },
} as const

export default function CitationsPage(): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  return (
    <PageContainer wide>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <motion.div variants={fadeUp} className="w-full">
        <Card className="flex w-full flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
            <CitationIcon className="size-6" />
          </span>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <h3 className="text-label-big font-medium text-primary">{t.heading}</h3>
              <Chip type="warning" size="sm">
                {t.soon}
              </Chip>
            </div>
            <p className="max-w-lg text-paragraph-medium text-secondary">{t.body}</p>
            <p className="max-w-lg text-label-medium text-tertiary">{t.note}</p>
          </div>
        </Card>
      </motion.div>
    </PageContainer>
  )
}
