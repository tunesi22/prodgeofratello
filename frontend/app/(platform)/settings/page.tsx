'use client'

import { useEffect, useState } from 'react'
import { useApiFetch } from '@/lib/useApiFetch'

interface UserSettings {
  email: string
  plan: string
  alertThreshold: number
  alertEmail: boolean
  alertWhatsApp: boolean
  whatsappNumber: string
}

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', agency: 'Agency' }
const PLAN_BADGE: Record<string, string> = {
  starter: 'bg-gray-800 text-gray-300 border border-gray-700',
  pro: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  agency: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
}

export default function SettingsPage() {
  const apiFetch = useApiFetch()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    apiFetch<UserSettings>('/user/me').then(setSettings).catch(console.error)
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      await apiFetch('/user/me', {
        method: 'PATCH',
        body: JSON.stringify({
          alertThreshold: settings.alertThreshold,
          alertEmail: settings.alertEmail,
          alertWhatsApp: settings.alertWhatsApp,
          whatsappNumber: settings.whatsappNumber,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (!settings) return (
    <div className="p-8 space-y-4">
      {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] text-gray-600 font-semibold tracking-[0.15em] uppercase mb-1">Account</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Account & alert preferences</p>
      </div>

      {/* Plan */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 font-semibold tracking-widest uppercase">Current Plan</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${PLAN_BADGE[settings.plan] || PLAN_BADGE.starter}`}>
              {PLAN_LABELS[settings.plan] || settings.plan}
            </span>
          </div>
        </div>
        <a
          href="/settings/billing"
          className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Manage Billing →
        </a>
      </div>

      {/* Alert prefs */}
      <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-white">Alert Preferences</h2>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Alert threshold (mention rate drop %)
          </label>
          <input
            type="number"
            min={5} max={100}
            value={settings.alertThreshold}
            onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
            className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 transition-colors"
          />
          <p className="text-xs text-gray-600 mt-1.5">Alert when mention rate drops by this % week-over-week</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.alertEmail}
              onChange={(e) => setSettings({ ...settings, alertEmail: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Email alerts via Resend</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.alertWhatsApp}
              onChange={(e) => setSettings({ ...settings, alertWhatsApp: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">WhatsApp alerts via WaConnectHub</span>
          </label>
        </div>

        {settings.alertWhatsApp && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">WhatsApp Number</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="628123456789"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saved && <span className="text-emerald-400 text-sm">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
