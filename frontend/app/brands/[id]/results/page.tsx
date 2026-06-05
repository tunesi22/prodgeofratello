'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface QueryResult {
  _id: string
  model: string
  mentioned: boolean
  sentiment: string
  mentionContext: string
  queriedAt: string
  promptId: { _id: string; text: string; category: string } | null
}

interface ResultsResponse {
  total: number
  page: number
  results: QueryResult[]
}

const MODEL_LABELS: Record<string, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  anthropic: 'Claude',
}

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'text-green-600 bg-green-50',
  neutral: 'text-gray-500 bg-gray-100',
  negative: 'text-red-600 bg-red-50',
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [modelFilter, setModelFilter] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (modelFilter) params.set('model', modelFilter)
    apiFetch<ResultsResponse>(`/brands/${id}/results?${params}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, modelFilter, page])

  const totalPages = data ? Math.ceil(data.total / 50) : 0

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Scan Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.total} total queries` : 'Raw LLM query results'}
          </p>
        </div>
        <select
          value={modelFilter}
          onChange={(e) => { setModelFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="">All Models</option>
          {['openai', 'gemini', 'perplexity', 'anthropic'].map((m) => (
            <option key={m} value={m}>{MODEL_LABELS[m]}</option>
          ))}
        </select>
      </div>

      <BrandNav id={id} />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}

      {loading && (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && data?.results.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 font-medium">No results yet</p>
          <p className="text-gray-400 text-sm mt-1">Run a scan to start collecting data</p>
        </div>
      )}

      {!loading && data && data.results.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Prompt</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Model</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-500">Mentioned</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Sentiment</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.results.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-gray-700 line-clamp-2 text-xs">{r.promptId?.text || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium">{MODEL_LABELS[r.model] || r.model}</td>
                    <td className="px-5 py-3.5 text-center">
                      {r.mentioned
                        ? <span className="text-green-600 font-bold text-base">✓</span>
                        : <span className="text-gray-300 text-base">✗</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      {r.mentioned ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SENTIMENT_STYLES[r.sentiment]}`}>
                          {r.sentiment}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="text-gray-400 text-xs line-clamp-2">{r.mentionContext || '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-gray-900 transition-colors">
                  Prev
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-gray-900 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
