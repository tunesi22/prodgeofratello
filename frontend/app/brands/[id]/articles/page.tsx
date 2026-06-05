'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface Prompt { _id: string; text: string; category: string; mentionRate?: number }
interface Article {
  _id: string
  title: string
  content: string
  status: string
  generatedAt: string
  promptId: { _id: string; text: string; category: string } | null
}

export default function ArticlesPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [articles, setArticles] = useState<Article[]>([])
  const [gaps, setGaps] = useState<Prompt[]>([])
  const [preview, setPreview] = useState<Article | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<{ articles: Article[] }>(`/brands/${id}/articles`),
      apiFetch<{ gaps: Prompt[] }>(`/brands/${id}/analytics/gaps`).catch(() => ({ gaps: [] })),
    ]).then(([a, g]) => {
      setArticles(a.articles)
      setGaps(g.gaps)
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

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-sm text-gray-500 mt-1">AI-generated GEO content from your prompt gaps</p>
        </div>
      </div>

      <BrandNav id={id} />

      <div className="grid grid-cols-2 gap-6">
        {/* Left: gap prompts to generate from */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Prompt Gaps ({gaps.length})
          </h2>
          {gaps.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
              No gaps found. Run a scan first.
            </div>
          ) : (
            <div className="space-y-2">
              {gaps.map((gap) => (
                <div key={gap._id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{gap.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{gap.category}</span>
                    <button
                      onClick={() => handleGenerate(gap._id)}
                      disabled={generating === gap._id}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {generating === gap._id ? 'Generating...' : 'Generate Article'}
                    </button>
                  </div>
                </div>
              ))}
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
              No articles yet. Generate from a gap prompt.
            </div>
          ) : (
            <div className="space-y-2">
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
