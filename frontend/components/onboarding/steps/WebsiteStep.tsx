'use client'

import type { FormEvent, ReactElement } from 'react'
import { motion } from 'framer-motion'
import { LineInput } from '@/components/ui/LineInput'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'
import { CheckCircleIcon } from '../icons'
import { StepButtons } from '../StepButtons'

export interface WebsiteStepProps {
  copy: OnboardingCopy
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

/** Loose public-website check: optional protocol + domain.tld + optional path. */
export function isValidWebsite(value: string): boolean {
  return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(value.trim())
}

/**
 * Website step, centered title block, underline LineInput with a brand
 * check-circle once the URL is valid, back + next buttons.
 */
export function WebsiteStep({ copy, value, onChange, onNext, onBack }: WebsiteStepProps): ReactElement {
  const valid = isValidWebsite(value)

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (valid) onNext()
  }

  return (
    <motion.form
      variants={staggerContainer}
      onSubmit={handleSubmit}
      className="flex w-full flex-1 flex-col items-center justify-center"
    >
      <div className="w-full max-w-[756px] text-center">
        <motion.h1 variants={fadeUp} className="text-h1 font-normal text-primary transition-colors duration-300 ease-standard">
          {copy.website.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-h4 font-normal text-secondary transition-colors duration-300 ease-standard">
          {copy.website.subtitle}
        </motion.p>

        <motion.div variants={fadeUp} className="mx-auto mt-16 w-full max-w-[552px]">
          <LineInput
            autoFocus
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={copy.website.placeholder}
            aria-label={copy.website.label}
            className="text-center"
            icon={valid ? <CheckCircleIcon className="text-icon-brand" /> : undefined}
          />
        </motion.div>

        <StepButtons copy={copy} onBack={onBack} nextDisabled={!valid} />
      </div>
    </motion.form>
  )
}
