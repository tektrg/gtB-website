#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==== [$(date '+%Y-%m-%d %H:%M:%S %Z')] models sync start ===="
set +e
bash "$ROOT_DIR/scripts/sync-models-api.sh"
status=$?
set -e
echo "==== [$(date '+%Y-%m-%d %H:%M:%S %Z')] models sync end (status: ${status}) ===="

exit "$status"
