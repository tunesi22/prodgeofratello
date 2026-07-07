'use client'

import { useState, type ReactElement, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Eye, ChartBar, Quotes, ShieldCheck, Atom, Sparkle, ShareNetwork, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { useMarketingLang } from '@/lib/marketing/useMarketingLang'
import { MARKETING_COPY } from '@/lib/marketing/copy'
import {
  TrackingPanel,
  AnalyticsPanel,
  CitationsList,
  SemanticGraph,
  ArticlePreview,
  GeoAuditPanel,
  DistributionPanel,
} from '@/components/marketing/visuals'
import { cn } from '@/lib/cn'

/**
 * Tabbed feature showcase: a row of tab pills selects a capability, and the
 * panel below shows that feature's copy (left) and a token-built mockup (right).
 * Cleaner than the old stacked splits + bento. Content cross-fades on switch.
 */
function PanelShell({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-token-24 border border-neutral-primary bg-card p-6">
      {children}
    </div>
  )
}

export function FeatureTabs(): ReactElement {
  const { lang } = useMarketingLang()
  const f = MARKETING_COPY[lang].features
  const [active, setActive] = useState(0)

  // Order must match f.tabs.
  const items: { Icon: Icon; title: string; desc: string; points?: string[]; visual: ReactNode }[] = [
    { Icon: Eye, title: f.lacak.title, desc: f.lacak.lead, points: f.lacak.bullets, visual: <TrackingPanel /> },
    { Icon: ChartBar, title: f.analisis.title, desc: f.analisis.lead, points: f.analisis.bullets, visual: <AnalyticsPanel /> },
    {
      Icon: Quotes,
      title: f.citations.title,
      desc: f.citations.desc,
      points: f.citations.points,
      visual: (
        <PanelShell>
          <div className="w-full max-w-md">
            <CitationsList />
          </div>
        </PanelShell>
      ),
    },
    {
      Icon: ShieldCheck,
      title: f.audit.title,
      desc: f.audit.desc,
      points: f.audit.checklist,
      visual: <GeoAuditPanel />,
    },
    {
      Icon: Atom,
      title: f.semantic.title,
      desc: f.semantic.desc,
      points: f.semantic.points,
      visual: <SemanticGraph />,
    },
    {
      Icon: Sparkle,
      title: f.article.title,
      desc: f.article.desc,
      points: f.article.points,
      visual: <ArticlePreview />,
    },
    {
      Icon: ShareNetwork,
      title: f.distribution.title,
      desc: f.distribution.desc,
      points: f.distribution.points,
      visual: <DistributionPanel />,
    },
  ]

  const cur = items[active]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap justify-center gap-2">
        {f.tabs.map((label, i) => {
          const TabIcon = items[i].Icon
          const isActive = i === active
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-2 rounded-token-12 px-4 py-2.5 text-paragraph-medium font-semibold transition-colors duration-200 ease-standard',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'border border-neutral-primary bg-card text-secondary hover:border-brand-token hover:text-brand-token',
              )}
            >
              <TabIcon className="size-4 shrink-0" weight={isActive ? 'fill' : 'regular'} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Panel — copy left, mockup right */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.5, 0, 0.2, 1] }}
        className="mt-12 grid items-center gap-10 lg:grid-cols-2"
      >
        <div>
          <h3 className="text-h4 font-semibold tracking-tight text-primary lg:text-h3">{cur.title}</h3>
          <p className="mt-4 text-paragraph-big leading-relaxed text-neutral-500">{cur.desc}</p>
          {cur.points != null && (
            <ul className="mt-6 flex flex-col gap-3">
              {cur.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-paragraph-medium font-medium text-secondary">
                  <CheckCircle className="size-5 shrink-0 text-icon-brand" weight="fill" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>{cur.visual}</div>
      </motion.div>
    </div>
  )
}
