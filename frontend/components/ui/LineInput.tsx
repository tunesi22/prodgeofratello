'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * LineInput, underline-style text field, implemented 1:1 from the Figma
 * "Line Input" component (node 100:1388 / 100:1412).
 *
 * Anatomy: no box, just a 1px bottom border. Large H3 (28px) Figtree Regular
 * text, placeholder in text-tertiary. Optional trailing icon (24px). Container
 * padding py-8 (wrap-8), gap-8. Border turns brand on focus, error on error.
 *
 * States from the source: Idle (neutral border). Active (focus) and Error are
 * derived from the DS token set, consistent with the boxed Input.
 */
export interface LineInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Trailing icon shown at the right of the line (24px slot). */
  icon?: React.ReactNode
  /** Error state: bottom border switches to the error token. */
  error?: boolean
}

export const LineInput = React.forwardRef<HTMLInputElement, LineInputProps>(
  function LineInput({ icon, error = false, className, ...rest }, ref) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center gap-2 border-b border-solid py-2',
          'transition-colors duration-200 ease-standard',
          error
            ? 'border-error-token focus-within:border-error-token'
            : 'border-neutral-primary focus-within:border-brand-token',
          className,
        )}
      >
        <input
          ref={ref}
          {...rest}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-h3 font-normal leading-[1.2] text-primary',
            'placeholder:text-tertiary focus:outline-none',
          )}
        />
        {icon != null && (
          <span className="flex size-6 shrink-0 items-center justify-center [&>svg]:size-full">
            {icon}
          </span>
        )}
      </div>
    )
  },
)
