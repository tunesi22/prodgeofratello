import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

/**
 * ListRow, implemented 1:1 from `.design/specs/list.md`
 * (Figma node 57:34346, `.base List`; reused as the row inside ContextualMenu).
 *
 * Anatomy per spec:
 * - Flex row, items-center; padding 16px x (Wrapper/wrap-16) / 12px y
 *   (Wrapper/wrap-12); radius token-12 (visible standalone, clipped when
 *   stacked inside ContextualMenu's `overflow-clip`); transparent background.
 * - Optional leading avatar: 40×40px, radius-circle. The extracted layout
 *   defines NO explicit gap between avatar and Content (flagged UNCERTAIN in
 *   the spec), so none is added here.
 * - Content column: flex-1, min-w-px, justify-center, word-break on the whole
 *   block; Label is Actions/Medium (16/20) medium `text-primary` and wraps;
 *   Caption is Paragraph/Medium (14/20) regular `text-secondary`, single line
 *   with ellipsis.
 * - No separators are built into the row. The base Figma node has no trailing
 *   slot; `trailing` is exposed as an optional composition slot (renders
 *   nothing when unused, keeping the base 1:1).
 *
 * States: the Figma node defines a single visual state (no hover / selected /
 * disabled variants). When `onClick` is provided the row renders as a
 * `<button>`; per the spec's motion note ("if rows become interactive, add a
 * hover background consistent with the DS") it uses the DS ghost pressed
 * token for hover and for the combined Pressed/Focused state (no focus ring,
 * matching the rest of the DS). Disabled follows the DS-wide pattern
 * (`text-disabled`, transparent background) since the spec defines no
 * dedicated tokens for it.
 */

export interface ListRowProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Main row text, Actions/Medium (16/20), medium weight, text-primary. */
  label: ReactNode
  /**
   * Supporting line under the label, Paragraph/Medium (14/20), regular,
   * text-secondary; truncates to a single line with ellipsis.
   */
  caption?: ReactNode
  /** Leading avatar slot, 40×40px, clipped to radius-circle. */
  avatar?: ReactNode
  /**
   * Optional trailing slot (composition extension, the base Figma node has
   * no trailing slot, so nothing renders when omitted).
   */
  trailing?: ReactNode
  /** When provided, the row renders as a `<button>` with interactive states. */
  onClick?: MouseEventHandler<HTMLButtonElement>
  /** Disables the interactive row (only meaningful with `onClick`). */
  disabled?: boolean
}

export function ListRow({
  label,
  caption,
  avatar,
  trailing,
  onClick,
  disabled = false,
  className,
  ...rest
}: ListRowProps): ReactElement {
  const interactive = onClick != null

  const rootClass = cn(
    // Wrapper/wrap-16 x, Wrapper/wrap-12 y, Corner Radius/radius-12,
    // transparent background per spec.
    'flex items-center rounded-token-12 px-4 py-3',
    interactive &&
      'w-full text-left transition-colors duration-200 ease-standard focus-visible:outline-none',
    // Hover + Pressed/Focused (one state, no focus ring), DS ghost pressed
    // scrim, per the spec's motion note for interactive rows.
    interactive &&
      !disabled &&
      'hover:bg-btn-ghost-pressed active:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed',
    disabled && 'cursor-not-allowed',
    className
  )

  const content = (
    <>
      {avatar ? (
        <span className="flex size-10 shrink-0 items-center justify-center overflow-clip rounded-circle [&>img]:size-full [&>img]:object-cover [&>svg]:size-full">
          {avatar}
        </span>
      ) : null}
      <div className="flex min-w-px flex-1 flex-col justify-center break-words">
        <span
          className={cn(
            'w-full text-action-medium font-medium',
            disabled ? 'text-disabled' : 'text-primary'
          )}
        >
          {label}
        </span>
        {caption != null ? (
          <span
            className={cn(
              'truncate text-paragraph-medium font-normal',
              disabled ? 'text-disabled' : 'text-secondary'
            )}
          >
            {caption}
          </span>
        ) : null}
      </div>
      {trailing ? (
        <span className="flex shrink-0 items-center">{trailing}</span>
      ) : null}
    </>
  )

  if (interactive) {
    return (
      <button
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={rootClass}
      >
        {content}
      </button>
    )
  }

  return (
    <div {...rest} className={rootClass}>
      {content}
    </div>
  )
}
