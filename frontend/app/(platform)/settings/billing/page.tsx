'use client'

import { useEffect, useState } from 'react'
import { useApiFetch } from '@/lib/useApiFetch'
import Link from 'next/link'

const PLANS = [
  { key: 'starter', name: 'Starter', price: '$49', priceIDR: 'Rp 750k', prompts: '25 prompts', models: '3 models', articles: '4 articles/mo' },
  { key: 'pro', name: 'Pro', price: '$149', priceIDR: 'Rp 2.25jt', prompts: '100 prompts', models: 'All 4 models', articles: '8 articles/mo' },
  { key: 'agency', name: 'Agency', price: '$399', priceIDR: 'Rp 6jt', prompts: 'Unlimited', models: 'All 4 models', articles: 'Unlimited' },
]

export default function BillingPage() {
  const apiFetch = useApiFetch()
  const [currentPlan, setCurrentPlan] = useState<string>('starter')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<{ plan: string }>('/user/me')
      .then((u) => setCurrentPlan(u.plan))
      .catch(console.error)
  }, [])

  async function handleStripe(plan: string) {
    setLoading(`stripe-${plan}`)
    try {
      const { url } = await apiFetch<{ url: string }>('/payment/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = url
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
  }

  async function handleMidtrans(plan: string) {
    setLoading(`midtrans-${plan}`)
    try {
      const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/payment/midtrans/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = redirectUrl
    } catch (e: any) { alert(e.message) }
    finally { setLoading(null) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Settings</Link>
        <h1 className="text-2xl font-bold text-white mt-4 tracking-tight">Billing & Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Current plan: <span className="font-semibold text-gray-300 capitalize">{currentPlan}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          return (
            <div
              key={plan.key}
              className={`bg-gray-900 border rounded-2xl p-5 transition-colors ${
                isCurrent ? 'border-emerald-600/60' : 'border-gray-800'
              }`}
            >
              {isCurrent && (
                <span className="inline-block bg-emerald-600/20 text-emerald-400 border border-emerald-700/40 text-xs px-2.5 py-1 rounded-full font-semibold mb-3">
                  Current plan
                </span>
              )}
              <h3 className="font-bold text-lg text-white">{plan.name}</h3>
              <p className="text-2xl font-bold text-white mt-1">
                {plan.price}<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">{plan.priceIDR}/mo</p>
              <ul className="text-sm text-gray-400 space-y-1.5 mb-6">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> {plan.prompts}</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> {plan.models}</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> {plan.articles}</li>
              </ul>
              {!isCurrent && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleStripe(plan.key)}
                    disabled={!!loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {loading === `stripe-${plan.key}` ? 'Redirecting…' : 'Pay with Card (USD)'}
                  </button>
                  <button
                    onClick={() => handleMidtrans(plan.key)}
                    disabled={!!loading}
                    className="w-full border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {loading === `midtrans-${plan.key}` ? 'Redirecting…' : 'Bayar (IDR)'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
