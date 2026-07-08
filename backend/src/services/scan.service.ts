import { getLLMQueue } from '../workers/queue'
import { getPromptsByBrand } from './prompt.service'
import Brand from '../models/Brand'
import Scan from '../models/Scan'
import { PLAN_MODELS } from '../../../shared/constants'
import type { PlanTier } from '../../../shared/constants'

const MAX_QUERIES_PER_MODEL = 150

export async function triggerScan(
  brandId: string,
  plan: PlanTier
): Promise<{ jobsEnqueued: number; scanId: string }> {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error(`[SCAN] Brand not found: ${brandId}`)

  const prompts = await getPromptsByBrand(brandId)
  if (prompts.length === 0) throw new Error(`[SCAN] No active prompts found for brand: ${brandId}`)

  const models = PLAN_MODELS[plan]

  const baseRepeat = parseInt(process.env.QUERY_REPEAT_COUNT || '5', 10)
  // Cap so total per model never exceeds MAX_QUERIES_PER_MODEL
  const repeatCount = Math.min(baseRepeat, Math.floor(MAX_QUERIES_PER_MODEL / prompts.length)) || 1

  const totalJobs = prompts.length * models.length * repeatCount

  const scan = await Scan.create({ brandId, totalJobs })
  const scanId = String(scan._id)

  const queue = getLLMQueue()
  const jobs = []

  for (const prompt of prompts) {
    for (const model of models) {
      for (let i = 1; i <= repeatCount; i++) {
        jobs.push({
          name: `query-${prompt._id}-${model}-${i}`,
          data: {
            promptId: String(prompt._id),
            brandId,
            scanId,
            brandName: brand.name,
            model,
            promptText: prompt.text,
            repeatIndex: i,
          },
        })
      }
    }
  }

  await queue.addBulk(jobs)

  console.log(`[SCAN] Enqueued ${jobs.length} jobs for brand: ${brand.name} (scanId: ${scanId}, repeat: ${repeatCount}x)`)
  return { jobsEnqueued: jobs.length, scanId }
}
