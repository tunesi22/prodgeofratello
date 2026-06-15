'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * Radio, implemented 1:1 from `.design/specs/radio.md` (Figma node 57:28772).
 * 20×20 circle, marked (yes/no) × state (idle, pressed/focused, disabled).
 * Controlled component: parent owns `checked` and group semantics via `name`.
 */
export interface RadioProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'checked' | 'onChange' | 'className' | 'size'
  > {
  /** Whether this radio is the selected option in its group (controlled). */
  checked: boolean
  /** Fires when the user selects this radio (radios only fire on becoming checked). */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void
  /** Disables interaction and applies the disabled visuals from the spec. */
  disabled?: boolean
  /** Radio group name (enables native arrow-key navigation within the group). */
  name?: string
  /** Value of this option within the group. */
  value?: string
  /** Extra classes merged last onto the root element. */
  className?: string
}

export function Radio({
  checked,
  onChange,
  disabled = false,
  name,
  value,
  className,
  ...rest
}: RadioProps): React.JSX.Element {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(event.target.checked, event)
  }

  return (
    <label
      className={cn(
        'group relative inline-flex select-none',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        type="radio"
        className="peer sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        name={name}
        value={value}
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[20px] items-center justify-center rounded-circle p-[6px]',
          'transition-colors duration-200 ease-standard',
          // Marked: No, bordered circle; pressed/focused darkens the fill
          !checked &&
            !disabled &&
            'border-[1.5px] border-neutral-tertiary bg-primary group-active:bg-tertiary peer-focus-visible:bg-tertiary',
          // Marked: No, Disabled, solid fill, no border
          !checked && disabled && 'bg-icon-disabled',
          // Marked: Yes, green fill edge to edge (no border); pressed/focused darkens
          checked &&
            !disabled &&
            'bg-btn-primary group-active:bg-btn-primary-pressed peer-focus-visible:bg-btn-primary-pressed',
          // Marked: Yes, Disabled, btn-primary with the whole circle at 50% opacity
          checked && disabled && 'bg-btn-primary opacity-50',
        )}
      >
        {checked ? (
          <svg
            viewBox="0 0 8 8"
            className="size-[8px] shrink-0 text-icon-white-remain"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
        ) : null}
      </span>
    </label>
  )
}
