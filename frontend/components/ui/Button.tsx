import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Button, implemented 1:1 from `.design/specs/button.md` (Figma node 51:23650).
 *
 * Variant matrix: type (primary | ghost | error | primary-outlined |
 * error-outlined) × size (sm | md | lg) × state (idle | pressed/focused |
 * disabled), with optional iconLeft / iconRight slots (20px at SM, 24px at
 * MD/LG; icons inherit currentColor so they always match the label color).
 *
 * State rules per spec:
 * - Pressed and Focused are ONE state: `active:` + `focus-visible:` share the
 *   same fill change; no focus ring is drawn anywhere in the set.
 * - Disabled filled/ghost: dedicated tokens (btn-disabled bg, text-disabled).
 * - Disabled outlined: colors stay brand/error, container gets opacity-50.
 * - No hover state is defined in the component set.
 */

export type ButtonType =
  | 'primary'
  | 'ghost'
  | 'error'
  | 'primary-outlined'
  | 'error-outlined'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual variant. Default: 'primary'. */
  type?: ButtonType
  /** Size: sm (36px), md (40px), lg (48px). Default: 'sm'. */
  size?: ButtonSize
  /** Optional leading icon (20px slot at SM, 24px at MD/LG; inherits text color). */
  iconLeft?: ReactNode
  /** Optional trailing icon (same slot as iconLeft). */
  iconRight?: ReactNode
  /** Native `type` attribute (the `type` prop is the visual variant). Default: 'button'. */
  htmlType?: 'button' | 'submit' | 'reset'
  /** Button label. */
  children?: ReactNode
}

// hover uses the same token as pressed/focused (the DS defines idle + pressed
// shades only). `enabled:` gates it so disabled buttons never react to hover.
const TYPE_CLASSES: Record<ButtonType, string> = {
  // Idle: btn-primary / text-white-remain; Hover/Pressed/Focused: btn-primary-pressed;
  // Disabled: btn-disabled / text-disabled.
  primary:
    'bg-btn-primary text-white-remain enabled:hover:bg-btn-primary-pressed active:bg-btn-primary-pressed focus-visible:bg-btn-primary-pressed disabled:bg-btn-disabled disabled:text-disabled',
  // Idle: transparent / text-primary; Hover/Pressed/Focused: btn-ghost-pressed scrim;
  // Disabled: stays transparent, text-disabled.
  ghost:
    'bg-transparent text-primary enabled:hover:bg-btn-ghost-pressed active:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed disabled:bg-transparent disabled:text-disabled',
  // Idle: btn-error / text-white-remain; Hover/Pressed/Focused: btn-error-pressed;
  // Disabled: btn-disabled / text-disabled.
  error:
    'bg-btn-error text-white-remain enabled:hover:bg-btn-error-pressed active:bg-btn-error-pressed focus-visible:bg-btn-error-pressed disabled:bg-btn-disabled disabled:text-disabled',
  // Idle: transparent, text-brand, 1px border-brand; Hover/Pressed/Focused: tinted
  // btn-primary-light fill (border stays); Disabled: opacity-50 on container.
  'primary-outlined':
    'border border-brand-token bg-transparent text-brand-token enabled:hover:bg-btn-primary-light active:bg-btn-primary-light focus-visible:bg-btn-primary-light disabled:bg-transparent disabled:opacity-50',
  // Idle: transparent, text-error, 1px border-error; Hover/Pressed/Focused: tinted
  // btn-error-light fill (border stays); Disabled: opacity-50 on container.
  'error-outlined':
    'border border-error-token bg-transparent text-error-token enabled:hover:bg-btn-error-light active:bg-btn-error-light focus-visible:bg-btn-error-light disabled:bg-transparent disabled:opacity-50',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  // SM: 36px = 8+20+8, px 12, py 8, gap 8, Actions/Small (14/16) Medium
  // (36 is not on the DS spacing scale, exact spec dimension, allowed per CONVENTIONS)
  sm: 'h-[36px] gap-2 px-3 py-2 text-action-small',
  // MD: 40px = 8+24+8, px 12, py 8, gap 8, Actions/Medium (16/20) Medium
  md: 'h-10 gap-2 px-3 py-2 text-action-medium',
  // LG: 48px = 12+24+12, px 16, py 12, gap 8, Actions/Big (18/24) Medium
  lg: 'h-12 gap-2 px-4 py-3 text-action-big',
}

// Icon slot: 20×20 at SM, 24×24 at MD/LG; icons inherit currentColor.
const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-6',
}

export function Button({
  type = 'primary',
  size = 'sm',
  iconLeft,
  iconRight,
  htmlType = 'button',
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const iconClass = cn(
    'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
    ICON_SIZE_CLASSES[size]
  )

  return (
    <button
      {...rest}
      type={htmlType}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center overflow-clip rounded-token-8 font-medium',
        'transition-colors duration-200 ease-standard',
        // Pressed/Focused are one state in this DS, no focus ring drawn.
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed',
        SIZE_CLASSES[size],
        TYPE_CLASSES[type],
        className
      )}
    >
      {iconLeft ? (
        <span aria-hidden="true" className={iconClass}>
          {iconLeft}
        </span>
      ) : null}
      {/* MD quirk per spec: label box gets py-[2px] so the 20px line box is 24px tall. */}
      <span
        className={cn(
          'whitespace-nowrap',
          size === 'md' && 'flex items-center justify-center py-[2px]'
        )}
      >
        {children}
      </span>
      {iconRight ? (
        <span aria-hidden="true" className={iconClass}>
          {iconRight}
        </span>
      ) : null}
    </button>
  )
}
