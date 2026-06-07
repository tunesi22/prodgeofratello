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

  if (!settings) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Account & alert preferences</p>

      {/* Plan badge */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="font-semibold text-lg mt-0.5">{PLAN_LABELS[settings.plan] || settings.plan}</p>
        </div>
        <a href="/settings/billing" className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:border-gray-900 transition-colors">
          Manage Billing →
        </a>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold">Alert Preferences</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Alert threshold (mention rate drop %)
          </label>
          <input
            type="number"
            min={5} max={100}
            value={settings.alertThreshold}
            onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-400 mt-1">Alert when mention rate drops by this % week-over-week</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.alertEmail}
              onChange={(e) => setSettings({ ...settings, alertEmail: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">Email alerts via Resend</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.alertWhatsApp}
              onChange={(e) => setSettings({ ...settings, alertWhatsApp: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm font-medium">WhatsApp alerts via WaConnectHub</span>
          </label>
        </div>

        {settings.alertWhatsApp && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
            <input
              type="text"
              value={settings.whatsappNumber || ''}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              placeholder="628123456789"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
          {saved && <span className="text-green-600 text-sm">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
