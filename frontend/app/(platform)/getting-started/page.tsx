'use client'

import type { ReactElement, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { CheckCircleIcon } from '@/components/onboarding/icons'
import { PageContainer, PageHeader, Section, Card } from '@/components/dashboard/primitives'
import {
  ProjectsIcon,
  PromptsIcon,
  ChartBarsIcon,
  ResearchIcon,
  SuggestedIcon,
  ToolsIcon,
} from '@/components/dashboard/nav-icons'
import { useActiveProject, useGettingStartedProgress } from '@/lib/useActiveProject'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/cn'

/**
 * Getting Started, pixel-match of the Figma welcome screen (55:137 content):
 * welcome header (logo 48px + H3 + Paragraph/Medium), "Getting Started"
 * section (H6 heading, "n / 3" + 78px progress bar right, three display-brand
 * radius-16 cards), "How to use Fratello?" (three bordered radius-12 rows).
 * The empty Figma placeholders are filled with the real checklist + guides.
 */

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Welcome to Fratello',
    subtitle:
      'Mulai dari sini. Tiga langkah singkat di bawah membantu AI seperti ChatGPT dan Gemini mengenal dan menyebut brand Anda.',
    gettingStarted: 'Panduan Awal',
    step: (n: number): string => `Langkah ${n}`,
    steps: {
      project: {
        title: 'Buat project pertama',
        description: 'Daftarkan brand Anda: nama, website, industri, dan kompetitor.',
        cta: 'Buat project',
      },
      prompts: {
        title: 'Siapkan prompts',
        description:
          'Buat daftar pertanyaan yang akan kami tanyakan ke AI tentang brand Anda.',
        cta: 'Kelola prompts',
      },
      scan: {
        title: 'Jalankan scan pertama',
        description:
          'Kami menanyakan semua prompt Anda ke ChatGPT, Gemini, dan AI lainnya, lalu Anda melihat hasilnya.',
        cta: 'Jalankan scan',
      },
    },
    howToUse: 'Cara menggunakan Fratello?',
    guides: {
      research: {
        title: 'Riset prompt dari pertanyaan asli',
        description:
          'Temukan pertanyaan yang benar-benar dicari orang di Google & Reddit, lalu impor sebagai prompts.',
      },
      suggested: {
        title: 'Buat konten yang disarankan',
        description:
          'Buat artikel yang mudah dibaca AI dari prompt yang jawabannya belum menyebut brand Anda.',
      },
      tools: {
        title: 'Periksa website Anda untuk AI',
        description:
          'Lihat skor GEO Anda, yaitu seberapa siap website Anda dibaca AI. Buat file llms.txt dan atur akses bot AI.',
      },
    },
  },
  en: {
    title: 'Welcome to Fratello',
    subtitle:
      'This is where you start. The three short steps below help AI find and mention your brand.',
    gettingStarted: 'Getting Started',
    step: (n: number): string => `Step ${n}`,
    steps: {
      project: {
        title: 'Create your first project',
        description: 'Add your brand: name, website, industry, and competitors.',
        cta: 'Create project',
      },
      prompts: {
        title: 'Set up prompts',
        description: 'Generate the questions we will ask AI about your brand.',
        cta: 'Manage prompts',
      },
      scan: {
        title: 'Run your first scan',
        description:
          'We ask ChatGPT, Gemini, and other AIs your prompts, then you see the answers.',
        cta: 'Run scan',
      },
    },
    howToUse: 'How to use Fratello?',
    guides: {
      research: {
        title: 'Research prompts from real questions',
        description:
          'Find questions people really ask on Google & Reddit, then import them as prompts.',
      },
      suggested: {
        title: 'Generate suggested content',
        description:
          'Create articles AI can easily read, based on prompts where AI does not mention your brand yet.',
      },
      tools: {
        title: 'Check your website for AI',
        description:
          'See your GEO score, which shows how ready your website is for AI. Create your llms.txt file and manage AI bot access.',
      },
    },
  },
} as const

