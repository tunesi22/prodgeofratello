'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * TextBox, textarea field, implemented 1:1 from `.design/specs/textbox.md`
 * (Figma nodes 56:28140 + 56:28113).
 *
 * States (variant set): Idle | Active | Error | Filled.
 * - Idle/Filled: `border-neutral-primary`; value text flips tertiary → primary
 *   automatically via `placeholder:` styling.
 * - Active (focus): `border-brand-token` via `focus-within:`. The spec table
 *   records the Active-state caret/text ("|") as `text-tertiary`, but that "|"
 *   is a Figma mock-caret text node, not a real caret, here the real caret and
 *   typed text render `text-primary` (deliberate deviation; no caret-color
 *   override).
 * - Error: `border-error-token`; value text stays tertiary (recorded verbatim
 *   from Figma). Error wins over focus. No Disabled state exists in the set.
 */
export interface TextBoxProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  /** Field label, the label row is always present on TextBox (no showTop toggle). */
  label: string
  /** Red `*` after the label + native `required` on the textarea. */
  required?: boolean
  /** Error state: error border, value text stays tertiary per spec. */
  error?: boolean
  /** Optional 20×20 leading icon inside the box (top-aligned). */
  leftIcon?: React.ReactNode
  /** Optional 20×20 trailing icon inside the box (top-aligned). */
  rightIcon?: React.ReactNode
  /** Optional trailing inline suffix text (e.g. "CDD"). */
  additionalText?: string
  /** Optional caption row below the box. */
  caption?: string
  /** Box height in px, spec default is a fixed 120px. */
  height?: number
  /** Merged last onto the root element. */
  className?: string
  /** Forwarded to the underlying `<textarea>` (React 19 ref-as-prop). */
  ref?: React.Ref<HTMLTextAreaElement>
}

export function TextBox({
  label,
  required = false,
  error = false,
  leftIcon,
  rightIcon,
  additionalText,
  caption,
  height,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...rest
}: TextBoxProps): React.JSX.Element {
  const autoId = React.useId()
  const textareaId = id ?? autoId
  const captionId = caption ? `${textareaId}-caption` : undefined
  const describedBy = cn(ariaDescribedBy, captionId) || undefined

  return (
    // Implicit <label> association: clicking the label row focuses the textarea.
    <label className={cn('flex w-[330px] flex-col gap-3', className)}>
      {/* Label row, label color stays text-secondary in every state */}
      <span className="flex w-full items-center gap-1">
        <span className="text-field-label font-semibold text-secondary">{label}</span>
        {required && (
          <span aria-hidden="true" className="text-field-label font-semibold text-error-token">
            *
          </span>
        )}
      </span>

      {/* Container, fixed 120px box, content top-aligned */}
      <span
        className={cn(
          'flex w-full items-start gap-2 rounded-token-8 border bg-primary px-3 py-2',
          height === undefined && 'h-[120px]',
          'transition-colors duration-200 ease-standard',
          error
            ? 'border-error-token'
            : 'border-neutral-primary focus-within:border-brand-token',
        )}
        style={height !== undefined ? { height } : undefined}
      >
        {leftIcon && (
          <span
            aria-hidden="true"
            className="flex size-[20px] shrink-0 items-center justify-center text-icon-dark-gray"
          >
            {leftIcon}
          </span>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-full min-w-0 flex-1 resize-none bg-transparent text-field-input font-normal outline-none',
            'transition-colors duration-200 ease-standard',
            error ? 'text-tertiary' : 'text-primary',
            'placeholder:text-tertiary',
            'disabled:cursor-not-allowed',
          )}
          {...rest}
        />

        {additionalText && (
          <span className="shrink-0 text-field-input font-normal text-tertiary">
            {additionalText}
          </span>
        )}

        {rightIcon && (
          <span
            aria-hidden="true"
            className="flex size-[20px] shrink-0 items-center justify-center text-icon-dark-gray"
          >
            {rightIcon}
          </span>
        )}
      </span>

      {caption && (
        <span id={captionId} className="text-field-caption font-normal text-secondary">
          {caption}
        </span>
      )}
    </label>
  )
}
