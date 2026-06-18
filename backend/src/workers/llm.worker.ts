import { Worker } from 'bullmq'
import { getRedis } from '../config/redis'
import { queryModel } from '../services/llm'
import { parseMention } from '../utils/mention-parser'
import { detectSentiment } from '../utils/sentiment'
import QueryResult from '../models/QueryResult'
import type { LLMQueryJobData } from './queue'

const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '3', 10)

export function startLLMWorker(): Worker {
  const worker = new Worker<LLMQueryJobData>(
    'llm-query-queue',
    async (job) => {
      const { promptId, brandId, brandName, model, promptText, repeatIndex } = job.data

      console.log(`[LLM WORKER] Processing job ${job.id} — model: ${model}, repeat: ${repeatIndex}/${job.opts.attempts}`)

      const response = await queryModel(model, promptText)
      const { mentioned, mentionContext } = parseMention(response, brandName)
      const sentiment = mentioned ? detectSentiment(mentionContext) : 'neutral'

      await QueryResult.create({
        promptId,
        brandId,
        model,
        response,
        mentioned,
        sentiment,
        mentionContext,
        queriedAt: new Date(),
      })

      console.log(`[LLM WORKER] Done — model: ${model}, mentioned: ${mentioned}, sentiment: ${sentiment}`)
    },
    {
      connection: getRedis(),
      concurrency: MAX_CONCURRENT_JOBS,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[LLM WORKER] Job ${job?.id} failed:`, err.message)
  })

  return worker
}
