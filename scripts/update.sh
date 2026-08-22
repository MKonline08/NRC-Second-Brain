#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
"$ROOT/scripts/backup.sh"
cd "$ROOT"
git pull --ff-only
docker compose -f docker-compose.yml up -d --build
echo "NRC Second Brain updated. Your previous backup is in /DATA/AppData/nrc-second-brain/backups."
