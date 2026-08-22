#!/usr/bin/env sh
set -eu

ROOT="/opt/nrc-second-brain"
"$ROOT/scripts/backup.sh"
cd "$ROOT"
docker compose -f docker-compose.yml -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.yml -f docker-compose.ghcr.yml up -d
echo "NRC Second Brain updated. Your previous backup is in /DATA/AppData/nrc-second-brain/backups."
