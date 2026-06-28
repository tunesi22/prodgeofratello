'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { IconButton } from '@/components/ui/IconButton'
import { fadeUp } from '@/lib/motion'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { CloseIcon } from '@/components/onboarding/icons'

const TOTAL_SEGMENTS = 4

export interface NewProjectHeaderProps {
  /** Current data step, 1 to 4 (brand name, website, industry, competitors). */
  step: number
  /** Accessible label for the cancel control. */
  cancelLabel: string
  /** Navigate back to an earlier, already-completed step. */
  onStepClick?: (step: number) => void
  /** Leave the flow entirely (back to the brand list). */
  onCancel: () => void
}

/**
 * Header for the "New project" takeover. Mirrors the onboarding header (logo
 * left, 4-segment progress) but adds a close control on the right so the flow
 * is cancelable, which onboarding (a mandatory first run) is not.
 */
export function NewProjectHeader({
  step,
  cancelLabel,
  onStepClick,
  onCancel,
}: NewProjectHeaderProps): ReactElement {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex items-center justify-between px-20 pt-10"
    >
      <FratelloLogo className="h-[49px] w-20" />

      <div className="flex items-center gap-6">
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

        <IconButton type="ghost" size="sm" aria-label={cancelLabel} onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </div>
    </motion.header>
  )
}
