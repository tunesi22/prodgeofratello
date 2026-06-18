import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  createStripeCheckout,
  handleStripeWebhook,
  createMidtransTransaction,
  handleMidtransWebhook,
} from '../services/payment.service'
import type { PlanTier } from '../../../shared/constants'

const router = Router()

// POST /api/payment/stripe/checkout
router.post('/stripe/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const session = await createStripeCheckout(
      req.userId,
      plan as PlanTier,
      `${frontendUrl}/settings/billing?success=true`,
      `${frontendUrl}/settings/billing?cancelled=true`
    )
    res.json({ url: session.url })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/payment/stripe/webhook — raw body required
router.post('/stripe/webhook', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string
    await handleStripeWebhook(req.body, sig)
    res.json({ received: true })
  } catch (err: any) {
    console.error('[PAYMENT] Stripe webhook error:', err.message)
    res.status(400).json({ error: err.message })
  }
})

// POST /api/payment/midtrans/checkout
router.post('/midtrans/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body
    const result = await createMidtransTransaction(req.userId, plan as PlanTier)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/payment/midtrans/webhook
router.post('/midtrans/webhook', async (req: Request, res: Response) => {
  try {
    await handleMidtransWebhook(req.body)
    res.json({ received: true })
  } catch (err: any) {
    console.error('[PAYMENT] Midtrans webhook error:', err.message)
    res.status(400).json({ error: err.message })
  }
})

export default router
