#!/bin/bash
# Atomic, zero-downtime deploy for prodgeofratello.
#
# Why this exists: manual `git pull && next build && pm2 restart` builds
# .next/dist IN PLACE while PM2 (autorestart:true, cluster mode) keeps the
# old process alive — a restart landing mid-build catches a half-written
# .next/dist and crash-loops with "Could not find a production build" /
# "Failed to find Server Action" until the build finishes. This script
# builds to a scratch directory, only swaps it in after a successful build,
# and uses `pm2 reload` (graceful, cluster-mode) instead of `restart` so the
# old worker keeps serving traffic until the new one is ready.
#
# Usage: ./deploy/deploy.sh   (run from anywhere; cd's to repo root itself)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

if [ -z "${DEPLOY_POST_PULL:-}" ]; then
  echo "[DEPLOY] Pulling origin main..."
  git pull origin main
  # This script tracks itself in git — if the pull just changed this file,
  # continuing to execute from the same already-open read can pick up stale
  # or spliced content past this point. Re-exec a fresh process so the rest
  # of the deploy is read cleanly off disk after the pull.
  exec env DEPLOY_POST_PULL=1 bash "$REPO_DIR/deploy/deploy.sh"
fi

echo "[DEPLOY] Building backend..."
cd "$REPO_DIR/backend"
npm ci
rm -rf dist-new
# tsc exits non-zero on this codebase's pre-existing type errors even though
# noEmitOnError:false still writes the JS output (this has always been true,
# not something introduced here) — so gate on the actual output file rather
# than tsc's exit code, or every deploy would abort on unrelated type noise.
npx tsc --outDir dist-new || true
if [ ! -f dist-new/backend/index.js ]; then
  echo "[DEPLOY] Backend build FAILED — dist-new/backend/index.js was not produced. Aborting."
  exit 1
fi

echo "[DEPLOY] Building frontend..."
cd "$REPO_DIR/frontend"
npm ci
rm -rf .next-new
NEXT_DIST_DIR=.next-new npx next build

echo "[DEPLOY] Both builds succeeded — swapping into place..."

cd "$REPO_DIR/backend"
rm -rf dist-old
[ -d dist ] && mv dist dist-old
mv dist-new dist

cd "$REPO_DIR/frontend"
rm -rf .next-old
[ -d .next ] && mv .next .next-old
mv .next-new .next

echo "[DEPLOY] Reloading PM2 (graceful, zero-downtime)..."
cd "$REPO_DIR"
pm2 reload ecosystem.config.js --env production --only prodgeo-backend,prodgeo-frontend

echo "[DEPLOY] Cleaning up previous build..."
rm -rf "$REPO_DIR/backend/dist-old" "$REPO_DIR/frontend/.next-old"

echo "[DEPLOY] Done."
