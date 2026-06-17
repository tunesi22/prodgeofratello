import { Router } from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User'
import Brand from '../models/Brand'
import QueryResult from '../models/QueryResult'
import { requireAuth } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

router.use(requireAuth, requireAdmin)

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeToday = await User.countDocuments({ lastActiveAt: { $gte: today } })
    const proPlus = await User.countDocuments({ plan: { $in: ['pro', 'agency'] } })
    const totalBrands = await Brand.countDocuments()
    res.json({ totalUsers, activeToday, proPlus, totalBrands })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean()
    const enriched = await Promise.all(
      users.map(async (user) => {
        const brands = await Brand.find({ userId: user.clerkUserId }, '_id').lean()
        const brandIds = brands.map((b) => b._id)
        const queryCount =
          brandIds.length > 0
            ? await QueryResult.countDocuments({ brandId: { $in: brandIds } })
            : 0
        return { ...user, brandCount: brands.length, queryCount }
      })
    )
    res.json(enriched)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/users
router.post('/users', async (req, res) => {
  try {
    const { email, password, plan = 'starter' } = req.body
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password wajib diisi.' })
      return
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      res.status(409).json({ error: 'Email sudah digunakan.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      clerkUserId: new mongoose.Types.ObjectId().toString(),
      email: email.toLowerCase().trim(),
      plan,
      passwordHash,
    })
    const obj: any = user.toObject()
    delete obj.passwordHash
    res.status(201).json(obj)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/users/:id/plan
router.patch('/users/:id/plan', async (req, res) => {
  try {
    const { plan } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { plan }, { new: true })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/users/:id/toggle-admin
router.patch('/users/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    user.isAdmin = !user.isAdmin
    await user.save()
    res.json(user)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
