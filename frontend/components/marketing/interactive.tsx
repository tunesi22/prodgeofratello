'use client'

import { useState, type ReactElement, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Plus, Minus } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'

/**
 * Marketing interactive bits (client): scroll-reveal wrapper and the FAQ
 * accordion. Motion is gentle (fade + short vertical drift) and disabled under
 * prefers-reduced-motion.
 */

/** Fade + rise into view, once. `delay` staggers siblings. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}): ReactElement {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.5, 0, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export interface FaqItem {
  q: string
  a: string
}

/** Single-open accordion list. */
export function FAQ({ items }: { items: FaqItem[] }): ReactElement {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={item.q}
            className={cn(
              'overflow-hidden rounded-2xl border bg-card transition-colors duration-200',
              isOpen ? 'border-brand-token' : 'border-neutral-primary',
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span className="flex-1 text-[16px] font-semibold text-primary">{item.q}</span>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-[cubic-bezier(0.5,0,0.2,1)]',
                  isOpen ? 'bg-brand-600 text-white-remain' : 'bg-secondary text-tertiary',
                )}
              >
                {isOpen ? <Minus className="size-4" weight="bold" /> : <Plus className="size-4" weight="bold" />}
              </span>
            </button>
            <div
              className={cn(
                'grid transition-all duration-300 ease-[cubic-bezier(0.5,0,0.2,1)]',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-neutral-500">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
