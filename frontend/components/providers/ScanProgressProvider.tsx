'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

/**
 * Global scan progress. A scan (Overview "Run Scan") queries every active prompt
 * across the plan's models, 5× each, on a BullMQ queue, so it takes minutes. The
 * progress used to live only on the Overview page and vanished on navigation;
 * this provider lifts it above the app shell so a single sticky banner can
 * follow the user across every page until the scan finishes.
 *
 * Progress is simulated on a clock here (the mock backend does no real work).
 * For the real backend, call `markComplete()` from the Overview poll the moment
 * stored results reach the target, so the bar finishes on real data, not the
 * estimate. See `catatan backend.md`.
 */

export interface ScanInfo {
  brandId: string
  brandName: string
  /** Total checks (prompts × models × runs) this scan will collect. */
  total: number
  /** Checks completed so far (simulated from the clock, or set by markComplete). */
  done: number
  /** epoch ms when the scan started. */
  startedAt: number
  /** Estimated total duration in ms, used for the progress bar + ETA. */
  durationMs: number
  status: 'running' | 'done'
}

interface ScanProgressValue {
  scan: ScanInfo | null
  startScan: (opts: { brandId: string; brandName: string; total: number }) => void
  /** Force-finish (e.g. real backend reports the scan is done). */
  markComplete: () => void
  /** Clear the banner. */
  dismiss: () => void
}

const ScanProgressContext = createContext<ScanProgressValue | null>(null)

const STORAGE_KEY = 'fratello-active-scan'
/** Pace of the simulated scan and the bounds we keep the estimate within. */
const MS_PER_CHECK = 1200
const MIN_DURATION = 45_000
const MAX_DURATION = 180_000
/** How long the "done" state lingers before auto-dismissing. */
const DONE_LINGER_MS = 6000

function estimateDuration(total: number): number {
  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, total * MS_PER_CHECK))
}

/** Checks completed by `now`, derived from the clock (never exceeds total). */
function checksDone(scan: ScanInfo, now: number): number {
  const frac = (now - scan.startedAt) / scan.durationMs
  return Math.min(scan.total, Math.max(0, Math.round(frac * scan.total)))
}

export function ScanProgressProvider({ children }: { children: ReactNode }): ReactElement {
  const [scan, setScan] = useState<ScanInfo | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback((): void => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (dismissRef.current) clearTimeout(dismissRef.current)
    tickRef.current = null
    dismissRef.current = null
  }, [])

  const dismiss = useCallback((): void => {
    clearTimers()
    setScan(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* sessionStorage unavailable — nothing to clean up */
    }
  }, [clearTimers])

  const finish = useCallback((): void => {
    clearTimers()
    setScan((prev) => (prev ? { ...prev, done: prev.total, status: 'done' } : prev))
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    dismissRef.current = setTimeout(() => setScan(null), DONE_LINGER_MS)
  }, [clearTimers])

  // Drive a running scan: tick once a second, finishing when the clock elapses.
  const run = useCallback(
    (info: ScanInfo): void => {
      clearTimers()
      tickRef.current = setInterval(() => {
        const now = Date.now()
        if (now - info.startedAt >= info.durationMs) {
          finish()
        } else {
          setScan((prev) => (prev && prev.status === 'running' ? { ...prev, done: checksDone(info, now) } : prev))
        }
      }, 1000)
    },
    [clearTimers, finish],
  )

  const startScan = useCallback(
    ({ brandId, brandName, total }: { brandId: string; brandName: string; total: number }): void => {
      const info: ScanInfo = {
        brandId,
        brandName,
        total,
        done: 0,
        startedAt: Date.now(),
        durationMs: estimateDuration(total),
        status: 'running',
      }
      setScan(info)
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info))
      } catch {
        /* ignore */
      }
      run(info)
    },
    [run],
  )

  const markComplete = useCallback((): void => {
    finish()
  }, [finish])

  // Resume across a full page reload: rebuild from sessionStorage.
  useEffect(() => {
    let stored: ScanInfo | null = null
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      stored = raw ? (JSON.parse(raw) as ScanInfo) : null
    } catch {
      stored = null
    }
    if (!stored || stored.status !== 'running') return
    const now = Date.now()
    if (now - stored.startedAt >= stored.durationMs) {
      finish()
    } else {
      setScan({ ...stored, done: checksDone(stored, now) })
      run(stored)
    }
    return () => clearTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ScanProgressContext.Provider value={{ scan, startScan, markComplete, dismiss }}>
      {children}
    </ScanProgressContext.Provider>
  )
}

export function useScanProgress(): ScanProgressValue {
  const ctx = useContext(ScanProgressContext)
  if (ctx == null) {
    throw new Error('useScanProgress must be used within ScanProgressProvider')
  }
  return ctx
}
