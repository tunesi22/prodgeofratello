import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Chip, implemented 1:1 from `.design/specs/chips.md` (Figma node 53:25653).
 *
 * Variant matrix: type (neutral | success | error | warning) × shape
 * (squared | rounded) × size (sm | md) × outlined, with optional
 * iconLeft / iconRight (20px at SM, 24px at MD).
 *
 * Token rules per spec:
 * - Neutral filled: display-neutral bg, text-primary
 * - Neutral outlined: NO bg, text-primary, border-neutral-tertiary
 * - Success: display-brand bg, text-brand; outlined adds border-brand (bg stays)
 * - Error: display-error bg, text-error; outlined adds border-error (bg stays)
 * - Warning: display-warning bg, text-warning; outlined adds border-warning (bg stays)
 */

export type ChipType = 'neutral' | 'success' | 'error' | 'warning'
export type ChipShape = 'squared' | 'rounded'
export type ChipSize = 'sm' | 'md'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic color variant. Default: 'neutral'. */
  type?: ChipType
  /** Corner treatment: squared (radius-8/4) or rounded (pill). Default: 'squared'. */
  shape?: ChipShape
  /** Size: md (16px label, py-8) or sm (14px label, py-4). Default: 'md'. */
  size?: ChipSize
  /** Outlined variant. Only neutral drops the bg; others keep tinted bg + border. */
  outlined?: boolean
  /** Optional leading icon (rendered at 20px SM / 24px MD, inherits text color). */
  iconLeft?: ReactNode
  /** Optional trailing icon (rendered at 20px SM / 24px MD, inherits text color). */
  iconRight?: ReactNode
  /** Chip label content. */
  children?: ReactNode
}

const TYPE_CLASSES: Record<ChipType, { filled: string; outlined: string }> = {
  neutral: {
    filled: 'bg-display-neutral text-primary',
    outlined: 'text-primary border border-neutral-tertiary',
  },
  success: {
    filled: 'bg-display-brand text-brand-token',
    outlined: 'bg-display-brand text-brand-token border border-brand-token',
  },
  error: {
    filled: 'bg-display-error text-error-token',
    outlined: 'bg-display-error text-error-token border border-error-token',
  },
  warning: {
    filled: 'bg-display-warning text-warning-token',
    outlined: 'bg-display-warning text-warning-token border border-warning-token',
  },
}

const SIZE_CLASSES: Record<ChipSize, string> = {
  // MD: Figtree Medium 16px / 24px line-height, py 8
  md: 'text-label-big font-medium py-2',
  // SM: Figtree Medium 14px / 20px line-height, py 4
  sm: 'text-label-medium font-medium py-1',
}

// Horizontal padding depends on shape: squared px-12, rounded px-16.
const SHAPE_PADDING: Record<ChipShape, string> = {
  squared: 'px-3',
  rounded: 'px-4',
}

// Radius: MD squared 8px, SM squared 4px, rounded always pill (400px).
const RADIUS_CLASSES: Record<ChipShape, Record<ChipSize, string>> = {
  squared: { md: 'rounded-token-8', sm: 'rounded-token-4' },
  rounded: { md: 'rounded-circle', sm: 'rounded-circle' },
}

// Icon box: 20px at SM, 24px at MD; icons inherit currentColor from the chip.
const ICON_SIZE_CLASSES: Record<ChipSize, string> = {
  md: 'size-6',
  sm: 'size-5',
}

export function Chip({
  type = 'neutral',
  shape = 'squared',
  size = 'md',
  outlined = false,
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: ChipProps): ReactElement {
  const iconClass = cn(
    'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
    ICON_SIZE_CLASSES[size]
  )

  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center gap-2',
        'transition-colors duration-200 ease-standard',
        SIZE_CLASSES[size],
        SHAPE_PADDING[shape],
        RADIUS_CLASSES[shape][size],
        outlined ? TYPE_CLASSES[type].outlined : TYPE_CLASSES[type].filled,
        className
      )}
    >
      {iconLeft ? (
        <span aria-hidden="true" className={iconClass}>
          {iconLeft}
        </span>
      ) : null}
      {children}
      {iconRight ? (
        <span aria-hidden="true" className={iconClass}>
          {iconRight}
        </span>
      ) : null}
    </span>
  )
}
