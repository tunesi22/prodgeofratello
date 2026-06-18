import mongoose, { Schema, Document } from 'mongoose'

export interface IPromptDoc extends Document {
  brandId: mongoose.Types.ObjectId
  text: string
  category: string
  isActive: boolean
  createdAt: Date
}

const PromptSchema = new Schema<IPromptDoc>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    text: { type: String, required: true },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export default mongoose.model<IPromptDoc>('Prompt', PromptSchema)
