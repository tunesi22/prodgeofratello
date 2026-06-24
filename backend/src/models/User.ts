import mongoose, { Schema, Document } from 'mongoose'
import type { PlanTier } from '../../../shared/constants'

export interface IUserDoc extends Document {
  clerkUserId: string
  email: string
  plan: PlanTier
  isAdmin: boolean
  passwordHash?: string
  lastActiveAt?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  midtransOrderId?: string
  alertThreshold: number
  alertEmail: boolean
  alertWhatsApp: boolean
  whatsappNumber?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUserDoc>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: '' },
    plan: { type: String, enum: ['starter', 'pro', 'agency'], default: 'starter' },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    midtransOrderId: { type: String },
    isAdmin: { type: Boolean, default: false },
    passwordHash: { type: String },
    lastActiveAt: { type: Date },
    alertThreshold: { type: Number, default: 20 },
    alertEmail: { type: Boolean, default: true },
    alertWhatsApp: { type: Boolean, default: false },
    whatsappNumber: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model<IUserDoc>('User', UserSchema)
