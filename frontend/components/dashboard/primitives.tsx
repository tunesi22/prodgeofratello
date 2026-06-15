'use client'

import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { Popover } from '@/components/ui'
import { QuestionIcon } from '@/components/onboarding/icons'

/**
 * Shared dashboard page primitives, style derived from Figma 55:137:
 * 756px centered content column (px-24/py-80, gap-40), H3 page titles with
 * Paragraph/Medium secondary subtitles, H6 section headings, bordered
 * radius-12 rows, display-brand radius-16 feature cards.
 */

/** Centered content column. `wide` for data-dense pages (tables/charts). */
export function PageContainer({
  children,
  wide = false,
  className,
}: {
  children: ReactNode
  wide?: boolean
  className?: string
}): ReactElement {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={cn(
        'mx-auto flex w-full flex-col gap-6 px-6 py-8',
        wide ? 'max-w-[1100px]' : 'max-w-[756px] py-12',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

/** Page header: optional logo/icon slot, H3 title, secondary subtitle, actions right. */
export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
}): ReactElement {
  return (
    <motion.header variants={fadeUp} className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center gap-2">
        {icon != null && <span className="flex shrink-0 items-center [&>svg]:h-[30px]">{icon}</span>}
        <h1 className="min-w-0 flex-1 truncate text-h3 font-normal text-primary transition-colors duration-300 ease-standard">
          {title}
        </h1>
        {actions != null && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {subtitle != null && (
        <p className="text-paragraph-medium text-secondary transition-colors duration-300 ease-standard">{subtitle}</p>
      )}
    </motion.header>
  )
}

/**
 * Section: H6 heading + optional right cluster, then children. An optional
 * `help` collapses an explainer into a "?" popover next to the title (keeps
 * pages dense instead of a long subtitle paragraph under every heading).
 */
export function Section({
  title,
  right,
  help,
  helpLabel,
  children,
  className,
}: {
  title?: string
  right?: ReactNode
  /** Explainer text shown in a "?" popover beside the title. */
  help?: ReactNode
  /** Accessible label for the help trigger (defaults to the title). */
  helpLabel?: string
  children: ReactNode
  className?: string
}): ReactElement {
  return (
    <motion.section variants={fadeUp} className={cn('flex w-full flex-col gap-4', className)}>
      {(title != null || right != null) && (
        <div className="flex w-full items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <h2 className="min-w-0 text-h6 font-normal text-primary transition-colors duration-300 ease-standard">
              {title}
            </h2>
            {help != null && (
              <Popover label={helpLabel ?? title} content={help} side="bottom">
                <QuestionIcon className="size-4" />
              </Popover>
            )}
          </div>
          {right != null && <div className="flex shrink-0 items-center gap-2">{right}</div>}
        </div>
      )}
      {children}
    </motion.section>
  )
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** brand = display-brand filled (feature card); outline = bordered row/panel. */
  variant?: 'outline' | 'brand'
  children?: ReactNode
}

/** Surface card. outline → bordered radius-12; brand → display-brand radius-16. */
export function Card({ variant = 'outline', className, children, ...rest }: CardProps): ReactElement {
  return (
    <div
      {...rest}
      className={cn(
        'transition-colors duration-300 ease-standard',
        variant === 'brand'
          ? 'rounded-token-16 bg-display-brand'
          : 'rounded-token-12 border border-neutral-primary bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Stat: small tertiary label, big number, optional caption/delta. */
export function StatCard({
  label,
  value,
  caption,
  className,
}: {
  label: string
  value: ReactNode
  caption?: ReactNode
  className?: string
}): ReactElement {
  return (
    <Card className={cn('flex flex-col gap-1 p-4', className)}>
      <span className="text-label-medium font-medium text-tertiary">{label}</span>
      <span className="text-h4 font-medium text-primary transition-colors duration-300 ease-standard">{value}</span>
      {caption != null && <span className="text-paragraph-medium text-secondary">{caption}</span>}
    </Card>
  )
}

/** Empty state: icon, title, description, action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}): ReactElement {
  return (
    <Card className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      {icon != null && <span className="text-icon-light-gray [&>svg]:size-8">{icon}</span>}
      <span className="text-h6 font-normal text-primary">{title}</span>
      {description != null && (
        <span className="max-w-[420px] text-paragraph-medium text-secondary">{description}</span>
      )}
      {action != null && <div className="mt-2">{action}</div>}
    </Card>
  )
}

/** Inline error banner (DS display-error tint). */
export function ErrorBanner({ message, className }: { message: string; className?: string }): ReactElement {
  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-token-12 border border-error-token bg-display-error px-4 py-3 text-paragraph-medium text-error-token',
        'transition-colors duration-300 ease-standard',
        className,
      )}
    >
      {message}
    </div>
  )
}

/** Skeleton row for loading states. */
export function Skeleton({ className }: { className?: string }): ReactElement {
  return (
    <div className={cn('animate-pulse rounded-token-12 bg-tertiary opacity-40', className)} aria-hidden="true" />
  )
}
