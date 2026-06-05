import { Request, Response, NextFunction } from 'express'
import { PLAN_LIMITS } from '../../../shared/constants'
import type { PlanTier } from '../../../shared/constants'
import Article from '../models/Article'

// Gate by number of prompts allowed per brand
export function gatePromptLimit(req: Request, res: Response, next: NextFunction): void {
  const plan = (req.userPlan || 'starter') as PlanTier
  const limits = PLAN_LIMITS[plan]
  // Prompt limit enforcement is handled in prompt.service.ts
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
