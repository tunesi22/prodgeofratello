import type { ReactElement } from 'react'
import { cn } from '@/lib/cn'

/**
 * Fratello mark, pyramid of three triangular faces (left slope, right slope,
 * front face), reconstructed 1:1 from the Figma component
 * "Logo Fratello - Transparent Green" (node 100:1345, three polygons).
 *
 * Rendered in a 156×95 viewBox (the mark's natural aspect). Color via the
 * icon-brand token so it adapts per theme. Each face is an independent shape so
 * the mark can be animated face-by-face (see AnimatedLogo).
 */
export interface LogoShape {
  d: string
  /** Static fill opacity for this shape (default 1). */
  opacity?: number
}

/** Three pyramid faces in draw order: left slope, right slope, front face. */
export const FRATELLO_SHAPES: LogoShape[] = [
  { d: 'M75 0 L17.82 95 L0 95 Z' },        // left slope
  { d: 'M82 0 L138.42 95 L156 95 Z' },     // right slope
  { d: 'M78.96 1 L91 95 L24 95 Z' },       // front face
]

export const FRATELLO_VIEWBOX = '0 0 156 95'
/** width / height of the mark, for aspect-correct sizing. */
export const FRATELLO_ASPECT = 156 / 95

export function FratelloLogo({ className }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox={FRATELLO_VIEWBOX}
      fill="none"
      className={cn('text-icon-brand', className)}
      aria-label="Fratello"
      role="img"
    >
      {FRATELLO_SHAPES.map((shape, i) => (
        <path key={i} d={shape.d} fill="currentColor" opacity={shape.opacity ?? 1} />
      ))}
    </svg>
  )
}