export default function GettingStartedPage(): ReactElement {
  const { projects, activeId } = useActiveProject()
  const progress = useGettingStartedProgress(activeId, projects.length > 0)
  const { lang } = useLanguage()
  const t = COPY[lang]

  const steps: Array<{
    title: string
    description: string
    done: boolean
    href: string
    cta: string
    icon: ReactNode
  }> = [
    {
      title: t.steps.project.title,
      description: t.steps.project.description,
      done: progress.hasProject,
      href: '/brands/new',
      cta: t.steps.project.cta,
      icon: <ProjectsIcon className="size-5" />,
    },
    {
      title: t.steps.prompts.title,
      description: t.steps.prompts.description,
      done: progress.hasPrompts,
      href: activeId ? `/brands/${activeId}/prompts` : '/brands',
      cta: t.steps.prompts.cta,
      icon: <PromptsIcon className="size-5" />,
    },
    {
      title: t.steps.scan.title,
      description: t.steps.scan.description,
      done: progress.hasResults,
      href: activeId ? `/brands/${activeId}` : '/brands',
      cta: t.steps.scan.cta,
      icon: <ChartBarsIcon className="size-5" />,
    },
  ]

  const guides: Array<{ title: string; description: string; href: string; icon: ReactNode }> = [
    {
      title: t.guides.research.title,
      description: t.guides.research.description,
      href: activeId ? `/brands/${activeId}/research` : '/brands',
      icon: <ResearchIcon className="size-5" />,
    },
    {
      title: t.guides.suggested.title,
      description: t.guides.suggested.description,
      href: activeId ? `/brands/${activeId}/articles` : '/brands',
      icon: <SuggestedIcon className="size-5" />,
    },
    {
      title: t.guides.tools.title,
      description: t.guides.tools.description,
      href: activeId ? `/brands/${activeId}/tools` : '/brands',
      icon: <ToolsIcon className="size-5" />,
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        icon={<FratelloLogo className="h-[30px] w-[48px]" />}
        title={t.title}
        subtitle={t.subtitle}
      />

      <Section
        title={t.gettingStarted}
        right={
          <>
            <span className="text-label-medium font-medium text-tertiary">
              {progress.done} / {progress.total}
            </span>
            <div className="w-[78px]">
              <ProgressBar progress={(progress.done / progress.total) * 100} thickness={4} />
            </div>
          </>
        }
      >
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div key={step.title} variants={fadeUp}>
              <Card
                variant="brand"
                className={cn(
                  'flex h-[204px] flex-col gap-2 p-4',
                  step.done && 'opacity-80',
                )}
              >
                <span className="flex items-center justify-between text-brand-token">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-card text-icon-brand transition-colors duration-300 ease-standard">
                    {step.icon}
                  </span>
                  {step.done && <CheckCircleIcon className="size-5 text-icon-brand" />}
                </span>
                <span className="mt-1 text-label-medium font-medium text-tertiary">{t.step(i + 1)}</span>
                <span className="text-label-big font-medium text-primary">{step.title}</span>
                <span className="flex-1 text-paragraph-medium text-secondary">{step.description}</span>
                {!step.done && (
                  <Link
                    href={step.href}
                    className="text-action-small font-medium text-brand-token underline-offset-2 transition-colors duration-200 ease-standard hover:underline"
                  >
                    {step.cta} →
                  </Link>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title={t.howToUse}>
        <div className="flex w-full flex-col gap-4">
          {guides.map((guide) => (
            <motion.div key={guide.title} variants={fadeUp}>
              <Link href={guide.href} className="block">
                <Card className="flex h-[57px] items-center gap-3 px-4 transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-display-brand text-icon-brand transition-colors duration-300 ease-standard">
                    {guide.icon}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-action-small font-medium text-primary">{guide.title}</span>
                    <span className="truncate text-paragraph-medium text-tertiary">{guide.description}</span>
                  </span>
                  <span className="shrink-0 text-tertiary" aria-hidden="true">
                    →
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>
    </PageContainer>
  )
}
