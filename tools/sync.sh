#!/usr/bin/env bash
# Single-command sync for the Writing Quest portal.
# Usage: ./tools/sync.sh                  (auto-generated message)
#        ./tools/sync.sh "Day 3 review"   (custom message)
#
# What it does:
#   1. Stages all tracked changes (photos + reviews.json + anything else)
#   2. Commits with a sensible message ("Day N verified review" from src/data/reviews.json)
#   3. Pushes to origin/main
#   4. Cloudflare Pages runs `npm run build` and redeploys in ~30s

set -e

cd "$(dirname "$0")/.."

# Cowork sandbox sometimes leaves stale lock files in .git/ — clear them first
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

# Default message: pull the latest verified day from reviews.json
if [ -z "$1" ]; then
  LATEST_DAY=$(grep -oE '"day":[[:space:]]*[0-9]+' src/data/reviews.json | grep -oE '[0-9]+' | sort -n | tail -1)
  MSG="Day ${LATEST_DAY:-?} verified review"
else
  MSG="$1"
fi

# Bail early if nothing changed
if git diff --quiet && git diff --cached --quiet; then
  echo "Nothing to commit. Working tree clean."
  exit 0
fi

echo "→ Staging changes…"
git add -A

echo "→ Committing: $MSG"
git commit -m "$MSG"

echo "→ Pushing to origin/main…"
git push origin main

echo ""
echo "Done. Cloudflare Pages will redeploy in ~30s."
