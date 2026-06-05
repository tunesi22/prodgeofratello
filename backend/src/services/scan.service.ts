import { getLLMQueue } from '../workers/queue'
import { getPromptsByBrand } from './prompt.service'
import Brand from '../models/Brand'
import { LLM_MODELS } from '../../../shared/constants'

const QUERY_REPEAT_COUNT = parseInt(process.env.QUERY_REPEAT_COUNT || '5', 10)

export async function triggerScan(brandId: string): Promise<{ jobsEnqueued: number }> {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error(`[SCAN] Brand not found: ${brandId}`)

  const prompts = await getPromptsByBrand(brandId)
  if (prompts.length === 0) throw new Error(`[SCAN] No active prompts found for brand: ${brandId}`)

  const queue = getLLMQueue()
  const jobs = []

  for (const prompt of prompts) {
    for (const model of LLM_MODELS) {
      for (let i = 1; i <= QUERY_REPEAT_COUNT; i++) {
        jobs.push({
          name: `query-${prompt._id}-${model}-${i}`,
          data: {
            promptId: String(prompt._id),
            brandId,
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

  console.log(`[SCAN] Enqueued ${jobs.length} jobs for brand: ${brand.name}`)
  return { jobsEnqueued: jobs.length }
}
