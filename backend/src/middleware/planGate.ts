import { Request, Response, NextFunction } from 'express'
import { PLAN_LIMITS } from '../../../shared/constants'
import type { PlanTier } from '../../../shared/constants'
import Article from '../models/Article'
import Prompt from '../models/Prompt'

// Gate by number of active prompts allowed per brand. Skipped when `regenerate=true`
// since that flow clears existing prompts before generating a fresh batch of the
// same size, so the pre-clear count shouldn't block it.
export async function gatePromptLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.query.regenerate === 'true') {
    next()
    return
  }

  const plan = (req.userPlan || 'starter') as PlanTier
  const limits = PLAN_LIMITS[plan]

  if (limits.prompts === null) {
    next()
    return
  }

  const brandId = req.params.id
  const used = await Prompt.countDocuments({ brandId, isActive: true })

  if (used >= limits.prompts) {
    res.status(403).json({
      error: `Prompt quota reached for ${plan} plan (${limits.prompts} prompts). Upgrade to add more.`,
      quota: limits.prompts,
      used,
    })
    return
  }

  next()
}

// Gate article generation by monthly quota
export async function gateArticleQuota(req: Request, res: Response, next: NextFunction): Promise<void> {
  const plan = (req.userPlan || 'starter') as PlanTier
  const limits = PLAN_LIMITS[plan]

  if (limits.articlesPerMonth === null) {
    next()
    return
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const brandId = req.params.id
  const count = await Article.countDocuments({
    brandId,
    generatedAt: { $gte: startOfMonth },
  })

  if (count >= limits.articlesPerMonth) {
    res.status(403).json({
      error: `Article quota reached for ${plan} plan (${limits.articlesPerMonth}/month). Upgrade to generate more.`,
      quota: limits.articlesPerMonth,
      used: count,
    })
    return
  }

  next()
}
