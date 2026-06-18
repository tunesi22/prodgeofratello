import { Router } from 'express'
import {
  getFullAnalytics,
  getPromptGaps,
  getTrends,
} from '../services/analytics.service'
import { getSemanticProximity, getCooccurrence } from '../services/semantic.service'
import Brand from '../models/Brand'

const router = Router({ mergeParams: true })

// GET /api/brands/:id/analytics
router.get('/', async (req, res) => {
  try {
    const data = await getFullAnalytics(req.params.id)
    res.json(data)
  } catch (err: any) {
    console.error('[ANALYTICS ROUTE] GET /analytics:', err.message)
    res.status(500).json({ error: err.message || 'Failed to get analytics' })
  }
})

// GET /api/brands/:id/gaps
router.get('/gaps', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 20
    const gaps = await getPromptGaps(req.params.id, threshold)
    res.json({ count: gaps.length, gaps })
  } catch (err: any) {
    console.error('[ANALYTICS ROUTE] GET /gaps:', err.message)
    res.status(500).json({ error: 'Failed to get prompt gaps' })
  }
})

// GET /api/brands/:id/trends
router.get('/trends', async (req, res) => {
  try {
    const trends = await getTrends(req.params.id)
    res.json(trends)
  } catch (err: any) {
    console.error('[ANALYTICS ROUTE] GET /trends:', err.message)
    res.status(500).json({ error: 'Failed to get trends' })
  }
})

// GET /api/brands/:id/analytics/semantic-proximity
router.get('/semantic-proximity', async (req, res) => {
  try {
    const data = await getSemanticProximity(req.params.id)
    res.json(data)
  } catch (err: any) {
    console.error('[ANALYTICS ROUTE] GET /semantic-proximity:', err.message)
    res.status(500).json({ error: err.message || 'Failed to compute semantic proximity' })
  }
})

// GET /api/brands/:id/analytics/cooccurrence
router.get('/cooccurrence', async (req, res) => {
  try {
    const data = await getCooccurrence(req.params.id)
    res.json(data)
  } catch (err: any) {
    console.error('[ANALYTICS ROUTE] GET /cooccurrence:', err.message)
    res.status(500).json({ error: err.message || 'Failed to compute co-occurrence' })
  }
})

// PATCH /api/brands/:id/settings — update scan frequency
router.patch('/settings', async (req, res) => {
  try {
    const { scanFrequency } = req.body
    if (!['manual', 'daily', 'weekly'].includes(scanFrequency)) {
      res.status(400).json({ error: 'scanFrequency must be manual, daily, or weekly' })
      return
    }
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { scanFrequency },
      { new: true }
    )
    if (!brand) { res.status(404).json({ error: 'Brand not found' }); return }
    res.json(brand)
  } catch (err: any) {
    console.error('[ANALYTICS ROUTE] PATCH /settings:', err.message)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

export default router
