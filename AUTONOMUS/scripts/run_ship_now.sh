#!/usr/bin/env bash
set -euo pipefail

# Run the autonomous nightly ship steps on-demand.
# Usage:
#   ./AUTONOMUS/scripts/run_ship_now.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BRANCH="auton/seo-ops"
DATE="$(date +%F)"
REPORT="AUTONOMUS/reports/${DATE}.md"

log() { printf "[%s] %s\n" "$(date '+%H:%M:%S')" "$*"; }

log "Repo: $ROOT_DIR"
log "Checkout $BRANCH"

git rev-parse --is-inside-work-tree >/dev/null 2>&1

git checkout "$BRANCH" >/dev/null 2>&1 || git checkout -b "$BRANCH"
git pull --rebase --autostash >/dev/null 2>&1 || true

mkdir -p AUTONOMUS/reports AUTONOMUS/logs

log "(1) Run verifiers"
node AUTONOMUS/scripts/verify_site_basics.mjs
node AUTONOMUS/scripts/check_acronyms.mjs || true
node AUTONOMUS/scripts/check_internal_links.mjs

log "(2) Auto-fix internal links if needed"
# Only run generator; it will no-op if nothing to change
node AUTONOMUS/scripts/add_continue_reading.mjs || true

log "(3) Quality gate: npm run check"
npm run -s check

log "(4) Write/update report: $REPORT"
if [[ ! -f "$REPORT" ]]; then
  cat > "$REPORT" <<MD
# AUTONOMUS Daily Report — ${DATE}

## Shipped
- (fill)

## Evidence / Verification
- 

## Next
- 
MD
fi

# Append a run footer (idempotent-ish: adds timestamped entry)
cat >> "$REPORT" <<MD

---

## Ship-now run @ $(date '+%H:%M')
- Ran: verify_site_basics, check_internal_links, npm run check
- Internal link autofix: add_continue_reading (may be no-op)
MD

log "(5) Commit + push if changes exist"
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "AUTONOMUS ship-now: ${DATE}" || true
  git push -u origin "$BRANCH"
  log "Pushed changes."
else
  log "No changes to commit."
fi

log "Done."
