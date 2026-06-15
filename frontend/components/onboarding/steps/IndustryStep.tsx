'use client'

import type { FormEvent, ReactElement } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'
import { cn } from '@/lib/cn'
import { StepButtons } from '../StepButtons'

export interface IndustryStepProps {
  copy: OnboardingCopy
  selected: string
  onSelect: (industry: string) => void
  onNext: () => void
  onBack: () => void
}

/**
 * Industry step, centered title block, 2-column grid of selectable industry
 * options (46px rows, 16px gaps), back + next buttons.
 */
export function IndustryStep({ copy, selected, onSelect, onNext, onBack }: IndustryStepProps): ReactElement {
  const hasChoice = selected !== ''

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (hasChoice) onNext()
  }

  return (
    <motion.form
      variants={staggerContainer}
      onSubmit={handleSubmit}
      className="flex w-full flex-1 flex-col items-center justify-center"
    >
      <div className="w-full max-w-[756px] text-center">
        <motion.h1 variants={fadeUp} className="text-h1 font-normal text-primary transition-colors duration-300 ease-standard">
          {copy.industry.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-h4 font-normal text-secondary transition-colors duration-300 ease-standard">
          {copy.industry.subtitle}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-12 grid w-full grid-cols-2 gap-4"
          role="radiogroup"
          aria-label={copy.industry.title}
        >
          {copy.industries.map((industry) => {
            const isSelected = selected === industry
            return (
              <button
                key={industry}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelect(isSelected ? '' : industry)}
                className={cn(
                  'flex h-[46px] items-center justify-center rounded-token-8 border text-label-big font-medium',
                  'transition-colors duration-200 ease-standard focus-visible:outline-none',
                  isSelected
                    ? 'border-brand-token bg-display-brand text-brand-token'
                    : 'border-neutral-primary bg-card text-primary active:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed',
                )}
              >
                {industry}
              </button>
            )
          })}
        </motion.div>

        <StepButtons copy={copy} onBack={onBack} nextDisabled={!hasChoice} />
      </div>
    </motion.form>
  )
}
