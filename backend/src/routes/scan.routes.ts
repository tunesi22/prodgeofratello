import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { triggerScan } from '../services/scan.service'
import QueryResult from '../models/QueryResult'
import Scan from '../models/Scan'
import { LLM_MODELS } from '../../../shared/constants'
import type { LLMModel } from '../../../shared/constants'

const router = Router({ mergeParams: true })

const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  validate: { xForwardedForHeader: false },
  message: { error: 'Scan rate limit exceeded. Max 10 scans per hour.' },
})

// POST /api/brands/:id/scan — trigger full scan
router.post('/scan', scanLimiter, async (req, res) => {
  try {
    const { jobsEnqueued, scanId } = await triggerScan(req.params.id)
    res.status(202).json({ message: 'Scan started', jobsEnqueued, scanId })
  } catch (err: any) {
    console.error('[SCAN ROUTE] POST /api/brands/:id/scan:', err.message)
    res.status(500).json({ error: err.message || 'Failed to start scan' })
  }
})

// GET /api/brands/:id/scans — scan history
router.get('/scans', async (req, res) => {
  try {
    const brandId = req.params.id
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50)

    const scans = await Scan.find({ brandId })
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean()

    // Attach per-scan mention summary
    const withSummary = await Promise.all(
      scans.map(async (scan) => {
        const byModel = await Promise.all(
          LLM_MODELS.map(async (model: LLMModel) => {
            const [total, mentioned] = await Promise.all([
              QueryResult.countDocuments({ scanId: scan._id, model }),
              QueryResult.countDocuments({ scanId: scan._id, model, mentioned: true }),
            ])
            return {
              model,
              total,
              mentioned,
              mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
            }
          })
        )

        const overall = byModel.reduce(
          (acc, m) => ({ total: acc.total + m.total, mentioned: acc.mentioned + m.mentioned }),
          { total: 0, mentioned: 0 }
        )

        return {
          ...scan,
          summary: {
            overall: {
              total: overall.total,
              mentioned: overall.mentioned,
              mentionRate: overall.total > 0 ? Math.round((overall.mentioned / overall.total) * 100) : 0,
            },
            byModel,
          },
        }
      })
    )

    res.json({ scans: withSummary })
  } catch (err: any) {
    console.error('[SCAN ROUTE] GET /api/brands/:id/scans:', err.message)
    res.status(500).json({ error: 'Failed to fetch scan history' })
  }
})

// GET /api/brands/:id/results — raw query results
router.get('/results', async (req, res) => {
  try {
    const brandId = req.params.id
    const { model, page = '1', limit = '50', mentioned, scanId } = req.query

    const filter: any = { brandId }
    if (model) filter.model = model
    if (mentioned === 'true') filter.mentioned = true
    if (mentioned === 'false') filter.mentioned = false
    if (scanId) filter.scanId = scanId

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const [results, total] = await Promise.all([
      QueryResult.find(filter)
        .populate('promptId', 'text category')
        .sort({ queriedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      QueryResult.countDocuments(filter),
    ])

    res.json({ total, page: parseInt(page as string), results })
  } catch (err: any) {
    console.error('[SCAN ROUTE] GET /api/brands/:id/results:', err.message)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
})

// GET /api/brands/:id/mention-rate — mention rate per model (all time)
router.get('/mention-rate', async (req, res) => {
  try {
    const brandId = req.params.id

    const rates = await Promise.all(
      LLM_MODELS.map(async (model: LLMModel) => {
        const [total, mentioned] = await Promise.all([
          QueryResult.countDocuments({ brandId, model }),
          QueryResult.countDocuments({ brandId, model, mentioned: true }),
        ])

        return {
          model,
          totalQueries: total,
          mentionCount: mentioned,
          mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
        }
      })
    )

    const overall = rates.reduce(
      (acc, r) => {
        acc.totalQueries += r.totalQueries
        acc.mentionCount += r.mentionCount
        return acc
      },
      { totalQueries: 0, mentionCount: 0 }
    )

    res.json({
      brandId,
      overall: {
        ...overall,
        mentionRate:
          overall.totalQueries > 0
            ? Math.round((overall.mentionCount / overall.totalQueries) * 100)
            : 0,
      },
      byModel: rates,
    })
  } catch (err: any) {
    console.error('[SCAN ROUTE] GET /api/brands/:id/mention-rate:', err.message)
    res.status(500).json({ error: 'Failed to calculate mention rate' })
  }
})

export default router
