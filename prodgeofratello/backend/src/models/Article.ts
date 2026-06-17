import mongoose, { Schema, Document } from 'mongoose'
import type { ArticleFormat, ArticleStatus } from '../../../shared/constants'

export interface IArticleDoc extends Document {
  brandId: mongoose.Types.ObjectId
  promptId: mongoose.Types.ObjectId
  title: string
  content: string
  format: ArticleFormat
  status: ArticleStatus
  generatedAt: Date
}

const ArticleSchema = new Schema<IArticleDoc>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    promptId: { type: Schema.Types.ObjectId, ref: 'Prompt', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    format: { type: String, enum: ['markdown', 'html'], default: 'markdown' },
    status: { type: String, enum: ['draft', 'ready'], default: 'draft' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

export default mongoose.model<IArticleDoc>('Article', ArticleSchema)
