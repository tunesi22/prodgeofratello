import { Worker } from 'bullmq'
import { getRedis } from '../config/redis'
import { queryModel } from '../services/llm'
import { parseMention } from '../utils/mention-parser'
import { detectSentiment } from '../utils/sentiment'
import QueryResult from '../models/QueryResult'
import Scan from '../models/Scan'
import type { LLMQueryJobData } from './queue'

const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '2', 10)

export function startLLMWorker(): Worker {
  const worker = new Worker<LLMQueryJobData>(
    'llm-query-queue',
    async (job) => {
      const { promptId, brandId, scanId, brandName, model, promptText, repeatIndex } = job.data

      console.log(`[LLM WORKER] Processing job ${job.id} — model: ${model}, repeat: ${repeatIndex}`)

      const { content, citations } = await queryModel(model, promptText)
      const { mentioned, mentionContext } = parseMention(content, brandName)
      const sentiment = mentioned ? detectSentiment(mentionContext) : 'neutral'

      await QueryResult.create({
        promptId,
        brandId,
        scanId,
        model,
        response: content,
        mentioned,
        sentiment,
        mentionContext,
        citations,
        queriedAt: new Date(),
      })

      // Update scan progress atomically
      const updated = await Scan.findByIdAndUpdate(
        scanId,
        { $inc: { completedJobs: 1 } },
        { new: true }
      )
      if (updated && updated.completedJobs >= updated.totalJobs) {
        await Scan.findByIdAndUpdate(scanId, { status: 'completed', completedAt: new Date() })
      }

      console.log(`[LLM WORKER] Done — model: ${model}, mentioned: ${mentioned}, sentiment: ${sentiment}, citations: ${citations.length}`)
    },
    {
      connection: getRedis(),
      concurrency: MAX_CONCURRENT_JOBS,
      // Throttle to max 2 jobs/sec to keep CPU cool
      limiter: {
        max: 2,
        duration: 1000,
      },
    }
  )

  worker.on('failed', async (job, err) => {
    console.error(`[LLM WORKER] Job ${job?.id} failed:`, err.message)
    // Still increment so scan can complete even with failures
    if (job?.data?.scanId) {
      const updated = await Scan.findByIdAndUpdate(
        job.data.scanId,
        { $inc: { completedJobs: 1 } },
        { new: true }
      )
      if (updated && updated.completedJobs >= updated.totalJobs) {
        await Scan.findByIdAndUpdate(job.data.scanId, { status: 'completed', completedAt: new Date() })
      }
    }
  })

  return worker
}
