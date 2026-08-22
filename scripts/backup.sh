#!/usr/bin/env sh
set -eu

ROOT="/DATA/AppData/nrc-second-brain"
STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
TARGET="$ROOT/backups/$STAMP"
mkdir -p "$TARGET"

docker exec nrc-second-brain-db pg_dump -U nrc -d nrc_second_brain > "$TARGET/database.sql"
tar -czf "$TARGET/uploads.tar.gz" -C "$ROOT" uploads
tar -czf "$TARGET/config.tar.gz" -C "$ROOT" config
find "$ROOT/backups" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;
echo "Backup finished: $TARGET"
