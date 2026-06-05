'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'

const NAV = [
  { label: 'Brands', href: '/brands' },
  { label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()

  // Hide sidebar on public pages
  if (!isSignedIn) return null

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-gray-950 text-gray-300 flex flex-col border-r border-gray-800">
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-white font-bold text-lg tracking-tight">GEO Platform</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-900 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800 flex items-center gap-3">
        <UserButton />
        <span className="text-xs text-gray-500">Account</span>
      </div>
    </aside>
  )
}
