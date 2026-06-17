import { Request, Response, NextFunction } from 'express'

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.userIsAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  next()
}
