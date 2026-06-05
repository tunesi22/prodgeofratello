'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

interface Brand {
  _id: string
  name: string
  website: string
  industry: string
  competitors: string[]
  createdAt: string
}

export default function BrandsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage brands you want to track across LLMs</p>
        </div>
        <Link
          href="/brands/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + Add Brand
        </Link>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && brands.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-lg font-medium">No brands yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first brand to start tracking</p>
          <Link
            href="/brands/new"
            className="inline-block mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
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
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {brand.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-black">{brand.name}</p>
                <p className="text-sm text-gray-500">{brand.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              {brand.competitors.length > 0 && (
                <span>{brand.competitors.length} competitor{brand.competitors.length > 1 ? 's' : ''}</span>
              )}
              <span className="text-gray-300">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
