'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface Prompt {
  _id: string
  text: string
  category: string
  isActive: boolean
}

const CATEGORY_STYLES: Record<string, string> = {
  discovery: 'bg-blue-50 text-blue-700 border-blue-100',
  comparison: 'bg-purple-50 text-purple-700 border-purple-100',
  recommendation: 'bg-green-50 text-green-700 border-green-100',
  'use-case': 'bg-amber-50 text-amber-700 border-amber-100',
  'best-of': 'bg-orange-50 text-orange-700 border-orange-100',
}

export default function PromptsPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function fetchPrompts() {
    try {
      const data = await apiFetch<{ count: number; prompts: Prompt[] }>(`/brands/${id}/prompts`)
      setPrompts(data.prompts)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrompts() }, [id])

  async function handleGenerate(regenerate = false) {
    setGenerating(true)
    setError('')
    try {
      const url = `/brands/${id}/prompts${regenerate ? '?regenerate=true' : ''}`
      const data = await apiFetch<{ count: number; prompts: Prompt[] }>(url, { method: 'POST' })
      setPrompts(data.prompts)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const grouped = prompts.reduce<Record<string, Prompt[]>>((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {prompts.length > 0 ? `${prompts.length} prompts across ${Object.keys(grouped).length} categories` : 'Auto-generated via Claude'}
          </p>
        </div>
        <div className="flex gap-2">
          {prompts.length === 0 ? (
            <button
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating...' : 'Generate Prompts'}
            </button>
          ) : (
            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:border-gray-900 hover:text-gray-900 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}
        </div>
      </div>

      <BrandNav id={id} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm mb-4">{error}</div>
      )}

      {(loading || generating) && (
        <div className="space-y-3">
          {generating && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
              Generating 25 prompts via Claude... this takes ~10 seconds
            </div>
          )}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !generating && prompts.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 font-medium">No prompts yet</p>
          <p className="text-gray-400 text-sm mt-1">Click Generate to auto-create 25 prompts via Claude</p>
        </div>
      )}

      {!loading && !generating && prompts.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${CATEGORY_STYLES[category] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                  {category}
                </span>
                <span className="text-xs text-gray-400">{items.length} prompts</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {items.map((prompt) => (
                  <div key={prompt._id} className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    {prompt.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
