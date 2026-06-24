import * as Sentry from '@sentry/node'
import express from 'express'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from './src/config/db'
import { connectRedis } from './src/config/redis'
import { startLLMWorker } from './src/workers/llm.worker'
import { startCronJobs } from './src/services/cron.service'
import { requireAuth } from './src/middleware/auth'
import brandRoutes from './src/routes/brand.routes'
import promptRoutes from './src/routes/prompt.routes'
import scanRoutes from './src/routes/scan.routes'
import analyticsRoutes from './src/routes/analytics.routes'
import articleRoutes from './src/routes/article.routes'
import userRoutes from './src/routes/user.routes'
import paymentRoutes from './src/routes/payment.routes'
import publicationRoutes from './src/routes/publication.routes'
import adminRoutes from './src/routes/admin.routes'
import authRoutes from './src/routes/auth.routes'
import waitlistRoutes from './src/routes/waitlist.routes'

dotenv.config({ path: '../.env' })

// ─── Sentry ──────────────────────────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 })
}

const app = express()
const PORT = process.env.PORT || 4000

// ─── Stripe webhook — needs raw body BEFORE json middleware ──────────────────
app.use('/api/payment/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(cookieParser())

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests, please try again later.' },
})

app.use(globalLimiter)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/waitlist', waitlistRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/brands', requireAuth, brandRoutes)
app.use('/api/brands/:id/prompts', requireAuth, promptRoutes)
app.use('/api/brands/:id', requireAuth, scanRoutes)
app.use('/api/brands/:id/analytics', requireAuth, analyticsRoutes)
app.use('/api/brands/:id/articles', requireAuth, articleRoutes)
app.use('/api/brands/:id/publications', requireAuth, publicationRoutes)
app.use('/api/admin', adminRoutes)

// ─── Sentry error handler ────────────────────────────────────────────────────
if (process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler())
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDB()
    await connectRedis()
    startLLMWorker()
    startCronJobs()
    console.log('[SERVER] LLM worker + cron started')

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`)
    })
  } catch (err) {
    console.error('[SERVER] Failed to start:', err)
    process.exit(1)
  }
}

start()
