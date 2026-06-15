'use client'

import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, EASE_EXIT, EASE_STANDARD } from '@/lib/motion'
import { cn } from '@/lib/cn'

export interface HelpTooltipProps {
  /** Tooltip text shown on hover/focus. */
  label: string
  /** The trigger (e.g. a question-mark icon). */
  children: ReactNode
  className?: string
}

/**
 * Lightweight hover/focus tooltip. NOTE: not part of the Figma design system
 * (no tooltip component exists there yet), added on request. Styled entirely
 * with DS tokens; if a tooltip is later designed in Figma, swap to it.
 */
export function HelpTooltip({ label, children, className }: HelpTooltipProps): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span tabIndex={0} className="inline-flex cursor-help focus:outline-none" aria-label={label}>
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: DURATION.short, ease: EASE_STANDARD } }}
            exit={{ opacity: 0, y: 4, transition: { duration: DURATION.short, ease: EASE_EXIT } }}
            className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-token-8 border border-neutral-primary bg-card px-3 py-2 text-paragraph-medium text-secondary shadow-regular-md"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
