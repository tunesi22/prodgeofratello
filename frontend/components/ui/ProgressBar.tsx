import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * ProgressBar, implemented 1:1 from .design/specs/progress-bar.md (Figma node 57:29619).
 *
 * Variant matrix: Thickness 4dp / 8dp × Progress 0 to 100 (determinate).
 * Anatomy: a full-width bg-tertiary track with a brand-fill indicator overlaid
 * on top (continuous — NO gap between fill and track), round caps.
 * - 12px layout box for both thicknesses; bar centered vertically.
 * - At progress 0: just the track. At 100: the fill covers it fully.
 * - Fill color is the `Border/border-brand` token (the variable bound in Figma);
 *   referenced via var() since no bg-* utility maps to that variable.
 * - Fill width animates with duration-400 / ease-standard on value change;
 *   honors reduced motion.
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

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      {...rest}
      className={cn('relative h-3 w-full', className)}
    >
      {/* track: full-width background bar */}
      <div
        aria-hidden="true"
        className={cn('absolute inset-x-0 inset-y-0 my-auto rounded-circle bg-tertiary', barHeight)}
      />
      {/* active indicator: round-cap brand fill overlaid on the track, width = progress% */}
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
