import { Router } from 'express'
import User from '../models/User'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/user/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.userId })
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/user/me — update alert preferences
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { alertThreshold, alertEmail, alertWhatsApp, whatsappNumber } = req.body
    const user = await User.findOneAndUpdate(
      { clerkUserId: req.userId },
      { alertThreshold, alertEmail, alertWhatsApp, whatsappNumber },
      { new: true }
    )
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
