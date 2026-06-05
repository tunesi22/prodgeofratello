'use client'

import { useAuth } from '@clerk/nextjs'

const API_BASE = '/api'

export function useApiFetch() {
  const { getToken } = useAuth()

  return async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const token = await getToken()

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers as Record<string, string> || {}),
      },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || 'Request failed')
    }

    return res.json()
  }
}
