'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'
import { useApiFetch } from '@/lib/useApiFetch'
import BrandNav from '@/components/BrandNav'

interface Analytics {
  overall: { totalQueries: number; mentionCount: number; mentionRate: number }
  byModel: { model: string; totalQueries: number; mentionCount: number; mentionRate: number }[]
  bestModel: string | null
  worstModel: string | null
  sentiment: Record<string, { positive: number; neutral: number; negative: number }>
  trends: { label: string; mentionRate: number; total: number; mentioned: number }[]
  gaps: { promptId: string; text: string; category: string; mentionRate: number; total: number }[]
  shareOfVoice: { brandId: string; name: string; mentionCount: number; mentionRate: number; shareOfVoice: number }[]
}

const MODEL_LABELS: Record<string, string> = {
  openai: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  anthropic: 'Claude',
}

const PIE_COLORS = ['#111827', '#6b7280', '#d1d5db', '#f3f4f6']
const SENTIMENT_COLORS = { positive: '#16a34a', neutral: '#9ca3af', negative: '#dc2626' }

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<Analytics>(`/brands/${id}/analytics`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="p-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  )

  if (error) return <div className="p-8 text-red-500 text-sm">{error}</div>

  if (!data || data.overall.totalQueries === 0) return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <BrandNav id={id} />
      <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-400 font-medium">No data yet</p>
        <p className="text-gray-400 text-sm mt-1">Run a scan first to see analytics</p>
      </div>
    </div>
  )

  const mentionRateData = data.byModel.map((r) => ({
    name: MODEL_LABELS[r.model] || r.model,
    'Mention Rate': r.mentionRate,
  }))

  const sentimentData = Object.entries(data.sentiment).map(([model, s]) => ({
    name: MODEL_LABELS[model] || model,
    Positive: s.positive,
    Neutral: s.neutral,
    Negative: s.negative,
  }))

  const sovData = data.shareOfVoice.map((s) => ({
    name: s.name,
    value: s.shareOfVoice,
  }))

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <BrandNav id={id} />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Overall Mention Rate" value={`${data.overall.mentionRate}%`} />
        <StatCard label="Total Queries" value={data.overall.totalQueries} />
        <StatCard
          label="Best Model"
          value={MODEL_LABELS[data.bestModel || ''] || data.bestModel || '—'}
          sub={data.byModel.find(m => m.model === data.bestModel)?.mentionRate + '%'}
        />
        <StatCard
          label="Worst Model"
          value={MODEL_LABELS[data.worstModel || ''] || data.worstModel || '—'}
          sub={data.byModel.find(m => m.model === data.worstModel)?.mentionRate + '%'}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Mention rate per model */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mention Rate by Model</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mentionRateData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="Mention Rate" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Share of voice */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Share of Voice</h2>
          {sovData.length > 1 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={sovData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${value}%`}>
                    {sovData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {sovData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-600">{s.name}</span>
                    <span className="font-semibold">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
              Add more brands to compare share of voice
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Trend over time */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mention Rate Over Time</h2>
          {data.trends.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Area type="monotone" dataKey="mentionRate" stroke="#111827" fill="#f3f4f6" strokeWidth={2} name="Mention Rate" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">
              Need data from multiple weeks to show trend
            </div>
          )}
        </div>

        {/* Sentiment breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Sentiment Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sentimentData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Positive" stackId="a" fill={SENTIMENT_COLORS.positive} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
              <Bar dataKey="Negative" stackId="a" fill={SENTIMENT_COLORS.negative} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prompt gaps table */}
      {data.gaps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-gray-700">Prompt Gaps</h2>
              <p className="text-xs text-gray-400 mt-0.5">Prompts with mention rate &lt; 20% — candidates for GEO content</p>
            </div>
            <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full font-medium">
              {data.gaps.length} gaps
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Prompt</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Queries</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.gaps.slice(0, 10).map((gap) => (
                <tr key={gap.promptId} className="hover:bg-gray-50">
                  <td className="px-5 py-3 max-w-sm">
                    <p className="text-gray-700 line-clamp-2 text-xs">{gap.text}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{gap.category}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{gap.total}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {gap.mentionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
