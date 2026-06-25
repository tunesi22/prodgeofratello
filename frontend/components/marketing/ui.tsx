import Link from 'next/link'
import type { ReactElement, ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'

/**
 * Marketing UI primitives. These are NOT dashboard DS components, they are
 * landing-page building blocks, but they still use the brand design tokens
 * (colors, typography, radii) for consistency. Server components by default.
 */

/** The brand green hero/gradient surface (deep green with top-left + bottom-right glows). */
export const HERO_BG =
  'radial-gradient(70% 95% at 12% 0%, var(--color-brand-400), transparent 55%), ' +
  'radial-gradient(65% 85% at 92% 100%, var(--color-brand-400), transparent 50%), ' +
  'linear-gradient(165deg, var(--color-brand-600), var(--color-brand-700) 55%, var(--color-brand-800))'

/** Constrained content width. */
export function Container({ children, className }: { children: ReactNode; className?: string }): ReactElement {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-6 lg:px-10', className)}>{children}</div>
}

/** Vertical section spacing wrapper. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}): ReactElement {
  return (
    <section id={id} className={cn('py-20 lg:py-28', className)}>
      {children}
    </section>
  )
}

/** Small uppercase label above a heading. */
export function Eyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center font-serif text-h6 font-medium',
        onDark ? 'text-brand-100' : 'text-brand-token',
      )}
    >
      {children}
    </span>
  )
}

/** Section heading + optional lead paragraph, centered or left-aligned. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  onDark,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  onDark?: boolean
}): ReactElement {
  return (
    <div className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center')}>
      {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          'text-h3 font-semibold tracking-tight lg:text-h2',
          onDark ? 'text-white-remain' : 'text-primary',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'max-w-2xl text-paragraph-big leading-relaxed',
            onDark ? 'text-brand-100' : 'text-neutral-500',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      )}
    </div>
  )
}

export type ButtonVariant = 'primary' | 'light' | 'ghost' | 'outline-light'

// Variant-aware: dark (brand) focus ring on light surfaces, white ring on the
// dark-green hero/CTA surfaces — so the keyboard focus ring is always visible.
const CTA_STYLES: Record<ButtonVariant, string> = {
  // Deep-green pill for light surfaces (footer / CTA).
  primary: 'bg-brand-600 text-white ring-1 ring-inset ring-brand-500 hover:bg-brand-700 focus-visible:outline-brand-600',
  // Solid white pill — the primary action on the dark-green hero / CTA.
  light: 'bg-white text-brand-700 ring-1 ring-inset ring-brand-25 hover:bg-brand-10 focus-visible:outline-white',
  // Quiet bordered button for light surfaces.
  ghost: 'border border-neutral-primary bg-card text-primary hover:border-brand-token hover:bg-secondary focus-visible:outline-brand-600',
  // Outlined glass secondary that sits on the dark-green hero / CTA surfaces.
  'outline-light': 'bg-white/10 text-white ring-1 ring-inset ring-white/50 backdrop-blur-sm hover:bg-white/20 hover:ring-white focus-visible:outline-white',
}
const CTA_SIZES: Record<'md' | 'lg', string> = {
  md: 'px-5 py-2.5 text-paragraph-medium',
  lg: 'px-7 py-3.5 text-paragraph-big',
}

/** Shared CTA class builder so link CTAs and the demo button render identically. */
export function ctaButtonClasses(variant: ButtonVariant = 'primary', size: 'md' | 'lg' = 'md', className?: string): string {
  return cn(
    'group inline-flex items-center justify-center gap-2 rounded-token-12 font-semibold',
    CTA_SIZES[size],
    'transition-all duration-200 ease-standard hover:-translate-y-0.5',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    CTA_STYLES[variant],
    className,
  )
}

/** Marketing CTA link button (renders an anchor via next/link). */
export function CTAButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  iconRight,
  iconLeft,
}: {
  href: string
  children: ReactNode
  variant?: ButtonVariant
  size?: 'md' | 'lg'
  className?: string
  iconRight?: boolean
  iconLeft?: ReactNode
}): ReactElement {
  return (
    <Link href={href} className={ctaButtonClasses(variant, size, className)}>
      {iconLeft}
      {children}
      {iconRight && (
        <ArrowRight
          className="size-4 transition-transform duration-200 ease-standard group-hover:translate-x-0.5"
          aria-hidden="true"
          weight="bold"
        />
      )}
    </Link>
  )
}

/** A feature/benefit card with an icon, title, and copy. */
export function FeatureCard({
  icon,
  title,
  children,
  href,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  href?: string
}): ReactElement {
  const inner = (
    <>
      <span className="flex size-11 items-center justify-center rounded-token-12 bg-display-brand text-icon-brand">
        {icon}
      </span>
      <h3 className="mt-5 text-label-big font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-paragraph-medium leading-relaxed text-neutral-500">{children}</p>
      {href && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-paragraph-medium font-semibold text-brand-token">
          Pelajari
          <ArrowRight className="size-4" aria-hidden="true" weight="bold" />
        </span>
      )}
    </>
  )
  const cls =
    'group flex h-full flex-col rounded-token-16 border border-neutral-primary bg-card p-6 transition-colors duration-200 ease-standard hover:border-brand-token'
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

/** A single big stat with label + description (the "by the numbers" pattern). */
export function Stat({
  value,
  label,
  children,
  onDark,
}: {
  value: string
  label: string
  children?: ReactNode
  onDark?: boolean
}): ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn('text-h2 font-semibold leading-none', onDark ? 'text-white-remain' : 'text-primary')}>
        {value}
      </div>
      <div className={cn('text-label-big font-semibold', onDark ? 'text-brand-100' : 'text-primary')}>{label}</div>
      {children && (
        <p className={cn('text-paragraph-medium leading-relaxed', onDark ? 'text-brand-200' : 'text-neutral-500')}>
          {children}
        </p>
      )}
    </div>
  )
}
