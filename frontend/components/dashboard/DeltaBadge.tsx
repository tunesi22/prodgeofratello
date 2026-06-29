import type { ReactElement } from 'react'
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react/dist/ssr'
import { type Delta, formatNum } from '@/lib/analytics'
import { cn } from '@/lib/cn'

/**
 * Week-over-week change badge: green up / red down / gray flat, with a Phosphor
 * trend icon. `suffix` is the localized "vs last week" tail. Renders nothing
 * when there is no prior data point to compare against.
 */
export function DeltaBadge({
  delta,
  suffix,
  className,
}: {
  delta: Delta
  suffix?: string
  className?: string
}): ReactElement | null {
  if (delta.value == null) return null
  const Icon = delta.direction === 'up' ? TrendUp : delta.direction === 'down' ? TrendDown : Minus
  const tone =
    delta.direction === 'up'
      ? 'text-brand-token'
      : delta.direction === 'down'
        ? 'text-error-token'
        : 'text-tertiary'
  const sign = delta.value > 0 ? '+' : ''
  const icon = <Icon className="size-4 shrink-0" aria-hidden="true" />
  const valueLabel = `${sign}${formatNum(delta.value)}%${suffix != null ? ` ${suffix}` : ''}`
  // Positive (green) reads value-first with the trend arrow trailing on the
  // right; down/flat keep the conventional leading icon.
  return (
    <span className={cn('inline-flex items-center gap-1 text-label-medium font-medium', tone, className)}>
      {delta.direction === 'up' ? (
        <>
          <span>{valueLabel}</span>
          {icon}
        </>
      ) : (
        <>
          {icon}
          <span>{valueLabel}</span>
        </>
      )}
    </span>
  )
}
