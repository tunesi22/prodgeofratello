'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import BrandNav from '@/components/BrandNav'
import { useApiFetch } from '@/lib/useApiFetch'

type PlatformType = 'reddit' | 'medium' | 'forum' | 'blog' | 'directory' | 'other'

interface Publication {
  _id: string
  title: string
  platform: string
  platformType: PlatformType
  url: string
  publishedAt: string
  mentionRateAtPublish?: number
  rateBefore: number | null
  rateAfter: number | null
  delta: number | null
}

const PLATFORM_TYPES: PlatformType[] = ['reddit', 'medium', 'forum', 'blog', 'directory', 'other']

const PLATFORM_COLORS: Record<PlatformType, string> = {
  reddit: 'bg-orange-100 text-orange-700',
  medium: 'bg-green-100 text-green-700',
  forum: 'bg-purple-100 text-purple-700',
  blog: 'bg-blue-100 text-blue-700',
  directory: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function DistributionPage() {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    platform: '',
    platformType: 'other' as PlatformType,
    url: '',
    publishedAt: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    loadPublications()
  }, [id])

  async function loadPublications() {
    setLoading(true)
    try {
      const data = await apiFetch<Publication[]>(`/brands/${id}/publications/impact`)
      setPublications(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiFetch(`/brands/${id}/publications`, {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({ title: '', platform: '', platformType: 'other', url: '', publishedAt: new Date().toISOString().slice(0, 10) })
      setShowForm(false)
      await loadPublications()
    } catch (err: any) {
      alert(err.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(pubId: string) {
    if (!confirm('Delete this publication?')) return
    await apiFetch(`/brands/${id}/publications/${pubId}`, { method: 'DELETE' })
    setPublications((prev) => prev.filter((p) => p._id !== pubId))
  }

  const avgDelta =
    publications.filter((p) => p.delta !== null).length > 0
      ? Math.round(
          publications.filter((p) => p.delta !== null).reduce((s, p) => s + (p.delta ?? 0), 0) /
            publications.filter((p) => p.delta !== null).length
        )
      : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <BrandNav id={id} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Content Distribution</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track where you publish content and measure impact on mention rate
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700"
        >
          + Add Publication
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-gray-900">New Publication</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Article Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Best Padel Courts in Jakarta"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Platform Name</label>
              <input
                required
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                placeholder="e.g. r/indonesia, Medium, Kompasiana"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Platform Type</label>
              <select
                value={form.platformType}
                onChange={(e) => setForm({ ...form, platformType: e.target.value as PlatformType })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {PLATFORM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Published Date</label>
              <input
                required
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">URL</label>
              <input
                required
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Publication'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 text-sm hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Summary stats */}
      {publications.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Publications</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{publications.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">With Impact Data</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {publications.filter((p) => p.delta !== null).length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Mention Rate Change</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                avgDelta === null ? 'text-gray-400' : avgDelta >= 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {avgDelta === null ? '—' : `${avgDelta > 0 ? '+' : ''}${avgDelta}%`}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : publications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No publications yet</p>
          <p className="text-sm mt-1">
            Track where you publish content to measure impact on your mention rate
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Platform</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Published</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Before</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">After</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Impact</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {publications.map((pub) => (
                <tr key={pub._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:underline font-medium"
                    >
                      {pub.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${PLATFORM_COLORS[pub.platformType]}`}
                    >
                      {pub.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(pub.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {pub.rateBefore !== null ? `${pub.rateBefore}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {pub.rateAfter !== null ? `${pub.rateAfter}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {pub.delta === null ? (
                      <span className="text-gray-400 text-xs">No data</span>
                    ) : (
                      <span
                        className={`font-semibold ${
                          pub.delta > 0 ? 'text-green-600' : pub.delta < 0 ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        {pub.delta > 0 ? '+' : ''}
                        {pub.delta}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(pub._id)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Impact = mention rate change in 7 days before vs 7 days after publication date
      </p>
    </div>
  )
}
