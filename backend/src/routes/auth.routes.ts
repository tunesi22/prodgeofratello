import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE = 'geo_token'
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

    const token = jwt.sign({ mongoId: user._id.toString() }, JWT_SECRET, { expiresIn: '30d' })
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
    const payload = jwt.verify(token, JWT_SECRET) as { mongoId: string }
    const user = await User.findById(payload.mongoId).select('-passwordHash')
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return }
    res.json(user)
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

export default router
