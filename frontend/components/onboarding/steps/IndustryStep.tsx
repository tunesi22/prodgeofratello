'use client'

import { useState, type FormEvent, type ReactElement } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'
import { cn } from '@/lib/cn'
import { LineInput } from '@/components/ui/LineInput'
import { StepButtons } from '../StepButtons'

export interface IndustryStepProps {
  copy: OnboardingCopy
  selected: string
  detectedIndustry?: string
  onSelect: (industry: string) => void
  onNext: () => void
  onBack: () => void
}

export function IndustryStep({ copy, selected, detectedIndustry, onSelect, onNext, onBack }: IndustryStepProps): ReactElement {
  const isPredefined = copy.industries.includes(selected)
  const isCustom = selected !== '' && !isPredefined

  const [showOther, setShowOther] = useState(isCustom)
  const [otherText, setOtherText] = useState(isCustom ? selected : '')

  const hasChoice = selected !== ''

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (hasChoice) onNext()
  }

  function handlePredefinedClick(industry: string): void {
    setShowOther(false)
    onSelect(selected === industry ? '' : industry)
  }

  function handleOtherClick(): void {
    setShowOther(true)
    onSelect(otherText)
  }

  function handleOtherChange(text: string): void {
    setOtherText(text)
    onSelect(text)
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
            const isDetected = detectedIndustry === industry
            return (
              <button
                key={industry}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handlePredefinedClick(industry)}
                className={cn(
                  'relative flex h-[46px] items-center justify-center gap-1.5 rounded-token-8 border text-label-big font-medium',
                  'transition-colors duration-200 ease-standard focus-visible:outline-none',
                  isSelected
                    ? 'border-brand-token bg-display-brand text-brand-token'
                    : 'border-neutral-primary bg-card text-primary active:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed',
                )}
              >
                {industry}
                {isDetected && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-50">AI</span>
                )}
              </button>
            )
          })}

          <button
            type="button"
            role="radio"
            aria-checked={showOther}
            onClick={handleOtherClick}
            className={cn(
              'col-span-2 flex h-[46px] items-center justify-center rounded-token-8 border text-label-big font-medium',
              'transition-colors duration-200 ease-standard focus-visible:outline-none',
              showOther
                ? 'border-brand-token bg-display-brand text-brand-token'
                : 'border-neutral-primary bg-card text-primary active:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed',
            )}
          >
            {copy.industry.otherLabel}
          </button>
        </motion.div>

        {showOther && (
          <motion.div
            key="other-input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
            className="mx-auto mt-6 w-full max-w-[552px]"
          >
            <LineInput
              autoFocus
              type="text"
              value={otherText}
              onChange={(e) => handleOtherChange(e.target.value)}
              placeholder={copy.industry.otherPlaceholder}
              className="text-center"
            />
          </motion.div>
        )}

        <StepButtons copy={copy} onBack={onBack} nextDisabled={!hasChoice} />
      </div>
    </motion.form>
  )
}
