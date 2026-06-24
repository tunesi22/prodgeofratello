import mongoose, { Schema, Document } from 'mongoose'

export interface IScanDoc extends Document {
  brandId: mongoose.Types.ObjectId
  startedAt: Date
  completedAt?: Date
  status: 'running' | 'completed' | 'failed'
  totalJobs: number
  completedJobs: number
}

const ScanSchema = new Schema<IScanDoc>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
    totalJobs: { type: Number, required: true },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: false }
)

ScanSchema.index({ brandId: 1, startedAt: -1 })

export default mongoose.model<IScanDoc>('Scan', ScanSchema)
