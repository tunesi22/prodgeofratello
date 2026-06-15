'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * Toggle, implemented 1:1 from .design/specs/toggle.md (Figma node 57:28692).
 *
 * Variant matrix: switched No/Yes × Idle / Pressed-Focused / Disabled.
 * - Track 36×20, p-[2px], pill radius (rounded-circle), overflow-clip.
 * - Thumb 16×16 white circle (icon-white-remain), travels 16px via transform.
 * - off: bg-tertiary → pressed/focused bg-column → disabled bg-icon-disabled
 * - on:  bg-btn-primary → pressed/focused bg-btn-primary-pressed → disabled bg-btn-primary
 * - Disabled: whole component at 50% opacity (per spec).
 */
export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children'> {
  /** Controlled on/off state. */
  checked: boolean
  /** Called with the next state when the user toggles. */
  onChange?: (checked: boolean) => void
  /** Disables interaction and renders the component at 50% opacity. */
  disabled?: boolean
  className?: string
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  className,
  onClick,
  ...rest
}: ToggleProps): React.JSX.Element {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      onChange?.(!checked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      {...rest}
      onClick={handleClick}
      className={cn(
        // track anatomy: 36×20, 2px inset, pill, single thumb child
        'inline-flex h-[20px] w-[36px] min-w-[36px] shrink-0 items-center overflow-clip rounded-circle p-[2px]',
        // focus state is the pressed bg per design, no default outline ring
        'outline-none transition-colors duration-200 ease-standard',
        checked
          ? 'bg-btn-primary active:bg-btn-primary-pressed focus-visible:bg-btn-primary-pressed disabled:bg-btn-primary'
          : 'bg-tertiary active:bg-column focus-visible:bg-column disabled:bg-icon-disabled',
        'disabled:opacity-50',
        className,
      )}
    >
      {/* thumb: white circle, slides 16px (32px inner width − 16px thumb) */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none block size-[16px] rounded-circle bg-icon-white-remain',
          'transition-transform duration-200 ease-standard motion-reduce:transition-none',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
