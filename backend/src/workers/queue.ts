import { Queue } from 'bullmq'
import { getRedis } from '../config/redis'
import type { LLMModel } from '../../../shared/constants'

export interface LLMQueryJobData {
  promptId: string
  brandId: string
  scanId: string
  brandName: string
  model: LLMModel
  promptText: string
  repeatIndex: number
}

let llmQueue: Queue<LLMQueryJobData>

export function getLLMQueue(): Queue<LLMQueryJobData> {
  if (!llmQueue) {
    llmQueue = new Queue<LLMQueryJobData>('llm-query-queue', {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    })
  }
  return llmQueue
}
