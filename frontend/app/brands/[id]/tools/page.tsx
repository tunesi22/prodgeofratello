'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface GEOCheck { label: string; passed: boolean; impact: 'high' | 'medium' | 'low'; recommendation: string }
interface GEOResult { score: number; checks: GEOCheck[] }
interface BacklinkTarget { platform: string; type: string; relevance: string; url: string }

const IMPACT_COLORS = { high: 'text-red-600 bg-red-50', medium: 'text-yellow-600 bg-yellow-50', low: 'text-gray-600 bg-gray-100' }
const TYPE_COLORS: Record<string, string> = {
  reddit: 'bg-orange-50 text-orange-700',
  medium: 'bg-green-50 text-green-700',
  forum: 'bg-blue-50 text-blue-700',
  directory: 'bg-purple-50 text-purple-700',
  blog: 'bg-pink-50 text-pink-700',
  community: 'bg-teal-50 text-teal-700',
}

type ActiveTool = 'llms-txt' | 'nginx' | 'geo-score' | 'backlinks'

export default function ToolsPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [active, setActive] = useState<ActiveTool>('llms-txt')

  // llms.txt
  const [keyFacts, setKeyFacts] = useState('')
  const [llmsTxtContent, setLLMsTxtContent] = useState('')
  const [llmsLoading, setLLMsLoading] = useState(false)

  // nginx
  const [domain, setDomain] = useState('')
  const [pages, setPages] = useState('')
  const [nginxContent, setNginxContent] = useState('')
  const [nginxLoading, setNginxLoading] = useState(false)

  // geo score
  const [auditUrl, setAuditUrl] = useState('')
  const [geoResult, setGeoResult] = useState<GEOResult | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  // backlinks
  const [backlinks, setBacklinks] = useState<BacklinkTarget[]>([])
  const [backlinksLoading, setBacklinksLoading] = useState(false)
  const [backlinksLoaded, setBacklinksLoaded] = useState(false)

  async function handleLLMsTxt() {
    setLLMsLoading(true)
    try {
      const facts = keyFacts.split('\n').map((f) => f.trim()).filter(Boolean)
      const { content } = await apiFetch<{ content: string }>(`/brands/${id}/articles/tools/llms-txt`, {
        method: 'POST',
        body: JSON.stringify({ keyFacts: facts }),
      })
      setLLMsTxtContent(content)
    } catch (e: any) { alert(e.message) }
    finally { setLLMsLoading(false) }
  }

  async function handleNginx() {
    setNginxLoading(true)
    try {
      const pageList = pages.split('\n').map((p) => p.trim()).filter(Boolean)
      const { content } = await apiFetch<{ content: string }>(`/brands/${id}/articles/tools/nginx-config`, {
        method: 'POST',
        body: JSON.stringify({ domain, pages: pageList }),
      })
      setNginxContent(content)
    } catch (e: any) { alert(e.message) }
    finally { setNginxLoading(false) }
  }

  async function handleGEOScore() {
    setGeoLoading(true)
    setGeoResult(null)
    try {
      const result = await apiFetch<GEOResult>(`/brands/${id}/articles/tools/geo-score`, {
        method: 'POST',
        body: JSON.stringify({ url: auditUrl }),
      })
      setGeoResult(result)
    } catch (e: any) { alert(e.message) }
    finally { setGeoLoading(false) }
  }

  async function handleBacklinks() {
    setBacklinksLoading(true)
    try {
      const { targets } = await apiFetch<{ targets: BacklinkTarget[] }>(`/brands/${id}/articles/tools/backlinks`)
      setBacklinks(targets)
      setBacklinksLoaded(true)
    } catch (e: any) { alert(e.message) }
    finally { setBacklinksLoading(false) }
  }

  const TOOLS: { key: ActiveTool; label: string }[] = [
    { key: 'llms-txt', label: 'llms.txt Generator' },
    { key: 'nginx', label: 'Nginx Bot Config' },
    { key: 'geo-score', label: 'GEO Score Audit' },
    { key: 'backlinks', label: 'Backlink Targets' },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Technical Tools</h1>
        <p className="text-sm text-gray-500 mt-1">GEO optimization utilities for your brand</p>
      </div>

      <BrandNav id={id} />

      {/* Tool selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active === t.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* llms.txt */}
      {active === 'llms-txt' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-1">Generate llms.txt</h2>
            <p className="text-sm text-gray-500 mb-4">Create a /llms.txt file for your domain root. AI crawlers use this to understand your brand.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Key Facts (one per line, optional)</label>
            <textarea
              value={keyFacts}
              onChange={(e) => setKeyFacts(e.target.value)}
              rows={5}
              placeholder={"Founded in 2020\nAvailable in Indonesia, Malaysia, Singapore\nOver 50,000 active users\nBooking for sports venues"}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
            />
            <button onClick={handleLLMsTxt} disabled={llmsLoading} className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {llmsLoading ? 'Generating...' : 'Generate llms.txt'}
            </button>
          </div>
          {llmsTxtContent && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Output — copy to /llms.txt on your domain</h3>
                <button onClick={() => navigator.clipboard.writeText(llmsTxtContent)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-colors">
                  Copy
                </button>
              </div>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-auto max-h-80">{llmsTxtContent}</pre>
            </div>
          )}
        </div>
      )}

      {/* Nginx config */}
      {active === 'nginx' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-1">Nginx Bot Routing Config</h2>
            <p className="text-sm text-gray-500 mb-4">Generate an Nginx config snippet that detects and optimizes for AI bots (GPTBot, ClaudeBot, PerplexityBot).</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain</label>
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourdomain.com"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Key Pages (one per line, optional)</label>
                <textarea value={pages} onChange={(e) => setPages(e.target.value)} rows={4}
                  placeholder={"/\n/about\n/features\n/pricing"}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono" />
              </div>
            </div>
            <button onClick={handleNginx} disabled={nginxLoading || !domain} className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {nginxLoading ? 'Generating...' : 'Generate Config'}
            </button>
          </div>
          {nginxContent && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Output — paste inside your server {} block</h3>
                <button onClick={() => navigator.clipboard.writeText(nginxContent)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-colors">Copy</button>
              </div>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">{nginxContent}</pre>
            </div>
          )}
        </div>
      )}

      {/* GEO score */}
      {active === 'geo-score' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-1">GEO Score Audit</h2>
            <p className="text-sm text-gray-500 mb-4">Audit any URL for GEO optimization readiness. Score 0–100 with actionable recommendations.</p>
            <div className="flex gap-3">
              <input type="url" value={auditUrl} onChange={(e) => setAuditUrl(e.target.value)} placeholder="https://yourdomain.com"
                className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              <button onClick={handleGEOScore} disabled={geoLoading || !auditUrl} className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {geoLoading ? 'Auditing...' : 'Audit'}
              </button>
            </div>
          </div>
          {geoResult && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className={`text-4xl font-bold ${geoResult.score >= 70 ? 'text-green-600' : geoResult.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {geoResult.score}
                </div>
                <div>
                  <p className="font-semibold">GEO Score</p>
                  <p className="text-sm text-gray-500">{geoResult.score >= 70 ? 'Good — well optimized' : geoResult.score >= 40 ? 'Fair — room for improvement' : 'Poor — needs attention'}</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {geoResult.checks.map((check) => (
                  <div key={check.label} className="px-5 py-4 flex items-start gap-4">
                    <span className="text-lg mt-0.5">{check.passed ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{check.label}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IMPACT_COLORS[check.impact]}`}>{check.impact}</span>
                      </div>
                      {!check.passed && <p className="text-sm text-gray-500">{check.recommendation}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backlinks */}
      {active === 'backlinks' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold mb-1">Backlink Target Finder</h2>
            <p className="text-sm text-gray-500 mb-4">Find the best platforms to publish content for your industry to increase AI visibility.</p>
            {!backlinksLoaded && (
              <button onClick={handleBacklinks} disabled={backlinksLoading} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {backlinksLoading ? 'Finding targets...' : 'Find Targets'}
              </button>
            )}
          </div>
          {backlinks.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">Platform</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">Why Relevant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backlinks.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5">
                        <a href={b.url} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">{b.platform}</a>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[b.type] || 'bg-gray-100 text-gray-600'}`}>{b.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{b.relevance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
