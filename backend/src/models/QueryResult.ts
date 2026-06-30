import mongoose, { Schema, Document } from 'mongoose'
import type { LLMModel, Sentiment } from '../../../shared/constants'

export interface IQueryResultDoc extends Document {
  promptId: mongoose.Types.ObjectId
  brandId: mongoose.Types.ObjectId
  scanId: mongoose.Types.ObjectId
  model: LLMModel
  response: string
  mentioned: boolean
  sentiment: Sentiment
  mentionContext: string
  citations: string[]
  queriedAt: Date
}

const QueryResultSchema = new Schema<IQueryResultDoc>(
  {
    promptId: { type: Schema.Types.ObjectId, ref: 'Prompt', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    scanId: { type: Schema.Types.ObjectId, ref: 'Scan', required: true, index: true },
    model: {
      type: String,
      enum: ['openai', 'gemini', 'perplexity', 'anthropic'],
      required: true,
    },
    response: { type: String, default: '' },
    mentioned: { type: Boolean, required: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true,
    },
    mentionContext: { type: String, default: '' },
    citations: { type: [String], default: [] },
    queriedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

QueryResultSchema.index({ brandId: 1, model: 1 })
QueryResultSchema.index({ brandId: 1, queriedAt: -1 })

export default mongoose.model<IQueryResultDoc>('QueryResult', QueryResultSchema)
