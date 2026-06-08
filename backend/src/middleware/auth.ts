import { Request, Response, NextFunction } from 'express'
import { getAuth } from '@clerk/express'
import User from '../models/User'

declare global {
  namespace Express {
    interface Request {
      userId: string
      userPlan: string
      userIsAdmin: boolean
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId } = getAuth(req)

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  let user = await User.findOne({ clerkUserId: userId })
  if (!user) {
    user = await User.create({ clerkUserId: userId, email: '', lastActiveAt: new Date() })
  } else {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (!user.lastActiveAt || user.lastActiveAt < fiveMinAgo) {
      await User.updateOne({ _id: user._id }, { lastActiveAt: new Date() })
    }
  }

  req.userId = userId
  req.userPlan = user.plan
  req.userIsAdmin = user.isAdmin ?? false
  next()
}
