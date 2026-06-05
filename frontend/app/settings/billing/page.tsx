'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

const PLANS = [
  { key: 'starter', name: 'Starter', price: '$49', priceIDR: 'Rp 750k', prompts: '25 prompts', models: '3 models', articles: '4 articles/mo' },
  { key: 'pro', name: 'Pro', price: '$149', priceIDR: 'Rp 2.25jt', prompts: '100 prompts', models: 'All 4 models', articles: '8 articles/mo' },
  { key: 'agency', name: 'Agency', price: '$399', priceIDR: 'Rp 6jt', prompts: 'Unlimited', models: 'All 4 models', articles: 'Unlimited' },
]

export default function BillingPage() {
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
        <Link href="/settings" className="text-sm text-gray-500 hover:text-black transition-colors">← Settings</Link>
        <h1 className="text-2xl font-bold mt-4">Billing & Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Current plan: <span className="font-semibold capitalize">{currentPlan}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.key
          return (
            <div key={plan.key} className={`bg-white border rounded-2xl p-5 ${isCurrent ? 'border-gray-900' : 'border-gray-200'}`}>
              {isCurrent && (
                <span className="inline-block bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full font-medium mb-3">Current plan</span>
              )}
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-400 mb-4">{plan.priceIDR}/mo</p>
              <ul className="text-sm text-gray-600 space-y-1.5 mb-6">
                <li>✓ {plan.prompts}</li>
                <li>✓ {plan.models}</li>
                <li>✓ {plan.articles}</li>
              </ul>
              {!isCurrent && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleStripe(plan.key)}
                    disabled={!!loading}
                    className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {loading === `stripe-${plan.key}` ? 'Redirecting...' : 'Pay with Card (USD)'}
                  </button>
                  <button
                    onClick={() => handleMidtrans(plan.key)}
                    disabled={!!loading}
                    className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:border-gray-900 disabled:opacity-50 transition-colors"
                  >
                    {loading === `midtrans-${plan.key}` ? 'Redirecting...' : 'Bayar (IDR)'}
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
