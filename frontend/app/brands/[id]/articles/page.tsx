'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface Prompt {
  _id: string
  text: string
  category: string
  mentionRate?: number
}

interface Article {
  _id: string
  title: string
  content: string
  status: string
  generatedAt: string
  promptId: { _id: string; text: string; category: string } | null
}

const CATEGORY_STYLES: Record<string, string> = {
  discovery: 'bg-blue-50 text-blue-700',
  comparison: 'bg-purple-50 text-purple-700',
  recommendation: 'bg-green-50 text-green-700',
  'use-case': 'bg-amber-50 text-amber-700',
  'best-of': 'bg-orange-50 text-orange-700',
  organic: 'bg-teal-50 text-teal-700',
}

export default function ArticlesPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [articles, setArticles] = useState<Article[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [gapIds, setGapIds] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<Article | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGapsOnly, setShowGapsOnly] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<{ articles: Article[] }>(`/brands/${id}/articles`),
      apiFetch<{ prompts: Prompt[] }>(`/brands/${id}/prompts`),
      apiFetch<{ gaps: Prompt[] }>(`/brands/${id}/analytics/gaps`).catch(() => ({ gaps: [] })),
    ]).then(([a, p, g]) => {
      setArticles(a.articles)
      setPrompts(p.prompts)
      setGapIds(new Set(g.gaps.map((gap) => gap._id)))
    }).finally(() => setLoading(false))
  }, [id])

  async function handleGenerate(promptId: string) {
    setGenerating(promptId)
    try {
      const article = await apiFetch<Article>(`/brands/${id}/articles/generate`, {
        method: 'POST',
        body: JSON.stringify({ promptId }),
      })
      setArticles((prev) => [article, ...prev])
      setPreview(article)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setGenerating(null)
    }
  }

  function handleExport(articleId: string, format: 'md' | 'html') {
    window.open(`/api/brands/${id}/articles/${articleId}/export?format=${format}`, '_blank')
  }

  if (loading) return (
    <div className="p-8 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  )

  const displayPrompts = showGapsOnly
    ? prompts.filter((p) => gapIds.has(p._id))
    : prompts

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-sm text-gray-500 mt-1">AI-generated GEO content from your prompts</p>
        </div>
      </div>

      <BrandNav id={id} />

      <div className="grid grid-cols-2 gap-6">
        {/* Left: prompts to generate from */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Prompts ({displayPrompts.length})
            </h2>
            {gapIds.size > 0 && (
              <button
                onClick={() => setShowGapsOnly(!showGapsOnly)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  showGapsOnly
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {showGapsOnly ? `Gaps only (${gapIds.size})` : `Show gaps only`}
              </button>
            )}
          </div>

          {prompts.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
              <p className="font-medium">No prompts yet</p>
              <p className="mt-1">Go to Prompts tab to generate or import prompts first</p>
            </div>
          ) : displayPrompts.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
              No gap prompts found. Run a scan first or show all prompts.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {displayPrompts.map((prompt) => {
                const isGap = gapIds.has(prompt._id)
                return (
                  <div key={prompt._id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-3">
                      {isGap && (
                        <span className="shrink-0 mt-0.5 text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                          gap
                        </span>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">{prompt.text}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_STYLES[prompt.category] || 'bg-gray-100 text-gray-500'}`}>
                        {prompt.category}
                      </span>
                      <button
                        onClick={() => handleGenerate(prompt._id)}
                        disabled={generating === prompt._id}
                        className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        {generating === prompt._id ? 'Generating...' : 'Generate Article'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: generated articles */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Generated Articles ({articles.length})
          </h2>
          {articles.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
              No articles yet. Pick a prompt on the left and click Generate.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {articles.map((article) => (
                <div
                  key={article._id}
                  className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${preview?._id === article._id ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}
                  onClick={() => setPreview(article)}
                >
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">{article.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(article.generatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExport(article._id, 'md') }}
                        className="text-xs border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-900 transition-colors"
                      >
                        .md
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExport(article._id, 'html') }}
                        className="text-xs border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-900 transition-colors"
                      >
                        .html
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article preview */}
      {preview && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Preview</h2>
            <div className="flex gap-2">
              <button onClick={() => handleExport(preview._id, 'md')} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-colors">
                Download .md
              </button>
              <button onClick={() => handleExport(preview._id, 'html')} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-colors">
                Download .html
              </button>
              <button onClick={() => setPreview(null)} className="text-xs text-gray-400 hover:text-black px-2">✕</button>
            </div>
          </div>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
            {preview.content}
          </pre>
        </div>
      )}
    </div>
  )
}
