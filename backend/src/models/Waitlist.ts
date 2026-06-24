import mongoose, { Schema, Document } from 'mongoose'

export interface IWaitlistDoc extends Document {
  email: string
  createdAt: Date
}

const WaitlistSchema = new Schema<IWaitlistDoc>(
  { email: { type: String, required: true, unique: true, lowercase: true, trim: true } },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
)

export default mongoose.model<IWaitlistDoc>('Waitlist', WaitlistSchema)
