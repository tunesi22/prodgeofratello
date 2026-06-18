import Link from 'next/link'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { House as PhosphorHouse } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'

/**
 * Breadcrumb, implemented 1:1 from `.design/specs/breadcrumb.md`
 * (Figma component set 2029:2325).
 *
 * The Figma set defines a single breadcrumb ITEM (icon + label) with one
 * `States` prop: Idle | Hover | Active. This component renders the full trail
 * (`nav > ol > li`); the LAST item is the Active (current page) state, every
 * other item is an Idle/Hover link when it has an `href`.
 *
 * State rules per spec:
 * - Idle: label `text-tertiary`, icon `icon-light-gray`, no underline.
 * - Hover: same colors, label underlined (from-font position/thickness).
 *   Focus-visible mirrors hover for keyboard users (no focus ring in this DS).
 * - Active: label `text-brand`, icon `icon-brand`, no underline,
 *   non-interactive (`aria-current="page"`).
 * - Anatomy: 20×20 icon slot, 4px icon↔label gap (Gaps/gap-4),
 *   Paragraph/Small 12/16 regular, no padding, no background, no radius.
 * - No separator glyph is defined in the Figma set, so none renders by
 *   default; an optional `separator` slot is exposed for composition.
 */

export interface BreadcrumbItem {
  /** Visible label, Paragraph/Small (12/16), regular weight. */
  label: string
  /** Destination URL. Non-last items with an href render as Next.js links. */
  href?: string
  /** Optional leading icon (20×20 slot; inherits the state color via currentColor). */
  icon?: ReactNode
}

export interface BreadcrumbProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Trail items in order. The last item is the Active (current page) state. */
  items: BreadcrumbItem[]
  /**
   * Optional separator rendered between items (aria-hidden). The Figma set
   * defines no separator glyph, so the default is none.
   */
  separator?: ReactNode
}

// Shared item anatomy: flex row, 4px icon↔label gap, Paragraph/Small regular.
const ITEM_BASE = 'inline-flex items-center gap-1 text-paragraph-medium font-normal'

// Idle → Hover: color stays text-tertiary; hover only adds the underline
// (solid, from-font position/thickness per spec). Focus-visible mirrors hover.
const LINK_CLASSES =
  'text-tertiary decoration-from-font [text-underline-position:from-font] transition-colors duration-200 ease-standard hover:underline focus-visible:underline focus-visible:outline-none'

/**
 * House icon (Phosphor: House, the same glyph the Figma spec exported from the
 * DS icon set). currentColor so the state color flows from the wrapper.
 */
export function BreadcrumbHomeIcon(): ReactElement {
  return <PhosphorHouse size={20} aria-hidden="true" className="size-5" />
}

export function Breadcrumb({
  items,
  separator,
  className,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...rest
}: BreadcrumbProps): ReactElement {
  return (
    <nav {...rest} aria-label={ariaLabel} className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isActive = index === items.length - 1
          const href = !isActive ? item.href : undefined

          const content = (
            <>
              {item.icon ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center [&>svg]:size-full',
                    isActive ? 'text-icon-brand' : 'text-icon-light-gray'
                  )}
                >
                  {item.icon}
                </span>
              ) : null}
              <span className="whitespace-nowrap">{item.label}</span>
            </>
          )

          return (
            <li key={index} className="inline-flex items-center gap-2">
              {index > 0 && separator != null ? (
                <span
                  aria-hidden="true"
                  className="flex select-none items-center text-paragraph-medium font-normal text-tertiary"
                >
                  {separator}
                </span>
              ) : null}
              {href ? (
                <Link href={href} className={cn(ITEM_BASE, LINK_CLASSES)}>
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    ITEM_BASE,
                    isActive ? 'text-brand-token' : 'text-tertiary'
                  )}
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
