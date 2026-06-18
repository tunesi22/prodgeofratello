'use client'

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactElement, ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Top loading bar: a thin brand-green line pinned to the very top of the
 * viewport that animates during loading, like NProgress.
 *
 * It auto-starts when the user clicks an internal link (route navigation) and
 * auto-completes once the route settles. It is also exposed via
 * `useTopLoading()` so async actions (scans, generation, imports) can show the
 * same bar with `start()` / `done()`. Calls are reference-counted, so
 * overlapping operations behave correctly.
 */

interface TopLoadingContextValue {
  start: () => void
  done: () => void
}

const TopLoadingContext = createContext<TopLoadingContextValue>({ start: () => {}, done: () => {} })

export function useTopLoading(): TopLoadingContextValue {
  return useContext(TopLoadingContext)
}

const TRICKLE_MS = 220
const COMPLETE_FADE_MS = 320
/** Safety net so the bar never sticks if a navigation never resolves. */
const MAX_DURATION_MS = 10000

export function TopLoadingProvider({ children }: { children: ReactNode }): ReactElement {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const active = useRef(0)
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visibleRef = useRef(false)

  const clearTimers = useCallback((): void => {
    if (trickle.current) {
      clearInterval(trickle.current)
      trickle.current = null
    }
    if (safety.current) {
      clearTimeout(safety.current)
      safety.current = null
    }
  }, [])

  const start = useCallback((): void => {
    active.current += 1
    if (active.current > 1) return // already running
    visibleRef.current = true
    setVisible(true)
    setProgress(8)
    clearTimers()
    // Trickle toward 90% but never reach it until done().
    trickle.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.4, (90 - p) * 0.08)))
    }, TRICKLE_MS)
    safety.current = setTimeout(() => {
      active.current = 0
      finish()
    }, MAX_DURATION_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = useCallback((): void => {
    clearTimers()
    setProgress(100)
    window.setTimeout(() => {
      visibleRef.current = false
      setVisible(false)
      setProgress(0)
    }, COMPLETE_FADE_MS)
  }, [clearTimers])

  const done = useCallback((): void => {
    if (!visibleRef.current) return // nothing in flight
    active.current = Math.max(0, active.current - 1)
    if (active.current > 0) return // other operations still running
    finish()
  }, [finish])

  useEffect(() => clearTimers, [clearTimers])

  return (
    <TopLoadingContext.Provider value={{ start, done }}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]"
      >
        {visible && (
          <div
            className="h-full rounded-r-full bg-[var(--icon-brand)] transition-[width,opacity] duration-200 ease-standard"
            style={{
              width: `${progress}%`,
              opacity: progress >= 100 ? 0 : 1,
              boxShadow: '0 0 8px 0 var(--icon-brand)',
            }}
          />
        )}
      </div>
      <Suspense fallback={null}>
        <RouteLoadingWatcher start={start} done={done} />
      </Suspense>
      {children}
    </TopLoadingContext.Provider>
  )
}

/**
 * Bridges browser navigation to the bar: start on an internal link click,
 * complete when the route (pathname or query) actually changes.
 */
function RouteLoadingWatcher({ start, done }: TopLoadingContextValue): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRun = useRef(true)

  // Complete the bar once the route has settled (skips the initial mount).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    done()
  }, [pathname, searchParams, done])

  // Start the bar when a same-origin link is about to navigate.
  useEffect(() => {
    function onClick(e: MouseEvent): void {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const target = e.target as HTMLElement | null
      const anchor = target?.closest?.('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (href == null || href === '') return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return
      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      // Same path + query means no navigation (or just a hash) -> no bar.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      start()
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [start])

  return null
}
