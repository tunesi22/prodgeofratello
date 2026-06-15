import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * ContextualMenu, implemented 1:1 from `.design/specs/contextual-menu.md`
 * (Figma node 57:34340).
 *
 * The node has no variant props, it is a pure container composing `.base List`
 * rows (ListRow). Spec anatomy:
 * - Vertical flex, width 360px (example width; overridable via `width`),
 *   min-height 72px, `overflow: clip` (rows' own radius is hidden by clipping).
 * - 1px solid border-neutral-primary, radius token-12, background bg-primary.
 * - NO separators between rows (rows touch directly), no trailing icon slot,
 *   no hover/active/disabled states defined on this node, no shadow defined.
 *
 * Accessibility (documented deviation): the default `role="menu"` is only valid
 * when every row is given `role="menuitem"`, ListRow does not add it by itself.
 * For purely presentational usage override the role (e.g. `role="group"` or
 * `role="presentation"`). No arrow-key navigation is built in; when composing an
 * interactive menu, wire keyboard handling (ArrowUp/ArrowDown/Escape, focus
 * management) at the call site.
 */

export interface ContextualMenuProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Container width. Number = px. Default: 360px (the spec's example width),
   * applied as a class; any other value is applied as an inline style.
   */
  width?: number | string
  /** Menu rows (ListRow items). */
  children?: ReactNode
}

export function ContextualMenu({
  width,
  role = 'menu',
  className,
  style,
  children,
  ...rest
}: ContextualMenuProps): ReactElement {
  const widthStyle: CSSProperties | undefined =
    width === undefined
      ? undefined
      : { width: typeof width === 'number' ? `${width}px` : width }

  return (
    <div
      {...rest}
      role={role}
      style={widthStyle || style ? { ...widthStyle, ...style } : undefined}
      className={cn(
        // Vertical stack of rows, min-height 72px, rows clipped to the 12px radius.
        'flex min-h-[72px] flex-col overflow-clip',
        'rounded-token-12 border border-neutral-primary bg-primary',
        width === undefined && 'w-[360px]',
        className
      )}
    >
      {children}
    </div>
  )
}
