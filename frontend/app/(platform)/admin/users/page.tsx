"use client"

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type Plan = 'starter' | 'pro' | 'agency'

interface AdminUser {
  _id: string
  clerkUserId: string
  email: string
  plan: Plan
  isAdmin: boolean
  lastActiveAt?: string
  createdAt: string
  brandCount: number
  queryCount: number
}

interface Stats {
  totalUsers: number
  activeToday: number
  proPlus: number
  totalBrands: number
}

function relativeTime(date?: string) {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const PLAN_BADGE: Record<Plan, string> = {
  starter: 'bg-gray-800 text-gray-300 border border-gray-700',
  pro: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  agency: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
}

const PLAN_AVATAR: Record<Plan, string> = {
  starter: 'bg-gray-700 text-gray-300',
  pro: 'bg-blue-800 text-blue-200',
  agency: 'bg-purple-800 text-purple-200',
}

function Avatar({ email, plan }: { email: string; plan: Plan }) {
  const initial = email ? email[0].toUpperCase() : '?'
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${PLAN_AVATAR[plan]}`}>
      {initial}
    </div>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { getToken } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeToday: 0, proPlus: 0, totalBrands: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<'all' | Plan>('all')

  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPlan, setNewPlan] = useState<Plan>('starter')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const authFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      const token = await getToken()
      return fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(options?.headers ?? {}),
        },
      })
    },
    [getToken]
  )

  const loadData = useCallback(async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        authFetch('/api/admin/users'),
        authFetch('/api/admin/stats'),
      ])
      if (usersRes.status === 403) {
        router.replace('/brands')
        return
      }
      if (usersRes.ok) setUsers(await usersRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch {}
    setLoading(false)
  }, [authFetch, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      setCreateError('Email dan password wajib diisi.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, password: newPassword, plan: newPlan }),
      })
      if (!res.ok) {
        const data = await res.json()
        setCreateError(data.error ?? 'Gagal membuat user.')
      } else {
        setShowCreate(false)
        setNewEmail('')
        setNewPassword('')
        setNewPlan('starter')
        loadData()
      }
    } catch {
      setCreateError('Terjadi kesalahan.')
    }
    setCreating(false)
  }

  const handleChangePlan = async (id: string, plan: Plan) => {
    await authFetch(`/api/admin/users/${id}/plan`, {
      method: 'PATCH',
      body: JSON.stringify({ plan }),
    })
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, plan } : u)))
  }

  const handleToggleAdmin = async (id: string) => {
    await authFetch(`/api/admin/users/${id}/toggle-admin`, { method: 'PATCH' })
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isAdmin: !u.isAdmin } : u)))
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-gray-700 border-t-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] text-gray-600 font-semibold tracking-[0.15em] uppercase mb-1">Admin Panel</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
            <p className="text-gray-500 text-sm mt-1">Manage accounts and track activity</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            <span className="text-base leading-none font-light">+</span>
            Create User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, accent: 'text-white' },
            { label: 'Active Today', value: stats.activeToday, accent: 'text-emerald-400' },
            { label: 'Pro+ Plans', value: stats.proPlus, accent: 'text-blue-400' },
            { label: 'Total Brands', value: stats.totalBrands, accent: 'text-purple-400' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className={`text-3xl font-bold ${accent} tabular-nums mb-1.5`}>{value}</div>
              <div className="text-gray-500 text-xs font-medium tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors w-64"
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-400 focus:outline-none focus:border-gray-600 transition-colors"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="agency">Agency</option>
          </select>
          <span className="text-gray-600 text-xs ml-auto tabular-nums">{filtered.length} users</span>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Plan', 'Brands', 'Queries', 'Last Active', 'Joined', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] text-gray-500 font-semibold tracking-widest uppercase px-5 py-3.5 first:pl-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-600 text-sm py-14">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-800/40 transition-colors ${
                      i < filtered.length - 1 ? 'border-b border-gray-800/60' : ''
                    }`}
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar email={user.email} plan={user.plan} />
                        <div className="min-w-0">
                          <div className="text-sm text-white font-medium flex items-center gap-2 flex-wrap">
                            <span className="truncate">{user.email || '—'}</span>
                            {user.isAdmin && (
                              <span className="text-[10px] bg-amber-900/60 text-amber-400 border border-amber-700/40 px-1.5 py-0.5 rounded font-semibold tracking-wider shrink-0">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-600 font-mono mt-0.5 truncate">
                            {user.clerkUserId.slice(0, 18)}…
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <select
                        value={user.plan}
                        onChange={(e) => handleChangePlan(user._id, e.target.value as Plan)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-md cursor-pointer focus:outline-none border bg-transparent appearance-none ${PLAN_BADGE[user.plan]}`}
                      >
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="agency">Agency</option>
                      </select>
                    </td>

                    {/* Brands */}
                    <td className="px-5 py-4 text-sm text-gray-300 tabular-nums">{user.brandCount}</td>

                    {/* Queries */}
                    <td className="px-5 py-4 text-sm text-gray-300 tabular-nums">
                      {user.queryCount.toLocaleString('id-ID')}
                    </td>

                    {/* Last Active */}
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm ${
                          user.lastActiveAt &&
                          Date.now() - new Date(user.lastActiveAt).getTime() < 60 * 60 * 1000
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {relativeTime(user.lastActiveAt)}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleAdmin(user._id)}
                        className="text-xs text-gray-500 hover:text-amber-400 transition-colors border border-gray-700/60 hover:border-amber-600/40 px-2.5 py-1.5 rounded-md whitespace-nowrap"
                      >
                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false) }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Create User</h2>
                <p className="text-gray-500 text-xs mt-0.5">New account via Clerk + MongoDB</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-gray-500 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium block mb-1.5">Plan</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as Plan)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-gray-500 transition-colors"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
            </div>

            {createError && (
              <p className="text-red-400 text-xs mt-3">{createError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {creating ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
