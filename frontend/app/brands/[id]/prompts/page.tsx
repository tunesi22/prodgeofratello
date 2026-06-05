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

interface RealQuery {
  text: string
  source: 'google' | 'reddit'
  category: string
  sourceUrl: string
}

const CATEGORY_STYLES: Record<string, string> = {
  discovery: 'bg-blue-50 text-blue-700 border-blue-100',
  comparison: 'bg-purple-50 text-purple-700 border-purple-100',
  recommendation: 'bg-green-50 text-green-700 border-green-100',
  'use-case': 'bg-amber-50 text-amber-700 border-amber-100',
  'best-of': 'bg-orange-50 text-orange-700 border-orange-100',
  organic: 'bg-teal-50 text-teal-700 border-teal-100',
}

const SOURCE_STYLES: Record<string, string> = {
  google: 'bg-blue-50 text-blue-600 border-blue-100',
  reddit: 'bg-orange-50 text-orange-600 border-orange-100',
}

const SOURCE_ICONS: Record<string, string> = {
  google: 'G',
  reddit: 'R',
}

type Tab = 'prompts' | 'discover'

export default function PromptsPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()

  const [tab, setTab] = useState<Tab>('prompts')

  // Prompts tab state
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Discover tab state
  const [discovered, setDiscovered] = useState<RealQuery[]>([])
  const [discovering, setDiscovering] = useState(false)
  const [discoverError, setDiscoverError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [filterSource, setFilterSource] = useState<'all' | 'google' | 'reddit'>('all')
  const [filterCategory, setFilterCategory] = useState('all')

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

  async function handleDiscover() {
    setDiscovering(true)
    setDiscoverError('')
    setSelected(new Set())
    setImportDone(false)
    try {
      const data = await apiFetch<{ queries: RealQuery[]; total: number }>(`/brands/${id}/prompts/discover`)
      setDiscovered(data.queries)
    } catch (e: any) {
      setDiscoverError(e.message)
    } finally {
      setDiscovering(false)
    }
  }

  async function handleImport() {
    const toImport = discovered.filter((_, i) => selected.has(i))
    if (!toImport.length) return
    setImporting(true)
    try {
      const result = await apiFetch<{ added: number; total: number }>(`/brands/${id}/prompts/import`, {
        method: 'POST',
        body: JSON.stringify({ queries: toImport }),
      })
      setImportDone(true)
      setSelected(new Set())
      // Refresh prompts tab count
      fetchPrompts()
    } catch (e: any) {
      setDiscoverError(e.message)
    } finally {
      setImporting(false)
    }
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(filteredDiscovered.map((_, i) => discoveredIndexMap[i])))
  }

  function clearAll() {
    setSelected(new Set())
  }

  const grouped = prompts.reduce<Record<string, Prompt[]>>((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  const filteredDiscovered = discovered.filter((q) => {
    if (filterSource !== 'all' && q.source !== filterSource) return false
    if (filterCategory !== 'all' && q.category !== filterCategory) return false
    return true
  })

  // Map filtered index → original index (for selection tracking)
  const discoveredIndexMap: number[] = []
  discovered.forEach((q, i) => {
    const passes =
      (filterSource === 'all' || q.source === filterSource) &&
      (filterCategory === 'all' || q.category === filterCategory)
    if (passes) discoveredIndexMap.push(i)
  })

  const categoryOptions = ['all', ...Array.from(new Set(discovered.map((q) => q.category)))]
  const googleCount = discovered.filter((q) => q.source === 'google').length
  const redditCount = discovered.filter((q) => q.source === 'reddit').length

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {prompts.length > 0
              ? `${prompts.length} prompts across ${Object.keys(grouped).length} categories`
              : 'Generate AI prompts or import real queries from the internet'}
          </p>
        </div>

        {tab === 'prompts' && (
          <div className="flex gap-2">
            {prompts.length === 0 ? (
              <button
                onClick={() => handleGenerate(false)}
                disabled={generating}
                className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {generating ? 'Generating...' : 'Generate with AI'}
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
        )}

        {tab === 'discover' && discovered.length > 0 && selected.size > 0 && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {importing ? 'Adding...' : `Add ${selected.size} to Prompts`}
          </button>
        )}
      </div>

      <BrandNav id={id} />

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('prompts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'prompts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          AI Generated
          {prompts.length > 0 && (
            <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {prompts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('discover')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'discover' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Discover Real Queries
          {discovered.length > 0 && (
            <span className="ml-1.5 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
              {discovered.length}
            </span>
          )}
        </button>
      </div>

      {/* ── PROMPTS TAB ── */}
      {tab === 'prompts' && (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm mb-4">{error}</div>
          )}

          {(loading || generating) && (
            <div className="space-y-3">
              {generating && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-4 text-sm">
                  Generating prompts via Claude... this takes ~10 seconds
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
              <p className="text-gray-400 text-sm mt-1 mb-4">
                Generate with AI, or switch to "Discover Real Queries" to import from internet
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleGenerate(false)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                >
                  Generate with AI
                </button>
                <button
                  onClick={() => setTab('discover')}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-gray-900"
                >
                  Discover Real Queries
                </button>
              </div>
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
        </>
      )}

      {/* ── DISCOVER TAB ── */}
      {tab === 'discover' && (
        <div className="space-y-5">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Real queries from the internet</p>
            <p className="text-blue-600 text-xs">
              Pulls actual questions people type on Google + Reddit — not AI-generated.
              Select the ones relevant to your brand and add them to your prompt pool.
            </p>
          </div>

          {/* Discover button / status */}
          {!discovering && discovered.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-500 font-medium mb-1">Find what people are actually asking</p>
              <p className="text-gray-400 text-sm mb-5">
                Searches Google Autocomplete + Reddit for real queries in your industry
              </p>
              <button
                onClick={handleDiscover}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Discover Real Queries
              </button>
              {discoverError && (
                <p className="text-red-500 text-sm mt-3">{discoverError}</p>
              )}
            </div>
          )}

          {discovering && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-gray-600 mb-3">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="font-medium">Discovering real queries...</span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <p>① Crawling Google Autocomplete + Reddit</p>
                <p>② Claude filtering for relevance to your brand</p>
                <p className="text-xs mt-2">Takes ~15–20 seconds</p>
              </div>
            </div>
          )}

          {!discovering && discovered.length > 0 && (
            <>
              {/* Stats + filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium border bg-blue-50 text-blue-600 border-blue-100">
                    G {googleCount} Google
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium border bg-orange-50 text-orange-600 border-orange-100">
                    R {redditCount} Reddit
                  </span>
                </div>

                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as any)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="all">All Sources</option>
                  <option value="google">Google only</option>
                  <option value="reddit">Reddit only</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                  ))}
                </select>

                <div className="ml-auto flex items-center gap-3">
                  {selected.size > 0 && (
                    <span className="text-xs text-gray-500">{selected.size} selected</span>
                  )}
                  <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Select all</button>
                  <button onClick={clearAll} className="text-xs text-gray-400 hover:underline">Clear</button>
                  <button
                    onClick={handleDiscover}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {importDone && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3.5 text-sm">
                  Queries added to your prompt pool. Switch to "AI Generated" tab to see them.
                </div>
              )}

              {discoverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm">
                  {discoverError}
                </div>
              )}

              {/* Query cards */}
              <div className="grid grid-cols-1 gap-2">
                {filteredDiscovered.map((query, filteredIdx) => {
                  const originalIdx = discoveredIndexMap[filteredIdx]
                  const isSelected = selected.has(originalIdx)
                  return (
                    <div
                      key={originalIdx}
                      onClick={() => toggleSelect(originalIdx)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected ? 'bg-white border-white' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {query.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            isSelected
                              ? 'bg-white/10 text-white border-white/20'
                              : SOURCE_STYLES[query.source]
                          }`}>
                            {SOURCE_ICONS[query.source]} {query.source}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            isSelected
                              ? 'bg-white/10 text-white border-white/20'
                              : CATEGORY_STYLES[query.category] || 'bg-gray-50 text-gray-500 border-gray-100'
                          }`}>
                            {query.category}
                          </span>
                          {query.sourceUrl && (
                            <a
                              href={query.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`text-xs underline underline-offset-2 ${
                                isSelected ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              verify ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom sticky action bar */}
              {selected.size > 0 && (
                <div className="sticky bottom-6 bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xl">
                  <p className="text-sm font-medium">{selected.size} queries selected</p>
                  <div className="flex gap-3">
                    <button
                      onClick={clearAll}
                      className="text-sm text-gray-400 hover:text-white px-3 py-1.5"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="bg-white text-gray-900 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      {importing ? 'Adding...' : `Add ${selected.size} to Prompts`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
