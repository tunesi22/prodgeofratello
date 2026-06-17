'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface CurrentUser {
  _id: string
  email: string
  plan: string
  isAdmin: boolean
}

const NAV = [
  { label: 'Brands', href: '/brands' },
  { label: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/user/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => {})
  }, [pathname])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/sign-in')
  }

  if (!user) return null

  const initial = user.email?.[0]?.toUpperCase() || '?'

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

        {user.isAdmin && (
          <Link
            href="/admin/users"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-4 ${
              pathname.startsWith('/admin')
                ? 'bg-amber-900/40 text-amber-300 border border-amber-700/30'
                : 'text-amber-600 hover:bg-amber-900/20 hover:text-amber-400'
            }`}
          >
            <span className="text-xs">⚙</span>
            Admin
          </Link>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800 relative" ref={dropRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 w-full hover:bg-gray-900 rounded-lg p-2 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {initial}
          </div>
          <div className="min-w-0 text-left">
            <div className="text-xs text-gray-300 truncate">{user.email}</div>
            <div className="text-[11px] text-gray-600 capitalize">{user.plan}</div>
          </div>
        </button>

        {open && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
