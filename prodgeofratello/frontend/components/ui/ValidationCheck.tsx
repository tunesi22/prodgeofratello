import * as React from 'react'
import {
  CheckCircle as PhosphorCheckCircle,
  MinusCircle as PhosphorMinusCircle,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'

/**
 * ValidationCheck, implemented 1:1 from .design/specs/validation-check.md
 * (Figma component set 56:28238). Requirement / password-rule row.
 *
 * Variants: Checked=Yes (filled brand CheckCircle) / Checked=No (gray
 * outlined MinusCircle). Text stays text-primary in both states.
 */

export interface ValidationCheckProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the validation rule is satisfied (Checked=Yes / No). */
  checked: boolean
  /** Rule label text (Label/Medium, e.g. "One Uppercase Letter"). */
  children: React.ReactNode
}

// CheckCircle / MinusCircle from the Phosphor library (the Figma DS icon set;
// the original Figma vectors are these same Phosphor glyphs).
function CheckCircleIcon(): React.JSX.Element {
  return (
    <PhosphorCheckCircle
      size={20}
      weight="fill"
      aria-hidden="true"
      className="shrink-0 text-icon-brand transition-colors duration-200 ease-standard"
    />
  )
}

function MinusCircleIcon(): React.JSX.Element {
  return (
    <PhosphorMinusCircle
      size={20}
      weight="regular"
      aria-hidden="true"
      className="shrink-0 text-icon-light-gray transition-colors duration-200 ease-standard"
    />
  )
}

export function ValidationCheck({
  checked,
  children,
  className,
  ...rest
}: ValidationCheckProps): React.JSX.Element {
  return (
    <div
      {...rest}
      data-checked={checked}
      className={cn('inline-flex items-center gap-2', className)}
    >
      {checked ? <CheckCircleIcon /> : <MinusCircleIcon />}
      <span className="whitespace-nowrap text-label-medium font-medium text-primary transition-colors duration-200 ease-standard">
        {children}
      </span>
    </div>
  )
}
