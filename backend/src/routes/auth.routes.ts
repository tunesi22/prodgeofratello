import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import { sendPasswordResetEmail } from '../services/email.service'
import { effectivePlan } from '../utils/devPlan'

const router = Router()
const COOKIE = 'geo_token'

// Reset tokens live for 1 hour. We store only the SHA-256 hash of the token in
// the DB (never the raw token), so a leaked DB row cannot be used to reset a
// password — the raw token only ever exists in the emailed link.
const RESET_TTL_MS = 60 * 60 * 1000
const hashToken = (raw: string): string => crypto.createHash('sha256').update(raw).digest('hex')
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password wajib diisi.' })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user?.passwordHash) {
      res.status(401).json({ error: 'Email atau password salah.' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash as string)
    if (!valid) {
      res.status(401).json({ error: 'Email atau password salah.' })
      return
    }

    const token = jwt.sign({ mongoId: user._id.toString() }, process.env.JWT_SECRET!, { expiresIn: '30d' })
    res.cookie(COOKIE, token, COOKIE_OPTS)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE)
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE]
    if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { mongoId: string }
    const user = await User.findById(payload.mongoId).select('-passwordHash')
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return }
    const obj = user.toObject()
    obj.plan = effectivePlan(obj.plan)
    res.json(obj)
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

// POST /api/auth/forgot-password
// Always responds 200 with the same body whether or not the email exists, so
// the endpoint cannot be used to enumerate which emails have accounts.
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const generic = { ok: true, message: 'If an account exists for that email, a reset link is on its way.' }

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email wajib diisi.' })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      res.json(generic)
      return
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.resetTokenHash = hashToken(rawToken)
    user.resetTokenExpiry = new Date(Date.now() + RESET_TTL_MS)
    await user.save()

    const base = process.env.FRONTEND_URL || 'http://localhost:3000'
    const resetUrl = `${base.replace(/\/$/, '')}/reset-password?token=${rawToken}`
    await sendPasswordResetEmail({ to: user.email, resetUrl })

    res.json(generic)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      res.status(400).json({ error: 'Token dan password baru wajib diisi.' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password minimal 8 karakter.' })
      return
    }

    const user = await User.findOne({
      resetTokenHash: hashToken(token),
      resetTokenExpiry: { $gt: new Date() },
    })
    if (!user) {
      res.status(400).json({ error: 'Tautan reset tidak valid atau sudah kedaluwarsa.' })
      return
    }

    user.passwordHash = await bcrypt.hash(password, 12)
    // Burn the token so the link can only be used once.
    user.resetTokenHash = undefined
    user.resetTokenExpiry = undefined
    await user.save()

    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
