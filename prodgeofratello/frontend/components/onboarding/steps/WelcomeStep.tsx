'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'
import { ArrowRightIcon } from '../icons'

export interface WelcomeStepProps {
  copy: OnboardingCopy
  onStart: () => void
}

/**
 * Screen 1, welcome. Centered H1 + H4 subtitle (8px apart), LG primary CTA
 * 40px below, all staggering in vertically (50ms interval).
 */
export function WelcomeStep({ copy, onStart }: WelcomeStepProps): ReactElement {
  return (
    <motion.div
      variants={staggerContainer}
      className="flex w-full flex-1 flex-col items-center justify-center text-center"
    >
      <motion.h1 variants={fadeUp} className="text-h1 font-normal text-primary transition-colors duration-300 ease-standard">
        {copy.welcome.title}
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-2 text-h4 font-normal text-secondary transition-colors duration-300 ease-standard">
        {copy.welcome.subtitle}
      </motion.p>
      <motion.div variants={fadeUp} className="mt-10">
        <Button size="lg" iconRight={<ArrowRightIcon />} onClick={onStart}>
          {copy.welcome.cta}
        </Button>
      </motion.div>
    </motion.div>
  )
}
