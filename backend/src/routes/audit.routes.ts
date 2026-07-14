import { Router, Request, Response } from 'express'
import { runPublicAudit, normalizeDomain, type PublicAuditResult } from '../services/publicAudit.service'
import PublicAuditLead from '../models/PublicAuditLead'

const router = Router()

// ─── Rate limiting (in-memory, per IP) ───────────────────────────────────────
const RATE_LIMIT_MAX = 8
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const ipHits = new Map<string, { count: number; resetAt: number }>()

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  if (ipHits.size > 5000) {
    for (const [key, entry] of ipHits) if (now > entry.resetAt) ipHits.delete(key)
  }
  const existing = ipHits.get(ip)
  if (!existing || now > existing.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (existing.count >= RATE_LIMIT_MAX) return false
  existing.count += 1
  return true
}

function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return String(fwd).split(',')[0].trim()
  return String(req.headers['x-real-ip'] || req.ip || 'unknown')
}

// ─── Per-domain result cache (1 hour) — also caps repeat Gemini spend ────────
const CACHE_TTL_MS = 60 * 60 * 1000
const resultCache = new Map<string, { result: PublicAuditResult; expiresAt: number }>()

function getCached(domain: string): PublicAuditResult | null {
  const entry = resultCache.get(domain)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    resultCache.delete(domain)
    return null
  }
  return entry.result
}

function setCached(domain: string, result: PublicAuditResult): void {
  if (resultCache.size > 2000) {
    const now = Date.now()
    for (const [key, entry] of resultCache) if (now > entry.expiresAt) resultCache.delete(key)
  }
  resultCache.set(domain, { result, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ─── Route ────────────────────────────────────────────────────────────────────
// POST /api/audit — PUBLIC, no auth. The marketing page reveals the headline
// score, but the per-check fix list stays server-side (stored for sales to
// hand over once a lead reaches out) and never reaches the browser.
router.post('/', async (req: Request, res: Response) => {
  if (!rateLimitOk(clientIp(req))) {
    res.status(429).json({ error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' })
    return
  }

  const { website } = req.body as { website?: string }
  const domain = typeof website === 'string' ? normalizeDomain(website) : null
  if (domain == null) {
    res.status(400).json({ error: 'invalid-website' })
    return
  }

  try {
    let result = getCached(domain)
    if (result == null) {
      result = await runPublicAudit(website!)
      setCached(domain, result)
      PublicAuditLead.create({
        domain: result.domain,
        brandName: result.brandName,
        score: result.score,
        band: result.band,
        checks: result.checks,
      }).catch((err) => console.error('[AUDIT] Failed to save lead:', err.message))
    }

    res.json({ domain: result.domain, brandName: result.brandName, score: result.score })
  } catch (err: any) {
    console.error('[AUDIT] POST / failed:', err.message)
    res.status(500).json({ error: 'audit-failed' })
  }
})

export default router
