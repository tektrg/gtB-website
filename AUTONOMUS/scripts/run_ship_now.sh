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

log "(3) Quality gates: npm run seo:verify + npm run check"
npm run -s seo:verify
npm run -s check

log "(4) Write/update report: $REPORT"
DETAILS_FILE="$(mktemp)"
node AUTONOMUS/tools/report-run-details.mjs \
  --site "https://gptbreeze.io" \
  --blog-skip-reason "skipped (ship-now run)" \
  --model-pricing-skip-reason "skipped (ship-now run)" \
  --provider-skip-reason "skipped (ship-now run)" \
  > "$DETAILS_FILE"

# Normalize legacy headers (keep only append-only run blocks if present)
if [[ -f "$REPORT" ]]; then
  if grep -q '^---$' "$REPORT"; then
    TMP_REPORT="$(mktemp)"
    echo "# AUTONOMUS Daily Report — ${DATE}" > "$TMP_REPORT"
    echo "" >> "$TMP_REPORT"
    awk 'BEGIN{p=0} /^---$/{p=1} p{print}' "$REPORT" >> "$TMP_REPORT"
    mv "$TMP_REPORT" "$REPORT"
  else
    cat > "$REPORT" <<MD
# AUTONOMUS Daily Report — ${DATE}
MD
  fi
else
  cat > "$REPORT" <<MD
# AUTONOMUS Daily Report — ${DATE}
MD
fi

cat >> "$REPORT" <<MD

---

## Run @ $(date '+%H:%M')
MD
cat "$DETAILS_FILE" >> "$REPORT"
cat >> "$REPORT" <<MD

**Checks:**
- seo:verify ✅
- check ✅

**Next:**
- Review Search Console queries: pick 1 new topic + 1 internal-link upgrade.
MD

rm -f "$DETAILS_FILE"

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
