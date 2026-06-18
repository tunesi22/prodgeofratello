'use client'

import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_EXIT, EASE_STANDARD } from '@/lib/motion'
import { cn } from '@/lib/cn'

/**
 * Popover, a small floating panel anchored to a trigger, opened on hover AND
 * focus (so it is keyboard-reachable). Intended for inline help: a "?" icon
 * next to a heading that reveals an explanation, replacing long inline prose.
 *
 * NOTE: not yet a Figma design-system component (no spec exists). Added on
 * request; styled entirely with DS tokens and motion tokens. It supersedes the
 * onboarding HelpTooltip. If a popover is later designed in Figma, swap to it.
 */
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverProps {
  /** Floating panel content (kept inline-level so it can live next to text). */
  content: ReactNode
  /** Trigger element (e.g. a QuestionIcon). Opens the panel on hover/focus. */
  children: ReactNode
  /** Side of the trigger the panel opens on. Default 'top'. */
  side?: PopoverSide
  /** Accessible label for the trigger. */
  label?: string
  /** Width/sizing class for the panel. Default 'w-72'. */
  panelClassName?: string
  className?: string
}

// Position of the panel relative to the inline-flex trigger wrapper.
const SIDE_CLASSES: Record<PopoverSide, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
}

// Small directional drift on enter/exit (vertical+opacity only per motion rules).
const ENTER_OFFSET: Record<PopoverSide, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
}

export function Popover({
  content,
  children,
  side = 'top',
  label,
  panelClassName,
  className,
}: PopoverProps): ReactElement {
  const [open, setOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const offset = ENTER_OFFSET[side]

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        role="button"
        aria-label={label}
        className="inline-flex cursor-help text-tertiary outline-none transition-colors duration-200 ease-standard hover:text-secondary focus-visible:text-brand-token"
      >
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, ...offset }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
              transition: { duration: DURATION.short, ease: EASE_STANDARD },
            }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, ...offset, transition: { duration: DURATION.short, ease: EASE_EXIT } }
            }
            className={cn(
              'absolute z-50 flex flex-col gap-1 rounded-token-12 border border-neutral-primary bg-card px-3 py-2',
              'text-paragraph-medium font-normal text-secondary shadow-regular-md',
              SIDE_CLASSES[side],
              panelClassName ?? 'w-72',
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
