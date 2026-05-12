#!/usr/bin/env bash
# Single-command sync for the Writing Quest tracker.
# Usage: ./tools/sync.sh                  (auto-generated message)
#        ./tools/sync.sh "Day 3 review"   (custom message)
#
# What it does:
#   1. Stages all tracked changes (private photos in worksheets/completed/ are .gitignored)
#   2. Commits with a sensible message
#   3. Pushes to origin/main
#   4. Cloudflare Pages auto-deploys in ~30s

set -e

cd "$(dirname "$0")/.."

# Cowork sandbox sometimes leaves stale lock files in .git/ — clear them first
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true

# Default message: pull the latest verified day from index.html
if [ -z "$1" ]; then
  LATEST_DAY=$(grep -oE '"day":\s*[0-9]+' index.html | grep -oE '[0-9]+' | sort -n | tail -1)
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
