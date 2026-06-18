'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

export interface Project {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
}

const STORAGE_KEY = 'fratello-active-project'

/**
 * Active-project model for the dashboard shell: project-scoped nav sections
 * (Brand Insights, AI Visibility, ...) operate on one active project at a time.
 * The active id follows the URL (/brands/[id]/...) and is persisted so
 * non-project pages (settings, usage, getting started) keep the context.
 */
export function useActiveProject(): {
  projects: Project[]
  loading: boolean
  activeId: string | null
  activeProject: Project | null
  setActive: (id: string) => void
  refresh: () => void
} {
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  // Read synchronously so the first render already has the right id,
  // avoiding the flash where every nav item resolves to /brands.
  const [storedId, setStoredId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  )

  const load = useCallback((): void => {
    fetch('/api/brands', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // The id in the URL always wins and is persisted as it changes.
  const urlId = useMemo(() => {
    const match = pathname?.match(/^\/brands\/([^/]+)/)
    return match && match[1] !== 'new' ? match[1] : null
  }, [pathname])

  useEffect(() => {
    if (urlId) {
      localStorage.setItem(STORAGE_KEY, urlId)
      setStoredId(urlId)
    }
  }, [urlId])

  const activeId = useMemo(() => {
    if (urlId) return urlId
    // While projects are still loading, trust storedId without validation
    // so nav items resolve to real hrefs instead of all collapsing to /brands.
    if (storedId && (loading || projects.some((p) => p._id === storedId))) return storedId
    return projects[0]?._id ?? null
  }, [urlId, storedId, projects, loading])

  const setActive = useCallback((id: string): void => {
    localStorage.setItem(STORAGE_KEY, id)
    setStoredId(id)
  }, [])

  const activeProject = projects.find((p) => p._id === activeId) ?? null

  return { projects, loading, activeId, activeProject, setActive, refresh: load }
}

export interface GettingStartedProgress {
  /** Steps done, 0 to 3: has project / has prompts / has scan results. */
  done: number
  total: 3
  hasProject: boolean
  hasPrompts: boolean
  hasResults: boolean
  loading: boolean
}

/** Computes the Getting Started checklist state from real data. */
export function useGettingStartedProgress(activeId: string | null, hasProject: boolean): GettingStartedProgress {
  const [hasPrompts, setHasPrompts] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeId) {
      setHasPrompts(false)
      setHasResults(false)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/brands/${activeId}/prompts`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d?.count ?? d?.prompts?.length ?? 0) > 0)
        .catch(() => false),
      fetch(`/api/brands/${activeId}/results?page=1&limit=1`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d?.total ?? 0) > 0)
        .catch(() => false),
    ]).then(([prompts, results]) => {
      if (cancelled) return
      setHasPrompts(prompts)
      setHasResults(results)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [activeId])

  const done = (hasProject ? 1 : 0) + (hasPrompts ? 1 : 0) + (hasResults ? 1 : 0)
  return { done, total: 3, hasProject, hasPrompts, hasResults, loading }
}
