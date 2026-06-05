'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Semantic', path: '/semantic' },
  { label: 'Distribution', path: '/distribution' },
  { label: 'Prompts', path: '/prompts' },
  { label: 'Results', path: '/results' },
  { label: 'Articles', path: '/articles' },
  { label: 'Tools', path: '/tools' },
]

export default function BrandNav({ id }: { id: string }) {
  const pathname = usePathname()
  const base = `/brands/${id}`

  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {TABS.map((tab) => {
        const href = `${base}${tab.path}`
        const active = tab.path === ''
          ? pathname === base
          : pathname.startsWith(href)

        return (
          <Link
            key={tab.label}
            href={href}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
