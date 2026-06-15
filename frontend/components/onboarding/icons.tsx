import type { ReactElement } from 'react'
import {
  ArrowRight,
  Globe,
  Sun,
  Moon,
  Plus,
  PencilSimple,
  Trash,
  Check,
  Question,
  CheckCircle,
  XCircle,
  Info,
  X,
  Lock,
} from '@phosphor-icons/react/dist/ssr'

/**
 * Onboarding icons, all from the Phosphor icon library (the Figma design
 * system's icon set). Regular weight, currentColor, sized via className.
 * The /dist/ssr entry works in both server and client components.
 * See DESIGN_SYSTEM.md "Ikon".
 */

interface IconProps {
  className?: string
}

export function ArrowRightIcon({ className }: IconProps): ReactElement {
  return <ArrowRight className={className} aria-hidden="true" />
}

export function GlobeIcon({ className }: IconProps): ReactElement {
  return <Globe className={className} aria-hidden="true" />
}

export function SunIcon({ className }: IconProps): ReactElement {
  return <Sun className={className} aria-hidden="true" />
}

export function MoonIcon({ className }: IconProps): ReactElement {
  return <Moon className={className} aria-hidden="true" />
}

export function PlusIcon({ className }: IconProps): ReactElement {
  return <Plus className={className} aria-hidden="true" />
}

export function PencilIcon({ className }: IconProps): ReactElement {
  return <PencilSimple className={className} aria-hidden="true" />
}

export function TrashIcon({ className }: IconProps): ReactElement {
  return <Trash className={className} aria-hidden="true" />
}

export function CheckIcon({ className }: IconProps): ReactElement {
  return <Check className={className} aria-hidden="true" />
}

export function QuestionIcon({ className }: IconProps): ReactElement {
  return <Question className={className} aria-hidden="true" />
}

/** Filled check-circle (Phosphor: CheckCircle, fill weight) for valid states. */
export function CheckCircleIcon({ className }: IconProps): ReactElement {
  return <CheckCircle weight="fill" className={className} aria-hidden="true" />
}

/** Filled x-circle (Phosphor: XCircle, fill weight) for error states. */
export function XCircleIcon({ className }: IconProps): ReactElement {
  return <XCircle weight="fill" className={className} aria-hidden="true" />
}

/** Filled info circle (Phosphor: Info, fill weight) for info states. */
export function InfoIcon({ className }: IconProps): ReactElement {
  return <Info weight="fill" className={className} aria-hidden="true" />
}

/** Close glyph (Phosphor: X). */
export function CloseIcon({ className }: IconProps): ReactElement {
  return <X className={className} aria-hidden="true" />
}

/** Lock glyph (Phosphor: Lock) for gated/locked options. */
export function LockIcon({ className }: IconProps): ReactElement {
  return <Lock className={className} aria-hidden="true" />
}
