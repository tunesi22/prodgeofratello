'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, EASE_EXIT, EASE_STANDARD } from '@/lib/motion'
import { cn } from '@/lib/cn'

/**
 * Popover, a small floating panel anchored to a trigger, opened on hover AND
 * focus (so it is keyboard-reachable). Intended for inline help: a "?" icon
 * next to a heading that reveals an explanation, replacing long inline prose.
 *
 * The panel is PORTALED to document.body and positioned with `position: fixed`
 * from the trigger's viewport rect. This is deliberate: in-flow absolute
 * positioning gets clipped by any ancestor that constrains overflow (tables use
 * overflow-x-auto, which also clips vertically; Cards use overflow-hidden), so a
 * portal is the only way the panel renders fully EVERYWHERE — including inside
 * scrollable tables. Position recomputes on scroll/resize while open.
 *
 * NOTE: not yet a Figma design-system component (no spec exists). Added on
 * request; styled entirely with DS tokens and motion tokens. It supersedes the
 * onboarding HelpTooltip. If a popover is later designed in Figma, swap to it.
 */
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'
/**
 * Cross-axis alignment of the panel against the trigger. Use 'end' for triggers
 * near the right/bottom viewport edge so the panel opens inward instead of
 * overflowing (a centered panel on an edge trigger gets clipped).
 */
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps {
  /** Floating panel content (kept inline-level so it can live next to text). */
  content: ReactNode
  /** Trigger element (e.g. a QuestionIcon). Opens the panel on hover/focus. */
  children: ReactNode
  /** Side of the trigger the panel opens on. Default 'top'. */
  side?: PopoverSide
  /** Cross-axis alignment. Default 'center'. */
  align?: PopoverAlign
  /** Accessible label for the trigger. */
  label?: string
  /** Width/sizing class for the panel. Default 'w-72'. */
  panelClassName?: string
  className?: string
}

interface Coords {
  left: number
  top: number
  transform: string
}

// Gap between trigger and panel, in px (matches the old mb-2/mt-2 = 8px).
const GAP = 8

/**
 * Fixed-position coords + a panel-relative transform, computed from the trigger
 * rect. The transform shifts the panel by its own size (so we never need to
 * measure the panel): e.g. side=top/align=center → translate(-50%, -100%).
 */
function computeCoords(rect: DOMRect, side: PopoverSide, align: PopoverAlign): Coords {
  if (side === 'top' || side === 'bottom') {
    const left = align === 'start' ? rect.left : align === 'end' ? rect.right : rect.left + rect.width / 2
    const tx = align === 'start' ? '0' : align === 'end' ? '-100%' : '-50%'
    return side === 'top'
      ? { left, top: rect.top - GAP, transform: `translate(${tx}, -100%)` }
      : { left, top: rect.bottom + GAP, transform: `translate(${tx}, 0)` }
  }
  const top = align === 'start' ? rect.top : align === 'end' ? rect.bottom : rect.top + rect.height / 2
  const ty = align === 'start' ? '0' : align === 'end' ? '-100%' : '-50%'
  return side === 'left'
    ? { left: rect.left - GAP, top, transform: `translate(-100%, ${ty})` }
    : { left: rect.right + GAP, top, transform: `translate(0, ${ty})` }
}

export function Popover({
  content,
  children,
  side = 'top',
  align = 'center',
  label,
  panelClassName,
  className,
}: PopoverProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => setMounted(true), [])

  const reposition = useCallback(() => {
    const el = triggerRef.current
    if (el != null) setCoords(computeCoords(el.getBoundingClientRect(), side, align))
  }, [side, align])

  function show(): void {
    reposition()
    setOpen(true)
  }
  function hide(): void {
    setOpen(false)
  }

  // While open, follow the trigger if the page or any container scrolls/resizes.
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, reposition])

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        tabIndex={0}
        role="button"
        aria-label={label}
        className="inline-flex cursor-help text-tertiary outline-none transition-colors duration-200 ease-standard hover:text-secondary focus-visible:text-brand-token"
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && coords != null && (
              <motion.div
                // Outer (portaled, fixed): position only; animates opacity. The
                // panel-relative transform lives on the inner div so framer's
                // opacity animation can't clobber the centering.
                style={{ position: 'fixed', left: coords.left, top: coords.top, zIndex: 60 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: DURATION.short, ease: EASE_STANDARD } }}
                exit={{ opacity: 0, transition: { duration: DURATION.short, ease: EASE_EXIT } }}
              >
                <div style={{ transform: coords.transform }}>
                  <span
                    role="tooltip"
                    className={cn(
                      'flex flex-col gap-1 rounded-token-12 border border-neutral-primary bg-card px-3 py-2',
                      'text-paragraph-medium font-normal text-secondary shadow-regular-md',
                      panelClassName ?? 'w-72',
                    )}
                  >
                    {content}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  )
}
