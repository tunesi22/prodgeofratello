'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import BrandNav from '@/components/BrandNav'
import { useApiFetch } from '@/lib/useApiFetch'

interface ConceptScore {
  concept: string
  count: number
  score: number
}

interface SemanticProximityData {
  brandId: string
  totalMentions: number
  concepts: ConceptScore[]
  gaps: ConceptScore[]
  computedAt: string
}

interface CooccurrenceData {
  brandId: string
  topConcepts: ConceptScore[]
  competitorComparison: { competitor: string; concepts: string[] }[]
}

export default function SemanticPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [proximity, setProximity] = useState<SemanticProximityData | null>(null)
  const [cooccurrence, setCooccurrence] = useState<CooccurrenceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze() {
    setLoading(true)
    setError('')
    try {
      const [prox, co] = await Promise.all([
        apiFetch<SemanticProximityData>(`/brands/${id}/analytics/semantic-proximity`),
        apiFetch<CooccurrenceData>(`/brands/${id}/analytics/cooccurrence`),
      ])
      setProximity(prox)
      setCooccurrence(co)
    } catch (err: any) {
      setError(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <BrandNav id={id} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Semantic Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Which concepts co-occur with your brand in LLM responses
          </p>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🧠</div>
          <p className="font-medium">Analyzing brand mentions...</p>
          <p className="text-sm mt-1">This may take 30–60 seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && proximity && (
        <>
          {proximity.totalMentions === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">No mentions found</p>
              <p className="text-sm mt-1">Run a scan first to collect brand mentions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Mentions Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{proximity.totalMentions}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Concepts Found</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{proximity.concepts.length}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Semantic Gaps</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">{proximity.gaps.length}</p>
                </div>
              </div>

              {/* Top Concepts */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Top Concepts Associated with Your Brand
                </h2>
                <div className="space-y-3">
                  {proximity.concepts.map((c) => (
                    <div key={c.concept} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-48 shrink-0 capitalize">{c.concept}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full"
                          style={{ width: `${Math.min(c.score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{c.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Gaps */}
              {proximity.gaps.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">Semantic Gaps</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Concepts your brand SHOULD be associated with but currently isn't
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proximity.gaps.map((g) => (
                      <span
                        key={g.concept}
                        className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs capitalize"
                      >
                        {g.concept}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Tip: Create content that naturally associates your brand with these concepts
                  </p>
                </div>
              )}

              {/* Competitor Comparison */}
              {cooccurrence && cooccurrence.competitorComparison.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">
                    Competitor Concept Comparison
                  </h2>
                  <div className="space-y-4">
                    {cooccurrence.competitorComparison.map((comp) => (
                      <div key={comp.competitor}>
                        <p className="text-xs font-medium text-gray-700 mb-2 capitalize">
                          {comp.competitor}
                        </p>
                        {comp.concepts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {comp.concepts.map((c) => (
                              <span
                                key={c}
                                className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs capitalize"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">No competitor mentions found in scan data</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!loading && !proximity && !error && (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">Click "Run Analysis" to start</p>
          <p className="text-sm mt-1">Requires completed scan data</p>
        </div>
      )}
    </div>
  )
}
