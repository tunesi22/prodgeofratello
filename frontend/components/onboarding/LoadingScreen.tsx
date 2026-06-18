'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { AnimatedLogo } from './AnimatedLogo'

export interface LoadingScreenProps {
  /** Caption shown under the animated mark (e.g. "Menganalisa website anda..."). */
  message: string
}

/**
 * Full-screen loading interstitial, the animated Fratello pyramid centered with
 * a caption below. Matches the Figma "Loading Animation" frames (71:3389 /
 * 71:3398): no header, no footer, just the mark + text on the brand background.
 */
export function LoadingScreen({ message }: LoadingScreenProps): ReactElement {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={staggerContainer}
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-green px-20 transition-colors duration-300 ease-standard"
    >
      <motion.div variants={fadeUp}>
        <AnimatedLogo className="h-[78px] w-[128px]" />
      </motion.div>
      <motion.p
        variants={fadeUp}
        className="text-h4 font-normal text-secondary transition-colors duration-300 ease-standard"
      >
        {message}
      </motion.p>
    </motion.div>
  )
}
