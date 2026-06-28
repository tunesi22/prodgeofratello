import type { ReactElement } from 'react'
import { NewProjectFlow } from '@/components/brands/NewProjectFlow'

/**
 * /brands/new, "New project".
 *
 * The legacy single-card form is replaced by a full-screen stepper that mirrors
 * the onboarding experience and auto-fills industry + competitors from a website
 * analysis (see components/brands/NewProjectFlow.tsx). POST /brands is unchanged.
 */
export default function NewProjectPage(): ReactElement {
  return <NewProjectFlow />
}
