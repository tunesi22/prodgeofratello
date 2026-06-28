'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * Input, implemented 1:1 from `.design/specs/input.md`
 * (Figma component set 53:26551, base `.base Input` 53:26519).
 *
 * States: Idle | Active (focus-within → brand border) | Filled (value → primary
 * text) | Error (label + border → error tokens). No disabled state exists in
 * the design, the native `disabled` attribute is passed through untouched.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text shown in its own row above the field (never floating). */
  label?: string
  /** Appends a red `*` after the label and sets the native required attribute. */
  required?: boolean
  /** Error state: label color and field border switch to the error tokens. */
  error?: boolean
  /** Caption row shown below the field. */
  caption?: React.ReactNode
  /** 20×20 leading icon inside the field. */
  iconLeft?: React.ReactNode
  /** 20×20 trailing icon inside the field. */
  iconRight?: React.ReactNode
  /** Trailing inline suffix text inside the field (e.g. a unit like "CDD"). */
  additionalText?: string
  /**
   * Interactive trailing control (e.g. a show/hide password button). Unlike
   * `iconRight`, this slot is NOT wrapped in aria-hidden, so a focusable button
   * placed here stays in the accessibility tree and the keyboard tab order.
   */
  trailingAction?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      required = false,
      error = false,
      caption,
      iconLeft,
      iconRight,
      additionalText,
      trailingAction,
      className,
      id,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) {
    const autoId = React.useId()
    const inputId = id ?? autoId
    const captionId = caption != null ? `${inputId}-caption` : undefined
    const describedBy = cn(ariaDescribedBy, captionId) || undefined

    return (
      <div className={cn('flex w-full flex-col gap-2', className)}>
        {label != null && (
          <label
            htmlFor={inputId}
            className={cn(
              'flex w-full items-center gap-1 text-field-label font-semibold',
              'transition-colors duration-200 ease-standard',
              error ? 'text-error-token' : 'text-secondary',
            )}
          >
            {label}
            {required && (
              <span
                aria-hidden="true"
                className="text-field-label font-normal text-error-token"
              >
                *
              </span>
            )}
          </label>
        )}

        <div
          className={cn(
            // Fixed 36px field height (per input.md spec): the box stays the same
            // height whether it holds plain text, 20px icons, or a taller
            // interactive trailingAction (e.g. the show/hide password button).
            // `items-center` vertically centers every child; without the fixed
            // height a tall trailing control would stretch the row and make
            // fields with/without actions misalign.
            'flex h-9 w-full items-center gap-2 rounded-token-8 border bg-primary px-3',
            'transition-colors duration-200 ease-standard',
            error
              ? 'border-error-token'
              : 'border-neutral-primary focus-within:border-brand-token',
          )}
        >
          {iconLeft != null && (
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center text-icon-dark-gray"
            >
              {iconLeft}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error || undefined}
            aria-describedby={describedBy}
            className="w-full min-w-0 flex-1 bg-transparent text-field-input font-normal text-primary outline-none placeholder:text-tertiary disabled:cursor-not-allowed"
            {...rest}
          />

          {additionalText != null && (
            <span className="shrink-0 whitespace-nowrap text-field-input font-normal text-primary">
              {additionalText}
            </span>
          )}

          {iconRight != null && (
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center text-icon-dark-gray"
            >
              {iconRight}
            </span>
          )}

          {trailingAction != null && (
            <span className="flex shrink-0 items-center justify-center text-icon-dark-gray">
              {trailingAction}
            </span>
          )}
        </div>

        {caption != null && (
          <span
            id={captionId}
            className={cn(
              'w-full text-field-caption font-normal transition-colors duration-200 ease-standard',
              error ? 'text-error-token' : 'text-secondary',
            )}
          >
            {caption}
          </span>
        )}
      </div>
    )
  },
)
