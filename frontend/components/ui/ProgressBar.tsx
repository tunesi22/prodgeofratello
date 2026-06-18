import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * ProgressBar, implemented 1:1 from .design/specs/progress-bar.md (Figma node 57:29619).
 *
 * Variant matrix: Thickness 4dp / 8dp × Progress 0 to 100 (determinate).
 * Anatomy (M3-style): active indicator (brand fill, round caps) + 6px/8px gap +
 * bg-tertiary track occupying the remaining width.
 * - 12px layout box for both thicknesses; bar centered vertically.
 * - At progress 0: no fill, gap absent, track spans the full width.
 * - At progress 100: fill spans the full width, track collapses to 0.
 * - Fill color is the `Border/border-brand` token (the variable bound in Figma);
 *   referenced via var() since no bg-* utility maps to that variable.
 * - Fill width (and the track's start edge, keeping the gap in sync) animates
 *   with duration-400 / ease-standard on value change; honors reduced motion.
 * - The Figma "stop" slot at the track end has no visible fill in this design,
 *   so it is not rendered. Figma's 2px/4px edge padding only exists to clear
 *   protruding SVG stroke caps; the CSS rounded fill keeps its caps inside its
 *   own box, so the rendered geometry matches without padding.
 */
export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Completion percentage, 0 to 100 (values outside the range are clamped). */
  progress: number
  /** Bar thickness variant in px: 4 (default) or 8. */
  thickness?: 4 | 8
  className?: string
}

export function ProgressBar({
  progress,
  thickness = 4,
  className,
  ...rest
}: ProgressBarProps): React.JSX.Element {
  const clamped = Number.isFinite(progress)
    ? Math.min(100, Math.max(0, progress))
    : 0
  // 4px / 8px bar on the DS 4px spacing scale (h-1 / h-2).
  const barHeight = thickness === 4 ? 'h-1' : 'h-2'
  // fill to track gap: 6px (4dp) / 8px (8dp); absent at progress 0.
  // At 100 the track's left edge passes its right edge → width resolves to 0.
  const trackStart = clamped > 0 ? `calc(${clamped}% + ${thickness === 4 ? 6 : 8}px)` : '0px'

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      {...rest}
      className={cn('relative h-3 w-full', className)}
    >
      {/* track: remaining width to the right of fill + gap */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 right-0 my-auto rounded-circle bg-tertiary',
          barHeight,
          'transition-[left] duration-400 ease-standard motion-reduce:transition-none',
        )}
        style={{ left: trackStart }}
      />
      {/* active indicator: round-cap brand fill, width = progress% */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0 left-0 my-auto rounded-circle bg-[color:var(--border-brand)]',
          barHeight,
          'transition-[width] duration-400 ease-standard motion-reduce:transition-none',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
