'use client'

import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/cn'
import {
  PageContainer,
  PageHeader,
  Section,
  Card,
  ErrorBanner,
  Skeleton,
} from '@/components/dashboard/primitives'
import { Button, Chip, Breadcrumb } from '@/components/ui'
import { CheckCircleIcon } from '@/components/onboarding/icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

type PlanKey = 'starter' | 'pro' | 'agency'

interface Plan {
  key: PlanKey
  name: string
  price: string
  priceIDR: string
}

// Exact plans/prices from the legacy billing page (parity contract §12).
// Feature lists live in COPY below so they can be translated.
const PLANS: Plan[] = [
  { key: 'starter', name: 'Starter', price: '$49', priceIDR: 'Rp 750k' },
  { key: 'pro', name: 'Pro', price: '$149', priceIDR: 'Rp 2.25jt' },
  { key: 'agency', name: 'Agency', price: '$399', priceIDR: 'Rp 6jt' },
]

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    breadcrumbSettings: 'Pengaturan Akun',
    breadcrumbBilling: 'Tagihan',
    title: 'Tagihan',
    currentPlanPrefix: 'Paket Anda saat ini:',
    currentPlanChip: 'Paket aktif',
    perMonth: '/bln',
    features: {
      starter: ['25 prompt', '1 model AI (Gemini)', '5 artikel per bulan'],
      pro: ['100 prompt', 'Semua 4 model AI', '30 artikel per bulan'],
      agency: ['300 prompt', 'Semua 4 model AI', '100 artikel per bulan'],
    },
    payCardUSD: 'Bayar dengan Kartu (USD)',
    payIDR: 'Bayar (IDR)',
    redirecting: 'Mengalihkan…',
    checkoutFailed: 'Pembayaran gagal diproses',
  },
  en: {
    breadcrumbSettings: 'Settings',
    breadcrumbBilling: 'Billing',
    title: 'Billing & Subscription',
    currentPlanPrefix: 'Current plan:',
    currentPlanChip: 'Current plan',
    perMonth: '/mo',
    features: {
      starter: ['25 prompts', '1 AI model (Gemini)', '5 articles per month'],
      pro: ['100 prompts', 'All 4 AI models', '30 articles per month'],
      agency: ['300 prompts', 'All 4 AI models', '100 articles per month'],
    },
    payCardUSD: 'Pay with Card (USD)',
    payIDR: 'Pay in IDR',
    redirecting: 'Redirecting…',
    checkoutFailed: 'Checkout failed',
  },
} as const

export default function BillingPage(): ReactElement {
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [currentPlan, setCurrentPlan] = useState<string>('starter')
  const [planLoading, setPlanLoading] = useState<boolean>(true)
  // Keyed `stripe-{plan}` / `midtrans-{plan}` while a checkout redirect is in flight.
  const [redirecting, setRedirecting] = useState<string | null>(null)
  // Parity change: checkout failures now render an inline ErrorBanner instead of alert().
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ plan: string }>('/user/me')
      .then((u) => {
        if (!cancelled) setCurrentPlan(u.plan || 'starter')
      })
      // Parity: legacy page swallowed /user/me failures (console.error) and
      // kept the 'starter' default. Same here.
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setPlanLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleStripe(plan: string): Promise<void> {
    setCheckoutError(null)
    setRedirecting(`stripe-${plan}`)
    try {
      const { url } = await apiFetch<{ url: string }>('/payment/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = url
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : t.checkoutFailed)
    } finally {
      // Parity with legacy: redirect state clears in finally (navigation takes over on success).
      setRedirecting(null)
    }
  }

  async function handleMidtrans(plan: string): Promise<void> {
    setCheckoutError(null)
    setRedirecting(`midtrans-${plan}`)
    try {
      const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/payment/midtrans/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      })
      window.location.href = redirectUrl
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : t.checkoutFailed)
    } finally {
      setRedirecting(null)
    }
  }

  return (
    <PageContainer>
      <div className="flex w-full flex-col gap-3">
        {/* "← Settings" back link from the legacy page, as a DS Breadcrumb trail. */}
        <motion.div variants={fadeUp}>
          <Breadcrumb
            separator="/"
            items={[
              { label: t.breadcrumbSettings, href: '/settings' },
              { label: t.breadcrumbBilling },
            ]}
          />
        </motion.div>
        <PageHeader
          title={t.title}
          subtitle={
            <>
              {t.currentPlanPrefix}{' '}
              <span className="font-medium capitalize text-primary">
                {planLoading ? '…' : currentPlan}
              </span>
            </>
          }
        />
      </div>

      {checkoutError != null && (
        <motion.div variants={fadeUp}>
          <ErrorBanner message={checkoutError} />
        </motion.div>
      )}

      <Section>
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          {planLoading
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[280px]" />)
            : PLANS.map((plan) => {
                const isCurrent = currentPlan === plan.key
                return (
                  <Card
                    key={plan.key}
                    className={cn('flex flex-col gap-4 p-5', isCurrent && 'border-brand-token')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-h6 font-medium text-primary transition-colors duration-200 ease-standard">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <Chip type="success" shape="rounded" size="sm">
                          {t.currentPlanChip}
                        </Chip>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-h3 font-normal text-primary transition-colors duration-200 ease-standard">
                        {plan.price}
                        <span className="text-paragraph-medium font-normal text-tertiary">
                          {t.perMonth}
                        </span>
                      </p>
                      <p className="text-paragraph-medium text-secondary">
                        {plan.priceIDR}
                        {t.perMonth}
                      </p>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {t.features[plan.key].map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircleIcon className="size-5 shrink-0 text-icon-brand" />
                          <span className="text-paragraph-medium text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Current plan shows no checkout actions (parity with legacy page). */}
                    {!isCurrent && (
                      <div className="mt-auto flex flex-col gap-2 pt-2">
                        <Button
                          type="primary"
                          size="sm"
                          className="w-full"
                          disabled={redirecting !== null}
                          onClick={() => void handleStripe(plan.key)}
                        >
                          {redirecting === `stripe-${plan.key}` ? t.redirecting : t.payCardUSD}
                        </Button>
                        <Button
                          type="primary-outlined"
                          size="sm"
                          className="w-full"
                          disabled={redirecting !== null}
                          onClick={() => void handleMidtrans(plan.key)}
                        >
                          {redirecting === `midtrans-${plan.key}` ? t.redirecting : t.payIDR}
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })}
        </div>
      </Section>
    </PageContainer>
  )
}
