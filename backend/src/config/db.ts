import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('[DB] MONGODB_URI is not defined in environment variables')
  }

  try {
    await mongoose.connect(uri)
    console.log('[DB] Connected to MongoDB')
  } catch (err) {
    console.error('[DB] Connection failed:', err)
    throw err
  }
}
