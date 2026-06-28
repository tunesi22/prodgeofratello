import type { PlanTier } from '../../../shared/constants'

let warned = false

/**
 * LOCAL DEV ONLY — returns 'agency' for every account so the full feature set can be
 * tested locally without hitting plan gates.
 *
 * Double-gated so it can NEVER fire in production:
 *   1. DEV_FORCE_AGENCY must be explicitly 'true', AND
 *   2. NODE_ENV must not be 'production'.
 *
 * In-memory only — it never writes to the DB, so no plan is actually persisted.
 */
export function effectivePlan(dbPlan: PlanTier): PlanTier {
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_FORCE_AGENCY === 'true') {
    if (!warned) {
      console.warn('[DEV] DEV_FORCE_AGENCY active — every account is treated as Agency. NEVER enable in production.')
      warned = true
    }
    return 'agency'
  }
  return dbPlan
}
