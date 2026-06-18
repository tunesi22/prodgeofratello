import * as React from 'react'
import { cn } from '@/lib/cn'

/**
 * IconButton, Fratello DS, implemented 1:1 from `.design/specs/icon-button.md`
 * (Figma component set 52:25162).
 *
 * Square button holding a single icon. Same type/size/state matrix as Button:
 * 5 types × 3 sizes × 3 states (Idle, Pressed / Focused, Disabled).
 */

export type IconButtonType =
  | 'primary'
  | 'ghost'
  | 'error'
  | 'primary-outlined'
  | 'error-outlined'

export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  /** Visual variant (Figma `Type`). Default: `primary`. */
  type?: IconButtonType
  /** sm 36×36 / md 40×40 / lg 48×48 (Figma `Size`). Default: `sm`. */
  size?: IconButtonSize
  /**
   * Controlled "Pressed / Focused" state (sets `data-pressed="true"`).
   * Uncontrolled pressing is handled via `:active` / `:focus-visible`.
   */
  pressed?: boolean
  /** Native button type, `type` is taken by the DS variant. Default: `button`. */
  htmlType?: 'button' | 'submit' | 'reset'
  /** Accessible name, required: the only child is a decorative icon. */
  'aria-label': string
  /** The single icon (rendered inside an exactly-sized, aria-hidden slot). */
  children: React.ReactNode
  className?: string
}

/* Outer size is fixed per spec (36/40/48 have no DS spacing utility); padding
   per spec: sm 8px (wrap-8), md 10px (raw value, no DS token exists), lg 12px
   (wrap-12). Icon slot: 20px (sm/md), 24px (lg), DS 4px scale. */
const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-[36px] p-2',
  md: 'size-[40px] p-[10px]',
  lg: 'size-[48px] p-3',
}

const iconSlotClasses: Record<IconButtonSize, string> = {
  sm: 'size-5',
  md: 'size-5',
  lg: 'size-6',
}

/* Per spec, "Pressed / Focused" is a single state: focus-visible mirrors
   pressed; no focus ring or hover state exists. Idle outlined borders are
   normalized to Border/border-* tokens (spec recommendation, Figma binds
   them to icon tokens with identical resolutions in both themes). */
const typeClasses: Record<IconButtonType, { enabled: string; disabled: string }> = {
  // hover mirrors the pressed token; the enabled string only applies when not
  // disabled, so plain `hover:` is already safe here.
  primary: {
    enabled:
      'bg-btn-primary text-icon-white-remain hover:bg-btn-primary-pressed active:bg-btn-primary-pressed focus-visible:bg-btn-primary-pressed data-[pressed=true]:bg-btn-primary-pressed',
    disabled: 'bg-btn-disabled text-icon-disabled',
  },
  ghost: {
    enabled:
      'text-icon-black-invert hover:bg-btn-ghost-pressed active:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed data-[pressed=true]:bg-btn-ghost-pressed',
    disabled: 'text-icon-disabled',
  },
  error: {
    enabled:
      'bg-btn-error text-icon-white-remain hover:bg-btn-error-pressed active:bg-btn-error-pressed focus-visible:bg-btn-error-pressed data-[pressed=true]:bg-btn-error-pressed',
    disabled: 'bg-btn-disabled text-icon-disabled',
  },
  'primary-outlined': {
    enabled:
      'border border-brand-token text-icon-brand hover:bg-btn-primary-light active:bg-btn-primary-light focus-visible:bg-btn-primary-light data-[pressed=true]:bg-btn-primary-light',
    // Disabled outlined drops the border entirely, solid disabled fill, no opacity.
    disabled: 'bg-btn-disabled text-icon-disabled',
  },
  'error-outlined': {
    enabled:
      'border border-error-token text-icon-error hover:bg-btn-error-light active:bg-btn-error-light focus-visible:bg-btn-error-light data-[pressed=true]:bg-btn-error-light',
    disabled: 'bg-btn-disabled text-icon-disabled',
  },
}

export function IconButton({
  type = 'primary',
  size = 'sm',
  pressed = false,
  htmlType = 'button',
  disabled = false,
  className,
  children,
  ...rest
}: IconButtonProps): React.ReactElement {
  return (
    <button
      type={htmlType}
      disabled={disabled}
      data-pressed={!disabled && pressed ? 'true' : undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-clip rounded-token-8 outline-none',
        'transition-colors duration-200 ease-standard',
        sizeClasses[size],
        disabled ? typeClasses[type].disabled : typeClasses[type].enabled,
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full',
          iconSlotClasses[size],
        )}
      >
        {children}
      </span>
    </button>
  )
}
