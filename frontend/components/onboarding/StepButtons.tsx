'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeUp } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'

export interface StepButtonsProps {
  copy: OnboardingCopy
  onBack: () => void
  /** Label for the primary action (defaults to copy.nav.next). */
  nextLabel?: string
  /** Disable the primary action. */
  nextDisabled?: boolean
  /** Primary button native type (submit inside a form, else button). */
  nextType?: 'submit' | 'button'
  onNext?: () => void
}

/**
 * Back + next button row at the foot of a step's content column (matching the
 * mockup: back at the left edge, primary at the right edge of the 756px column).
 */
export function StepButtons({
  copy,
  onBack,
  nextLabel,
  nextDisabled = false,
  nextType = 'submit',
  onNext,
}: StepButtonsProps): ReactElement {
  return (
    <motion.div variants={fadeUp} className="mt-12 flex w-full items-center justify-between">
      <Button type="ghost" size="md" htmlType="button" onClick={onBack}>
        {copy.nav.back}
      </Button>
      <Button
        size="md"
        htmlType={nextType}
        disabled={nextDisabled}
        onClick={nextType === 'button' ? onNext : undefined}
      >
        {nextLabel ?? copy.nav.next}
      </Button>
    </motion.div>
  )
}
