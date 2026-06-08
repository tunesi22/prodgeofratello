'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiFetch } from '@/lib/useApiFetch'

export default function NewBrandPage() {
  const router = useRouter()
  const apiFetch = useApiFetch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', website: '', industry: '', competitors: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const brand = await apiFetch<{ _id: string }>('/brands', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          website: form.website,
          industry: form.industry,
          competitors: form.competitors
            ? form.competitors.split(',').map((c) => c.trim()).filter(Boolean)
            : [],
        }),
      })
      router.push(`/brands/${brand._id}`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/brands" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4 tracking-tight">Add Brand</h1>
        <p className="text-gray-500 text-sm mt-1">We'll generate tracking prompts automatically after you add the brand.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Brand Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. ArenaGo"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Website</label>
          <input
            type="url"
            required
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Industry</label>
          <input
            type="text"
            required
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            placeholder="e.g. Sports booking app in Indonesia"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
          />
          <p className="text-xs text-gray-600 mt-1.5">Be specific — this is used to generate relevant prompts</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Competitors <span className="font-normal text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={form.competitors}
            onChange={(e) => setForm({ ...form, competitors: e.target.value })}
            placeholder="SportyBet, PlayToday, ... (comma separated)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Creating…' : 'Create Brand'}
          </button>
          <Link
            href="/brands"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
