'use client'

import type { FormEvent, ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { LineInput } from '@/components/ui/LineInput'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'

export interface BrandNameStepProps {
  copy: OnboardingCopy
  value: string
  onChange: (value: string) => void
  onNext: () => void
}

/**
 * Brand name step, centered content (matching the mockup): title + subtitle,
 * an underline LineInput, and a single centered "Selanjutnya" button. Staggers
 * in vertically on enter; no layout morph on input.
 */
export function BrandNameStep({ copy, value, onChange, onNext }: BrandNameStepProps): ReactElement {
  const hasValue = value.trim().length > 0

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (hasValue) onNext()
  }

  return (
    <motion.form
      variants={staggerContainer}
      onSubmit={handleSubmit}
      className="flex w-full flex-1 flex-col items-center justify-center"
    >
      <div className="w-full max-w-[756px] text-center">
        <motion.h1
          variants={fadeUp}
          className="text-h1 font-normal text-primary transition-colors duration-300 ease-standard"
        >
          {copy.brandName.title}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-2 text-h4 font-normal text-secondary transition-colors duration-300 ease-standard"
        >
          {copy.brandName.subtitle}
        </motion.p>

        <motion.div variants={fadeUp} className="mx-auto mt-16 w-full max-w-[552px]">
          <LineInput
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={copy.brandName.placeholder}
            aria-label={copy.brandName.label}
            className="text-center"
          />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12 flex w-full justify-center">
          <Button size="md" htmlType="submit" disabled={!hasValue}>
            {copy.nav.next}
          </Button>
        </motion.div>
      </div>
    </motion.form>
  )
}
