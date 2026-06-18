'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { fadeUp } from '@/lib/motion'
import { FratelloLogo } from './FratelloLogo'

const TOTAL_SEGMENTS = 4

export interface OnboardingHeaderProps {
  /**
   * Current data step, 1 to 4 (brand name, website, industry, competitors).
   * null = welcome screen → logo centered, no progress bar.
   */
  step: number | null
  /** Navigate back to an earlier, already-completed step. */
  onStepClick?: (step: number) => void
}

/**
 * Header, Figma: 80px logo. Welcome centers it with no progress; step screens
 * place it top-left with a compact 4-segment progress bar in the top-right
 * (243px wide, 8px gaps), each segment filled once its step is reached.
 */
export function OnboardingHeader({ step, onStepClick }: OnboardingHeaderProps): ReactElement {
  if (step === null) {
    return (
      <motion.header initial="hidden" animate="visible" variants={fadeUp} className="flex justify-center px-20 pt-10">
        <FratelloLogo className="h-[49px] w-20" />
      </motion.header>
    )
  }

  return (
    <motion.header initial="hidden" animate="visible" variants={fadeUp} className="flex items-center justify-between px-20 pt-10">
      <FratelloLogo className="h-[49px] w-20" />
      <div className="flex w-[243px] items-center gap-2">
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => {
          const segment = i + 1
          const reachable = segment < step
          return (
            <button
              key={segment}
              type="button"
              onClick={reachable && onStepClick ? () => onStepClick(segment) : undefined}
              disabled={!reachable}
              aria-label={`Step ${segment}`}
              className="flex-1 disabled:cursor-default"
              tabIndex={reachable ? 0 : -1}
            >
              <ProgressBar progress={segment <= step ? 100 : 0} thickness={8} />
            </button>
          )
        })}
      </div>
    </motion.header>
  )
}
