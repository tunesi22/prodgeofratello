'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
}

interface MentionRateResponse {
  overall: { totalQueries: number; mentionCount: number; mentionRate: number }
  byModel: { model: string; totalQueries: number; mentionCount: number; mentionRate: number }[]
}

const MODEL_LABELS: Record<string, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  anthropic: 'Claude',
}

function RateBadge({ rate }: { rate: number }) {
  const color = rate >= 60 ? 'text-green-600 bg-green-50' : rate >= 30 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-semibold ${color}`}>{rate}%</span>
}

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [mentionRate, setMentionRate] = useState<MentionRateResponse | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiFetch<Brand>(`/brands/${id}`),
      apiFetch<MentionRateResponse>(`/brands/${id}/mention-rate`).catch(() => null),
    ]).then(([b, mr]) => {
      setBrand(b)
      setMentionRate(mr)
    }).catch((e) => setError(e.message))
  }, [id])

  async function handleScan() {
    setScanning(true)
    setScanMsg('')
    try {
      const res = await apiFetch<{ message: string; jobsEnqueued: number }>(`/brands/${id}/scan`, { method: 'POST' })
      setScanMsg(`Scan started — ${res.jobsEnqueued} jobs enqueued`)
    } catch (e: any) {
      setScanMsg(`Error: ${e.message}`)
    } finally {
      setScanning(false)
    }
  }

  if (error) return <div className="p-8 text-red-500 text-sm">{error}</div>
  if (!brand) return (
    <div className="p-8 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  )

  const hasData = mentionRate && mentionRate.overall.totalQueries > 0

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
            {brand.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{brand.name}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm text-gray-500">{brand.industry}</span>
              <span className="text-gray-300">·</span>
              <a href={brand.website} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
                {brand.website}
              </a>
            </div>
          </div>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {scanning ? 'Starting scan...' : 'Run Scan'}
        </button>
      </div>

      {scanMsg && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-3.5 text-sm">
          {scanMsg}
        </div>
      )}

      <BrandNav id={id} />

      {/* Stats */}
      {hasData ? (
        <div className="space-y-6">
          {/* Overall stat */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500">Overall Mention Rate</p>
              <p className="text-3xl font-bold mt-1">{mentionRate.overall.mentionRate}%</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500">Total Queries</p>
              <p className="text-3xl font-bold mt-1">{mentionRate.overall.totalQueries}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500">Total Mentions</p>
              <p className="text-3xl font-bold mt-1">{mentionRate.overall.mentionCount}</p>
            </div>
          </div>

          {/* Per model */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-700">Mention Rate by Model</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Model</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Queries</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Mentions</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mentionRate.byModel.map((r) => (
                  <tr key={r.model}>
                    <td className="px-5 py-3.5 font-medium">{MODEL_LABELS[r.model] || r.model}</td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{r.totalQueries}</td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{r.mentionCount}</td>
                    <td className="px-5 py-3.5 text-right"><RateBadge rate={r.mentionRate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 font-medium">No scan data yet</p>
          <p className="text-gray-400 text-sm mt-1">Generate prompts first, then run a scan</p>
          <div className="flex gap-3 justify-center mt-5">
            <Link href={`/brands/${id}/prompts`} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              Generate Prompts
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
