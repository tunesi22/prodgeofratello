import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
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

const COOKIE = 'geo_token'

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[COOKIE] || req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { mongoId: string }
    const user = await User.findById(payload.mongoId)

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (!user.lastActiveAt || user.lastActiveAt < fiveMinAgo) {
      await User.updateOne({ _id: user._id }, { lastActiveAt: new Date() })
    }

    req.userId = user.clerkUserId
    req.userPlan = user.plan
    req.userIsAdmin = user.isAdmin ?? false
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
