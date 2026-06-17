'use client'

import { useId } from 'react'
import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { EASE_STANDARD } from '@/lib/motion'
import { FRATELLO_SHAPES, FRATELLO_VIEWBOX } from './FratelloLogo'

/**
 * AnimatedLogo, the Fratello pyramid as a loading indicator. Each face rises
 * and fades on an infinite loop, staggered, with a real vertical motion blur
 * (animated SVG Gaussian blur on the y-axis) during the movement.
 *
 * Motion: vertical movement + opacity only (per DS rules) plus the directional
 * blur for the motion-blur effect. Standard easing. Shares FRATELLO_SHAPES with
 * the static logo, so the real geometry drives both.
 */
const LOOP_SECONDS = 1.5
const FACE_STAGGER = 0.16

export function AnimatedLogo({ className }: { className?: string }): ReactElement {
  const filterId = useId().replace(/:/g, '')

  return (
    <svg
      viewBox={FRATELLO_VIEWBOX}
      fill="none"
      className={cn('text-icon-brand', className)}
      aria-label="Fratello"
      role="img"
    >
      <defs>
        {FRATELLO_SHAPES.map((_, i) => (
          <filter key={i} id={`${filterId}-${i}`} x="-60%" y="-60%" width="220%" height="220%">
            <motion.feGaussianBlur
              in="SourceGraphic"
              initial={{ stdDeviation: '0 0' }}
              animate={{ stdDeviation: ['0 0', '0 6', '0 0'] }}
              transition={{
                duration: LOOP_SECONDS,
                ease: EASE_STANDARD,
                repeat: Infinity,
                delay: i * FACE_STAGGER,
              }}
            />
          </filter>
        ))}
      </defs>

      {FRATELLO_SHAPES.map((shape, i) => {
        const base = shape.opacity ?? 1
        return (
          <motion.path
            key={i}
            d={shape.d}
            fill="currentColor"
            filter={`url(#${filterId}-${i})`}
            initial={{ y: 0, opacity: base }}
            animate={{ y: [0, -7, 0], opacity: [base, base * 0.4, base] }}
            transition={{
              duration: LOOP_SECONDS,
              ease: EASE_STANDARD,
              repeat: Infinity,
              delay: i * FACE_STAGGER,
            }}
          />
        )
      })}
    </svg>
  )
}
