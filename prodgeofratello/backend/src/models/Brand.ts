import mongoose, { Schema, Document } from 'mongoose'

export interface IBrandDoc extends Document {
  userId: string
  name: string
  website: string
  industry: string
  competitors: string[]
  scanFrequency: 'manual' | 'daily' | 'weekly'
  lastScannedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BrandSchema = new Schema<IBrandDoc>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    website: { type: String, required: true },
    industry: { type: String, required: true },
    competitors: { type: [String], default: [] },
    scanFrequency: { type: String, enum: ['manual', 'daily', 'weekly'], default: 'manual' },
    lastScannedAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model<IBrandDoc>('Brand', BrandSchema)
