import type { ReactElement } from 'react'
import { cn } from '@/lib/cn'

export interface ProgressRingProps {
  /** 0 to 100. */
  progress: number
  /** Box size in px (design: 20px in the Getting Started item). */
  size?: number
  /** Stroke width in px (3 per the sidebar design; larger rings scale it up). */
  stroke?: number
  className?: string
  'aria-label'?: string
}

/**
 * Static circular progress, the 20px ring on the sidebar "Getting Started"
 * item (Figma 55:137): track in border-neutral-primary, arc in icon-brand,
 * 3px stroke, round cap, starting at 12 o'clock.
 */
export function ProgressRing({
  progress,
  size = 20,
  stroke = 3,
  className,
  'aria-label': ariaLabel,
}: ProgressRingProps): ReactElement {
  const clamped = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0
  const r = (size - stroke) / 2
  const c = size / 2
  const circumference = 2 * Math.PI * r

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: size, height: size }}
      className={cn('shrink-0 -rotate-90', className)}
      role="img"
      aria-label={ariaLabel ?? `${Math.round(clamped)}%`}
    >
      <circle cx={c} cy={c} r={r} fill="none" className="stroke-[var(--border-neutral-primary)]" strokeWidth={stroke} />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        className="stroke-[var(--icon-brand)] transition-[stroke-dashoffset] duration-400 ease-standard"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped / 100)}
      />
    </svg>
  )
}
