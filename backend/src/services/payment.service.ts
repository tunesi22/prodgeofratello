import Stripe from 'stripe'
import User from '../models/User'
import type { PlanTier } from '../../../shared/constants'

// ─── Stripe ──────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not set')
  return new Stripe(key)
}

const STRIPE_PRICE_IDS: Record<PlanTier, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
  agency: process.env.STRIPE_PRICE_AGENCY || '',
}

export async function createStripeCheckout(clerkUserId: string, plan: PlanTier, successUrl: string, cancelUrl: string) {
  const stripe = getStripe()
  const user = await User.findOne({ clerkUserId })
  if (!user) throw new Error('User not found')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: STRIPE_PRICE_IDS[plan], quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { clerkUserId, plan },
    ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : { customer_email: user.email }),
  })

  return session
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not set')

  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { clerkUserId, plan } = session.metadata || {}
    if (!clerkUserId || !plan) return

    await User.findOneAndUpdate(
      { clerkUserId },
      {
        plan: plan as PlanTier,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      }
    )
    console.log(`[PAYMENT] Stripe plan updated: ${clerkUserId} → ${plan}`)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await User.findOneAndUpdate(
      { stripeSubscriptionId: sub.id },
      { plan: 'starter', stripeSubscriptionId: undefined }
    )
    console.log(`[PAYMENT] Stripe subscription cancelled, downgraded to starter`)
  }
}

// ─── Midtrans ────────────────────────────────────────────────────────────────

const MIDTRANS_PRICES_IDR: Record<PlanTier, number> = {
  starter: 750_000,
  pro: 2_250_000,
  agency: 6_000_000,
}

export async function createMidtransTransaction(clerkUserId: string, plan: PlanTier) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY not set')

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  const baseUrl = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const orderId = `geo-${clerkUserId}-${plan}-${Date.now()}`
  const grossAmount = MIDTRANS_PRICES_IDR[plan]

  const user = await User.findOne({ clerkUserId })

  const body = {
    transaction_details: { order_id: orderId, gross_amount: grossAmount },
    credit_card: { secure: true },
    customer_details: { email: user?.email || '' },
    metadata: { clerkUserId, plan },
  }

  const credentials = Buffer.from(`${serverKey}:`).toString('base64')
  const { default: axios } = await import('axios')

  const res = await axios.post(baseUrl, body, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  })

  return { token: res.data.token, redirectUrl: res.data.redirect_url, orderId }
}

export async function handleMidtransWebhook(body: any): Promise<void> {
  const { order_id, transaction_status, metadata } = body

  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    const { clerkUserId, plan } = metadata || {}
    if (!clerkUserId || !plan) return

    await User.findOneAndUpdate(
      { clerkUserId },
      { plan: plan as PlanTier, midtransOrderId: order_id }
    )
    console.log(`[PAYMENT] Midtrans plan updated: ${clerkUserId} → ${plan}`)
  }
}
