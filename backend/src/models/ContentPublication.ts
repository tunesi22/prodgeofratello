import mongoose, { Schema, Document } from 'mongoose'

export type PlatformType = 'reddit' | 'medium' | 'forum' | 'blog' | 'directory' | 'other'

export interface IContentPublicationDoc extends Document {
  brandId: string
  title: string
  platform: string
  platformType: PlatformType
  url: string
  publishedAt: Date
  articleId?: string
  mentionRateAtPublish?: number
  createdAt: Date
  updatedAt: Date
}

const ContentPublicationSchema = new Schema<IContentPublicationDoc>(
  {
    brandId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    platform: { type: String, required: true },
    platformType: {
      type: String,
      enum: ['reddit', 'medium', 'forum', 'blog', 'directory', 'other'],
      default: 'other',
    },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    articleId: { type: String },
    mentionRateAtPublish: { type: Number },
  },
  { timestamps: true }
)

export default mongoose.model<IContentPublicationDoc>('ContentPublication', ContentPublicationSchema)
