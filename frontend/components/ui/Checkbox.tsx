'use client'

import * as React from 'react'
import { Check as PhosphorCheck, Minus as PhosphorMinus } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'

/**
 * Checkbox, implemented 1:1 from .design/specs/checkbox.md (Figma 56:28643).
 * Box only (20×20, radius-4), no label. Controlled component.
 *
 * Variants: default (unchecked) / checked / mixed × idle / pressed / disabled.
 */

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled state: false (default), true (checked) or 'mixed' (indeterminate). */
  checked: boolean | 'mixed'
  /** Called with the next boolean state (mixed/unchecked → true, checked → false). */
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

// Check / Minus marks from the Phosphor library (the Figma DS icon set;
// the original Figma vectors are the same Phosphor glyphs). Bold weight
// matches the spec's 1.5px stroke at this 16px size.
function CheckIcon(): React.JSX.Element {
  return <PhosphorCheck size={16} weight="bold" aria-hidden="true" />
}

function MinusIcon(): React.JSX.Element {
  return <PhosphorMinus size={16} weight="bold" aria-hidden="true" />
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  className,
  onClick,
  ...rest
}: CheckboxProps): React.JSX.Element {
  const isFilled: boolean = checked === true || checked === 'mixed'

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event)
    if (event.defaultPrevented) return
    onChange?.(checked === true ? false : true)
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === 'mixed' ? 'mixed' : checked}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
      className={cn(
        'inline-flex size-[20px] shrink-0 items-center justify-center rounded-token-4',
        'transition-colors duration-200 ease-standard focus-visible:outline-none',
        // Default (unchecked), idle: bg-primary + 1.5px border-neutral-tertiary;
        // pressed/focused: bg-tertiary, border unchanged
        !isFilled &&
          !disabled &&
          'border-[1.5px] border-neutral-tertiary bg-primary active:bg-tertiary focus-visible:bg-tertiary',
        // Default (unchecked) disabled, solid icon-disabled fill, NO border
        !isFilled && disabled && 'bg-icon-disabled',
        // Checked / Mixed, btn-primary fill, white mark; pressed/focused darkens fill
        isFilled && 'p-[2px] text-icon-white-remain',
        isFilled &&
          !disabled &&
          'bg-btn-primary active:bg-btn-primary-pressed focus-visible:bg-btn-primary-pressed',
        // Checked / Mixed disabled, idle fill, whole box (icon included) at 50% opacity
        isFilled && disabled && 'bg-btn-primary opacity-50',
        className,
      )}
    >
      {checked === true && <CheckIcon />}
      {checked === 'mixed' && <MinusIcon />}
    </button>
  )
}
