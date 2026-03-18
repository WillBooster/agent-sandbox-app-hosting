#!/usr/bin/env bash

set -euo pipefail

export PORT="${PORT:-8080}"
export WB_ENV="${WB_ENV:-production}"
ENV_FILE=".env.${WB_ENV}"
BUN_ENV_ARGS=(--no-env-file)

set -a
source ./.env
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi
set +a

echo "=== Entrypoint starting ==="
echo "WB_ENV: $WB_ENV"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

mkdir -p drizzle/mount

echo "=== Running drizzle-kit migrate ==="
if ! bun "${BUN_ENV_ARGS[@]}" run drizzle-kit migrate; then
    echo "Migration failed" >&2
    if [ "$WB_ENV" != "production" ]; then
        echo "=== Falling back to drizzle-kit push (non-production) ===" >&2
        bun "${BUN_ENV_ARGS[@]}" run drizzle-kit push || { echo "Drizzle push failed" >&2; exit 1; }
        echo "Drizzle push completed" >&2
    else
        exit 1
    fi
else
    if [ "$WB_ENV" != "production" ]; then
        echo "=== Running drizzle-kit migrate again (idempotency check) ==="
        bun "${BUN_ENV_ARGS[@]}" run drizzle-kit migrate || { echo "Migration failed on second run" >&2; exit 1; }
    fi
    echo "Migration completed"
fi

echo "=== Running seed script ==="
bun "${BUN_ENV_ARGS[@]}" src/db/seed.ts || { echo "Seeding failed"; exit 1; }
echo "Seeding completed"

echo "=== Starting Next.js server ==="
exec bun "${BUN_ENV_ARGS[@]}" run next start -p "$PORT"
