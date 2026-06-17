import type { Transition, Variants } from 'framer-motion'

/**
 * Fratello Design System, motion tokens (from Figma motion rules).
 * RULES:
 * - Standard easing for entrances/movement; Exit easing for closing elements.
 * - Durations are consolidated: 200 / 300 / 400 / 500 ms (short → long distance).
 * - Staggered layers: 50ms interval, ONLY vertical movement + opacity
 *   (never scale or horizontal movement in staggers).
 * Never use an arbitrary curve or duration outside these tokens.
 */

export const EASE_STANDARD: [number, number, number, number] = [0.5, 0, 0.2, 1]
export const EASE_EXIT: [number, number, number, number] = [0.4, 1, 0.2, 1]

export const DURATION = {
  /** 200ms, short distance / exits */
  short: 0.2,
  /** 300ms, default */
  medium: 0.3,
  /** 400ms, longer distance */
  long: 0.4,
  /** 500ms, longest distance */
  longest: 0.5,
} as const

/** 50ms interval between staggered layers */
export const STAGGER_INTERVAL = 0.05

export const transitionEnter = (duration: number = DURATION.medium): Transition => ({
  duration,
  ease: EASE_STANDARD,
})

export const transitionExit = (duration: number = DURATION.short): Transition => ({
  duration,
  ease: EASE_EXIT,
})

/** Single element: fade + subtle vertical drift (the only allowed combo for staggers). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.long, ease: EASE_STANDARD },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: DURATION.short, ease: EASE_EXIT },
  },
}

/** Container that staggers its fadeUp children at 50ms intervals. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_INTERVAL } },
  exit: { transition: { staggerChildren: STAGGER_INTERVAL / 2, staggerDirection: -1 } },
}

/** Full-step transition for onboarding screens (vertical + opacity only). */
export const stepVariants: Variants = {
  enter: { opacity: 0, y: 24 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.long, ease: EASE_STANDARD },
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: DURATION.short, ease: EASE_EXIT },
  },
}
