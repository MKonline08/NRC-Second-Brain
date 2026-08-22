#!/bin/sh
set -eu

DATA_DIR="/app/data"
PGDATA="$DATA_DIR/postgres"
SECRETS_FILE="$DATA_DIR/.nrc-secrets"

mkdir -p "$PGDATA" "$DATA_DIR/uploads" "$DATA_DIR/config"
mkdir -p /run/postgresql
chown postgres:postgres /run/postgresql
chmod 775 /run/postgresql

if [ ! -f "$SECRETS_FILE" ]; then
  umask 077
  cat > "$SECRETS_FILE" <<EOF
SESSION_SECRET=$(openssl rand -hex 48)
CREDENTIALS_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
NRC_POSTGRES_PASSWORD=$(openssl rand -hex 32)
EOF
fi

set -a
. "$SECRETS_FILE"
set +a

export DATABASE_URL="postgresql://nrc:${NRC_POSTGRES_PASSWORD}@127.0.0.1:5432/nrc_second_brain"
export UPLOAD_DIR="${UPLOAD_DIR:-$DATA_DIR/uploads}"
export LIBRARY_DIR="${LIBRARY_DIR:-/library}"

chown -R postgres:postgres "$PGDATA"
chown -R nextjs:nodejs "$DATA_DIR/uploads" "$DATA_DIR/config"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su-exec postgres initdb -D "$PGDATA" --auth-host=scram-sha-256 --auth-local=trust >/dev/null
fi

if ! su-exec postgres pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
  # A stopped container can leave this harmless lock file behind after an unclean shutdown.
  rm -f "$PGDATA/postmaster.pid"
  POSTGRES_LOG="$DATA_DIR/postgres-startup.log"
  : > "$POSTGRES_LOG"
  chown postgres:postgres "$POSTGRES_LOG"
  if ! su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=127.0.0.1" -l "$POSTGRES_LOG" -w start; then
    cat "$POSTGRES_LOG" >&2
    exit 1
  fi
fi

if ! su-exec postgres psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='nrc'" | grep -q 1; then
  su-exec postgres psql -v ON_ERROR_STOP=1 -U postgres -d postgres -c "CREATE ROLE nrc LOGIN PASSWORD '${NRC_POSTGRES_PASSWORD}'" >/dev/null
fi

if ! su-exec postgres psql -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='nrc_second_brain'" | grep -q 1; then
  su-exec postgres createdb -U postgres -O nrc nrc_second_brain
fi

su-exec nextjs /app/node_modules/.bin/prisma migrate deploy >/dev/null
exec su-exec nextjs node server.js

