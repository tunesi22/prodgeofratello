import mongoose, { Schema, Document } from 'mongoose'

export interface ICompetitor {
  name: string
  domain: string
  includeSubdomains: boolean
}

export interface IBrandDoc extends Document {
  userId: string
  name: string
  website: string
  industry: string
  competitors: ICompetitor[]
  scanFrequency: 'manual' | 'daily' | 'weekly'
  lastScannedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CompetitorSchema = new Schema<ICompetitor>(
  {
    name: { type: String, required: true },
    domain: { type: String, default: '' },
    includeSubdomains: { type: Boolean, default: false },
  },
  { _id: false }
)

const BrandSchema = new Schema<IBrandDoc>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    website: { type: String, required: true },
    industry: { type: String, required: true },
    competitors: { type: [CompetitorSchema], default: [] },
    scanFrequency: { type: String, enum: ['manual', 'daily', 'weekly'], default: 'manual' },
    lastScannedAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.model<IBrandDoc>('Brand', BrandSchema)
