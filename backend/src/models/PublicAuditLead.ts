import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditCheck {
  key: string
  impact: 'high' | 'medium' | 'low'
  weight: number
  passed: boolean
}

export interface IPublicAuditLeadDoc extends Document {
  domain: string
  brandName: string
  score: number
  band: 'low' | 'mid' | 'high'
  checks: IAuditCheck[]
  createdAt: Date
}

const AuditCheckSchema = new Schema<IAuditCheck>(
  {
    key: { type: String, required: true },
    impact: { type: String, enum: ['high', 'medium', 'low'], required: true },
    weight: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { _id: false }
)

const PublicAuditLeadSchema = new Schema<IPublicAuditLeadDoc>(
  {
    domain: { type: String, required: true, lowercase: true, trim: true, index: true },
    brandName: { type: String, required: true },
    score: { type: Number, required: true },
    band: { type: String, enum: ['low', 'mid', 'high'], required: true },
    checks: { type: [AuditCheckSchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

export default mongoose.model<IPublicAuditLeadDoc>('PublicAuditLead', PublicAuditLeadSchema)
