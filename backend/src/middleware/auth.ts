import { Request, Response, NextFunction } from 'express'
import { getAuth } from '@clerk/express'
import User from '../models/User'

declare global {
  namespace Express {
    interface Request {
      userId: string
      userPlan: string
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req)

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Upsert user in DB (first login creates the record)
  let user = await User.findOne({ clerkUserId: userId })
  if (!user) {
    user = await User.create({ clerkUserId: userId, email: '' })
  }

  req.userId = userId
  req.userPlan = user.plan
  next()
}
