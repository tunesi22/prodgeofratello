#!/bin/bash
# Cron entry point for the daily blog autopost. Runs as a non-interactive
# shell, so .bashrc's early-return-if-not-interactive guard means nvm never
# loads on its own — source it explicitly here to put node/npm/pm2 on PATH
# for this script and everything it shells out to (npm ci, pm2 reload, ...).
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_DIR/backend"

npx tsx scripts/blog-autopost.ts
