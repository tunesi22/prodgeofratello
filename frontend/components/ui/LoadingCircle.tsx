import type { HTMLAttributes, ReactElement } from 'react'
import { cn } from '@/lib/cn'

/**
 * LoadingCircle, implemented 1:1 from `.design/specs/loading-circle.md`
 * (Figma node 2036:2526).
 *
 * Variant matrix: size only, sm (24×24, 4px stroke), md (32×32, 6px stroke),
 * lg (40×40, 6px stroke). No color/state variants.
 *
 * Anatomy per spec:
 * - Background: full 360° circle track, `border-neutral-primary`.
 * - Line: fixed 180° arc (right semicircle, 12 → 6 o'clock), `icon-brand`,
 *   round caps/joins, rotating continuously around the ring center.
 * - Round caps make the painted ring extend slightly past the container at
 *   sm/lg, so the SVG uses `overflow-visible` instead of clipping (mirrors
 *   the negative insets in the Figma export).
 *
 * Motion: `animate-spin` (1s linear infinite), the allowed exemption from
 * the motion duration tokens for continuous spinners; static under
 * `prefers-reduced-motion` (the frozen frame matches the Figma asset).
 */

export type LoadingCircleSize = 'sm' | 'md' | 'lg'

export interface LoadingCircleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Size: sm (24px box, 4px stroke), md (32px, 6px), lg (40px, 6px). Default: 'md'. */
  size?: LoadingCircleSize
  className?: string
}

// Geometry from the spec: container box, ring center-line radius, stroke width.
// boxClass uses the DS 4px spacing scale (24/32/40px → size-6/8/10).
const SIZE_DATA: Record<
  LoadingCircleSize,
  { boxClass: string; box: number; r: number; strokeWidth: number }
> = {
  sm: { boxClass: 'size-6', box: 24, r: 10.5, strokeWidth: 4 },
  md: { boxClass: 'size-8', box: 32, r: 14, strokeWidth: 6 },
  lg: { boxClass: 'size-10', box: 40, r: 17.8571, strokeWidth: 6 },
}

export function LoadingCircle({
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Loading',
  ...rest
}: LoadingCircleProps): ReactElement {
  const { boxClass, box, r, strokeWidth } = SIZE_DATA[size]
  const c: number = box / 2

  return (
    <span
      {...rest}
      role="status"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        boxClass,
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${box} ${box}`}
        fill="none"
        aria-hidden="true"
        className="size-full overflow-visible"
      >
        {/* Background, static full-circle track, Border/border-neutral-primary.
            Tailwind generates stroke-* utilities from `colors` only, not
            `borderColor`, so this semantic token is consumed as its CSS var
            directly (explicitly allowed by DESIGN_SYSTEM.md / tailwind.config.ts). */}
        <circle
          cx={c}
          cy={c}
          r={r}
          stroke="var(--border-neutral-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Line, fixed 180° arc spinning about the ring center (origin-center
            resolves to the viewBox center). Arc length never grows/shrinks. */}
        <path
          d={`M${c} ${c - r}A${r} ${r} 0 0 1 ${c} ${c + r}`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="origin-center animate-spin stroke-icon-brand motion-reduce:animate-none"
        />
      </svg>
    </span>
  )
}
