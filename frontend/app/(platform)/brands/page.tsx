'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApiFetch } from '@/lib/useApiFetch'

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
  createdAt: string
}

export default function BrandsPage() {
  const apiFetch = useApiFetch()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<Brand[]>('/brands')
      .then(setBrands)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] text-gray-600 font-semibold tracking-[0.15em] uppercase mb-1">Dashboard</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Track your brand visibility across AI models</p>
        </div>
        <Link
          href="/brands/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <span className="text-base leading-none font-light">+</span>
          Add Brand
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
          <p className="text-gray-500 text-lg font-medium">No brands yet</p>
          <p className="text-gray-600 text-sm mt-1">Add your first brand to start tracking</p>
          <Link
            href="/brands/new"
            className="inline-flex items-center gap-1.5 mt-5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Brand
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {brands.map((brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand._id}`}
            className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 hover:bg-gray-800/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-700/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                {brand.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-white">{brand.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{brand.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              {brand.competitors.length > 0 && (
                <span>{brand.competitors.length} competitor{brand.competitors.length > 1 ? 's' : ''}</span>
              )}
              <span className="text-gray-600 group-hover:text-gray-400 transition-colors">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
