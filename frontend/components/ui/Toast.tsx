'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DURATION, EASE_EXIT, EASE_STANDARD } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { CheckCircleIcon, XCircleIcon, InfoIcon, CloseIcon } from '@/components/onboarding/icons'

/**
 * Toast notifications, a top-center stack for transient action feedback
 * (copied, generated, saved, errors). `ToastProvider` is mounted once in the
 * root layout; any client component calls `useToast()` to push toasts.
 *
 * NOTE: not yet a Figma design-system component (no spec exists). Added on
 * request; styled with DS tokens + motion tokens, rendered via a portal to
 * escape overflow/stacking contexts. If designed in Figma later, swap to it.
 */
export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  /** Milliseconds before auto-dismiss. Default 4000. */
  duration?: number
}

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, options?: ToastOptions) => void
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
}

const noop = (): void => {}
const ToastContext = createContext<ToastContextValue>({
  toast: noop,
  success: noop,
  error: noop,
  info: noop,
})

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}

const DEFAULT_DURATION_MS = 4000

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; icon: string; Icon: (props: { className?: string }) => ReactElement }
> = {
  success: { border: 'border-brand-token', icon: 'text-brand-token', Icon: CheckCircleIcon },
  error: { border: 'border-error-token', icon: 'text-error-token', Icon: XCircleIcon },
  info: { border: 'border-neutral-secondary', icon: 'text-secondary', Icon: InfoIcon },
}

export function ToastProvider({ children }: { children: ReactNode }): ReactElement {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [mounted, setMounted] = useState(false)
  const idRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dismiss = useCallback((id: number): void => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message: string, variant: ToastVariant = 'info', options?: ToastOptions): void => {
      idRef.current += 1
      const id = idRef.current
      setToasts((list) => [...list, { id, message, variant }])
      window.setTimeout(() => dismiss(id), options?.duration ?? DEFAULT_DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: push,
      success: (message, options) => push(message, 'success', options),
      error: (message, options) => push(message, 'error', options),
      info: (message, options) => push(message, 'info', options),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
            <AnimatePresence>
              {toasts.map((toast) => (
                <ToastRow key={toast.id} item={toast} onDismiss={() => dismiss(toast.id)} />
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }): ReactElement {
  const prefersReducedMotion = useReducedMotion()
  const { border, icon, Icon } = VARIANT_STYLES[item.variant]
  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: DURATION.medium, ease: EASE_STANDARD } }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -16, transition: { duration: DURATION.short, ease: EASE_EXIT } }
      }
      className={cn(
        'pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-token-12 border bg-card px-4 py-3 shadow-regular-lg',
        border,
      )}
    >
      <span className={cn('flex size-5 shrink-0 items-center justify-center', icon)}>
        <Icon className="size-5" />
      </span>
      <p className="min-w-0 flex-1 text-paragraph-medium text-primary">{item.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup"
        className="shrink-0 text-tertiary outline-none transition-colors duration-200 ease-standard hover:text-primary focus-visible:text-primary"
      >
        <CloseIcon className="size-4" />
      </button>
    </motion.div>
  )
}
