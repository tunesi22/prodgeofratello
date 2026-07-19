const STALE_BUNDLE_PATTERN = /Failed to find Server Action|Loading chunk|ChunkLoadError/i

const RELOAD_FLAG_KEY = 'fratello-stale-reload-at'
const RELOAD_COOLDOWN_MS = 10_000

/**
 * True for errors caused by a browser tab holding a JS bundle from a build
 * that's no longer live on the server (post-deploy action-id/chunk mismatch)
 * rather than a real application bug.
 */
export function isStaleBundleError(error: Error): boolean {
  return STALE_BUNDLE_PATTERN.test(error.message)
}

/**
 * Reloads the page to pick up the current build, but only once per cooldown
 * window so a persistent error can't trigger a reload loop.
 */
export function recoverFromStaleBundle(): void {
  const lastReload = Number(sessionStorage.getItem(RELOAD_FLAG_KEY) || 0)
  if (Date.now() - lastReload < RELOAD_COOLDOWN_MS) return
  sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()))
  window.location.reload()
}
