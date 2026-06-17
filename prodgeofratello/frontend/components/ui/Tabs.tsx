'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { DURATION, EASE_STANDARD } from '@/lib/motion'

/**
 * Tabs, implemented 1:1 from `.design/specs/tab.md` (Figma node 57:28852).
 *
 * Tab item states (single `Style` variant):
 * - Active:   label `text-brand-token` + 1px bottom underline in `icon-brand`.
 * - Idle:     label `text-secondary-invert`, no underline.
 * - Disabled: label `text-disabled`, no underline, no pointer/press response.
 *
 * Anatomy per spec: flex row, centered; padding 16px × 8px (wrap-16 / wrap-8);
 * Label/Big typography (16px / 24px line-height, medium); no background fill,
 * no radius. The underline is rendered as an absolutely-positioned 1px bar
 * (instead of a border-bottom) so it can slide between tabs via framer-motion
 * `layoutId` without shifting layout; tab height stays 40px in every state.
 *
 * Motion: underline slides with standard easing at 200ms (short distance).
 * `prefers-reduced-motion` disables the shared-layout slide entirely.
 *
 * A11y: `role="tablist"` / `role="tab"` + `aria-selected`, roving tabindex,
 * ArrowLeft/ArrowRight/Home/End keyboard activation (disabled tabs skipped).
 * Focus-visible uses the DS transparent-surface pressed scrim
 * (`bg-btn-ghost-pressed`), the tab spec defines no pressed/focused state,
 * so keyboard focus borrows the system-wide treatment for visibility.
 * Pass `aria-label` (or `aria-labelledby`) describing the tab set.
 */

export interface TabItem {
  /** Unique, stable id, compared against `activeId`. */
  id: string
  /**
   * Visible tab label. Text per spec; also accepts a node so a leading brand
   * logo can sit beside the text (e.g. provider marks on the model filter).
   */
  label: React.ReactNode
  /** Disabled tab: `text-disabled`, not focusable, skipped by arrow keys. */
  disabled?: boolean
}

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tabs to render, in order. */
  items: TabItem[]
  /** Id of the currently active tab (controlled). */
  activeId: string
  /** Called with the id of the tab the user activates (click or keyboard). */
  onChange?: (id: string) => void
  className?: string
}

export function Tabs({
  items,
  activeId,
  onChange,
  className,
  ...rest
}: TabsProps): React.JSX.Element {
  const underlineId = React.useId()
  const prefersReducedMotion = useReducedMotion()
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  // Roving tabindex: the active tab is the tab stop. If `activeId` matches no
  // enabled tab, fall back to the first enabled tab so the tablist stays
  // keyboard-reachable.
  const focusableId = items.some(
    (item) => item.id === activeId && !item.disabled
  )
    ? activeId
    : items.find((item) => !item.disabled)?.id

  const focusAndActivate = (id: string): void => {
    tabRefs.current.get(id)?.focus()
    onChange?.(id)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    fromId: string
  ): void => {
    const enabledItems = items.filter((item) => !item.disabled)
    if (enabledItems.length === 0) return

    // Navigate relative to the focused tab (disabled tabs never receive focus,
    // so `fromId` is always present in `enabledItems`).
    const currentIndex = enabledItems.findIndex((item) => item.id === fromId)
    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % enabledItems.length
        break
      case 'ArrowLeft':
        nextIndex =
          (currentIndex - 1 + enabledItems.length) % enabledItems.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = enabledItems.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    focusAndActivate(enabledItems[nextIndex].id)
  }

  return (
    <div role="tablist" {...rest} className={cn('flex items-center', className)}>
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            ref={(node) => {
              if (node) tabRefs.current.set(item.id, node)
              else tabRefs.current.delete(item.id)
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            tabIndex={item.id === focusableId ? 0 : -1}
            onClick={() => onChange?.(item.id)}
            onKeyDown={(event) => handleKeyDown(event, item.id)}
            className={cn(
              // anatomy: flex centered, wrap-16 / wrap-8 padding, Label/Big medium
              'relative inline-flex items-center justify-center px-4 py-2',
              'whitespace-nowrap text-label-big font-medium',
              'transition-colors duration-200 ease-standard',
              // keyboard focus: DS transparent-surface pressed scrim, no ring
              'outline-none focus-visible:bg-btn-ghost-pressed',
              'disabled:cursor-not-allowed',
              isActive
                ? 'text-brand-token'
                : item.disabled
                  ? 'text-disabled'
                  : 'text-secondary-invert'
            )}
          >
            {item.label}
            {isActive ? (
              // Active underline: 1px solid Icons/icon-brand per spec.
              <motion.span
                aria-hidden="true"
                layoutId={prefersReducedMotion ? undefined : underlineId}
                transition={{ duration: DURATION.short, ease: EASE_STANDARD }}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-icon-brand"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
