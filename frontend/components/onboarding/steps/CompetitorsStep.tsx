'use client'

import { useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { fadeUp, staggerContainer, transitionEnter, transitionExit } from '@/lib/motion'
import type { OnboardingCopy } from '@/lib/onboarding-copy'
import { PencilIcon, PlusIcon, QuestionIcon, TrashIcon } from '../icons'
import { HelpTooltip } from '../HelpTooltip'
import { StepButtons } from '../StepButtons'

export const MAX_COMPETITORS = 3

export interface Competitor {
  name: string
  domain: string
  includeSubdomains: boolean
}

export interface CompetitorsStepProps {
  copy: OnboardingCopy
  competitors: Competitor[]
  onChange: (competitors: Competitor[]) => void
  onFinish: () => void
  onBack: () => void
  /** Error from a failed save (shown above the buttons). */
  error?: string
}

/**
 * Competitors step, the list is pre-filled from analysis (see OnboardingFlow).
 * Each row shows the brand avatar, name and domain with edit/delete actions.
 * Editing expands an inline panel: name + domain inputs and an "include all
 * subdomains" toggle with a question-mark tooltip explaining it.
 */
export function CompetitorsStep({ copy, competitors, onChange, onFinish, onBack, error }: CompetitorsStepProps): ReactElement {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draft, setDraft] = useState<Competitor | null>(null)

  function startEdit(index: number): void {
    setEditingIndex(index)
    setDraft({ ...competitors[index] })
  }

  function commitEdit(): void {
    if (editingIndex === null || draft === null) return
    const name = draft.name.trim()
    onChange(
      name === ''
        ? competitors.filter((_, i) => i !== editingIndex)
        : competitors.map((c, i) => (i === editingIndex ? { ...draft, name, domain: draft.domain.trim() } : c)),
    )
    setEditingIndex(null)
    setDraft(null)
  }

  function addBlank(): void {
    if (competitors.length >= MAX_COMPETITORS) return
    const next = [...competitors, { name: '', domain: '', includeSubdomains: false }]
    onChange(next)
    startEdit(next.length - 1)
  }

  function handleSubmit(e: FormEvent): void {
    e.preventDefault()
    if (editingIndex !== null) commitEdit()
    onFinish()
  }

  return (
    <motion.form
      variants={staggerContainer}
      onSubmit={handleSubmit}
      className="flex w-full flex-1 flex-col items-center justify-center"
    >
      <div className="w-full max-w-[756px]">
        <motion.h1 variants={fadeUp} className="text-center text-h1 font-normal text-primary transition-colors duration-300 ease-standard">
          {copy.competitors.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 text-center text-h4 font-normal text-secondary transition-colors duration-300 ease-standard">
          {competitors.length > 0 ? copy.competitors.subtitle : copy.competitors.emptyHint}
        </motion.p>

        <motion.p variants={fadeUp} className="mt-10 text-paragraph-medium text-secondary">
          {copy.competitors.counter(competitors.length, MAX_COMPETITORS)}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-4 flex w-full flex-col gap-3">
          <AnimatePresence initial={false}>
            {competitors.map((competitor, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: transitionEnter() }}
                exit={{ opacity: 0, y: -16, transition: transitionExit() }}
                className="rounded-token-12 border border-neutral-primary bg-card transition-colors duration-300 ease-standard"
              >
                {editingIndex === index && draft !== null ? (
                  // ---- Inline editor ----
                  <div className="flex flex-col gap-4 p-4">
                    <Input
                      autoFocus
                      label={copy.competitors.nameLabel}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder={copy.competitors.addPlaceholder}
                    />
                    <Input
                      label={copy.competitors.domainLabel}
                      value={draft.domain}
                      onChange={(e) => setDraft({ ...draft, domain: e.target.value })}
                      placeholder={copy.competitors.domainPlaceholder}
                      inputMode="url"
                    />
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={draft.includeSubdomains}
                        onChange={(v) => setDraft({ ...draft, includeSubdomains: v })}
                        aria-label={copy.competitors.subdomainLabel}
                      />
                      <span className="text-label-medium font-medium text-primary">
                        {copy.competitors.subdomainLabel}
                      </span>
                      <HelpTooltip label={copy.competitors.subdomainTooltip}>
                        <QuestionIcon className="size-4 text-tertiary" />
                      </HelpTooltip>
                    </div>
                    <div className="flex justify-end">
                      <Button type="primary-outlined" size="sm" htmlType="button" onClick={commitEdit}>
                        {copy.competitors.editSave}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // ---- Display row ----
                  <div className="flex h-[64px] items-center gap-4 px-4">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-label-big font-medium text-brand-token transition-colors duration-300 ease-standard"
                    >
                      {(competitor.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-field-input text-primary transition-colors duration-300 ease-standard">
                        {competitor.name || copy.competitors.addPlaceholder}
                      </span>
                      {competitor.domain !== '' && (
                        <span className="truncate text-paragraph-medium text-tertiary">
                          {competitor.domain}
                          {competitor.includeSubdomains ? ' · *.subdomain' : ''}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2">
                      <IconButton type="ghost" size="sm" aria-label={`Edit ${competitor.name}`} onClick={() => startEdit(index)}>
                        <PencilIcon />
                      </IconButton>
                      <IconButton
                        type="ghost"
                        size="sm"
                        aria-label={`Hapus ${competitor.name}`}
                        className="text-icon-error"
                        onClick={() => onChange(competitors.filter((_, i) => i !== index))}
                      >
                        <TrashIcon />
                      </IconButton>
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {competitors.length < MAX_COMPETITORS && (
            <motion.div layout>
              <Button type="ghost" size="md" htmlType="button" iconLeft={<PlusIcon />} onClick={addBlank}>
                {copy.competitors.addLabel}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {error != null && (
          <motion.p variants={fadeUp} className="mt-6 text-paragraph-medium text-error-token">
            {error}
          </motion.p>
        )}

        <StepButtons copy={copy} onBack={onBack} nextLabel={copy.nav.finish} />
      </div>
    </motion.form>
  )
}
