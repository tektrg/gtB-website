#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TARGET_FILE="src/data/models-api.json"
SOURCE_URL="https://models.dev/api.json"
TARGET_BRANCH="main"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]]; then
  echo "Switching branch: ${CURRENT_BRANCH} -> ${TARGET_BRANCH}"
  git checkout "$TARGET_BRANCH"
fi
git pull --rebase --autostash origin "$TARGET_BRANCH"

echo "Fetching ${SOURCE_URL} -> ${TARGET_FILE}"
curl -fsSL "$SOURCE_URL" -o "$TARGET_FILE"

if git diff --quiet -- "$TARGET_FILE"; then
  echo "No models-api.json changes; skipping commit/push"
  exit 0
fi

git add "$TARGET_FILE"
git commit -m "chore(models): sync models.dev data ($(date +%F))"
git push origin "$TARGET_BRANCH"

echo "Committed and pushed ${TARGET_FILE} to ${TARGET_BRANCH}"
