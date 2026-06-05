'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface QueryResult {
  _id: string
  model: string
  mentioned: boolean
  sentiment: string
  mentionContext: string
  response: string
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

const MODEL_COLORS: Record<string, string> = {
  openai: 'bg-green-100 text-green-700',
  gemini: 'bg-blue-100 text-blue-700',
  perplexity: 'bg-purple-100 text-purple-700',
  anthropic: 'bg-orange-100 text-orange-700',
}

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'text-green-700 bg-green-50 border-green-200',
  neutral: 'text-gray-600 bg-gray-100 border-gray-200',
  negative: 'text-red-700 bg-red-50 border-red-200',
}

function highlightBrand(text: string, brandName: string) {
  if (!brandName || !text) return text
  const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    new RegExp(`^${escaped}$`, 'i').test(part)
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
      : part
  )
}

function ResultPanel({
  result,
  brandName,
  onClose,
}: {
  result: QueryResult
  brandName: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[560px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Prompt</p>
            <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
              {result.promptId?.text || '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl leading-none mt-0.5 shrink-0"
          >
            ×
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${MODEL_COLORS[result.model] || 'bg-gray-100 text-gray-600'}`}>
            {MODEL_LABELS[result.model] || result.model}
          </span>
          {result.promptId?.category && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-200 text-gray-600">
              {result.promptId.category}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(result.queriedAt).toLocaleString()}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {result.mentioned ? (
              <>
                <span className="text-green-600 font-semibold text-xs">✓ Mentioned</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SENTIMENT_STYLES[result.sentiment]}`}>
                  {result.sentiment}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-xs font-medium">✗ Not Mentioned</span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Brand context */}
          {result.mentionContext && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Brand Context
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-gray-800 leading-relaxed">
                {highlightBrand(result.mentionContext, brandName)}
              </div>
            </div>
          )}

          {/* Full response */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Full Response
              </p>
              {result.response && (
                <button
                  onClick={() => copy(result.response)}
                  className="text-xs border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-900 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            {result.response ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {highlightBrand(result.response, brandName)}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-4 text-center">
                <p className="text-sm text-gray-400">Full response not stored</p>
                <p className="text-xs text-gray-400 mt-1">Run a new scan to capture full responses</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
          Result ID: {result._id}
        </div>
      </div>
    </>
  )
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [brandName, setBrandName] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [mentionFilter, setMentionFilter] = useState<'' | 'mentioned' | 'not-mentioned'>('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<QueryResult | null>(null)

  useEffect(() => {
    apiFetch<{ name: string }>(`/brands/${id}`).then((b) => setBrandName(b.name)).catch(() => {})
  }, [id])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (modelFilter) params.set('model', modelFilter)
    if (mentionFilter === 'mentioned') params.set('mentioned', 'true')
    if (mentionFilter === 'not-mentioned') params.set('mentioned', 'false')
    apiFetch<ResultsResponse>(`/brands/${id}/results?${params}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, modelFilter, mentionFilter, page])

  const totalPages = data ? Math.ceil(data.total / 50) : 0
  const mentionedCount = data?.results.filter((r) => r.mentioned).length ?? 0

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Scan Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.total} total queries` : 'Raw LLM query results'}
            {data && data.results.length > 0 && (
              <span className="ml-2 text-gray-400">· Click any row to see full response</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={mentionFilter}
            onChange={(e) => { setMentionFilter(e.target.value as any); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">All Results</option>
            <option value="mentioned">Mentioned only</option>
            <option value="not-mentioned">Not mentioned</option>
          </select>
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
      </div>

      <BrandNav id={id} />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-4">{error}</div>}

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
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Total Queries</p>
              <p className="text-2xl font-bold mt-1">{data.total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Mentioned (this page)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{mentionedCount}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">Not Mentioned (this page)</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">{data.results.length - mentionedCount}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Prompt</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Model</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-500">Mentioned</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Sentiment</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Context</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.results.map((r) => (
                  <tr
                    key={r._id}
                    onClick={() => setSelected(r)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-gray-700 line-clamp-2 text-xs group-hover:text-gray-900">
                        {r.promptId?.text || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${MODEL_COLORS[r.model] || 'bg-gray-100 text-gray-600'}`}>
                        {MODEL_LABELS[r.model] || r.model}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {r.mentioned
                        ? <span className="text-green-600 font-bold text-base">✓</span>
                        : <span className="text-gray-300 text-base">✗</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      {r.mentioned ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SENTIMENT_STYLES[r.sentiment]}`}>
                          {r.sentiment}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="text-gray-400 text-xs line-clamp-1">{r.mentionContext || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.queriedAt).toLocaleDateString()}
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

      {selected && (
        <ResultPanel
          result={selected}
          brandName={brandName}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
