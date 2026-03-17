#!/usr/bin/env bash

set -euo pipefail

export PORT="${PORT:-8080}"
export WB_ENV="${WB_ENV:-production}"

echo "=== Entrypoint starting ==="
echo "WB_ENV: $WB_ENV"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

mkdir -p drizzle/mount

echo "=== Running drizzle-kit migrate ==="
if ! bunx dotenv -c "$WB_ENV" -- bun run drizzle-kit migrate; then
    echo "Migration failed" >&2
    if [ "$WB_ENV" != "production" ]; then
        echo "=== Falling back to drizzle-kit push (non-production) ===" >&2
        bunx dotenv -c "$WB_ENV" -- bun run drizzle-kit push || { echo "Drizzle push failed" >&2; exit 1; }
        echo "Drizzle push completed" >&2
    else
        exit 1
    fi
else
    if [ "$WB_ENV" != "production" ]; then
        echo "=== Running drizzle-kit migrate again (idempotency check) ==="
        bunx dotenv -c "$WB_ENV" -- bun run drizzle-kit migrate || { echo "Migration failed on second run" >&2; exit 1; }
    fi
    echo "Migration completed"
fi

echo "=== Running seed script ==="
bunx dotenv -c "$WB_ENV" -- bun src/db/seed.ts || { echo "Seeding failed"; exit 1; }
echo "Seeding completed"

echo "=== Starting Next.js server ==="
exec bunx dotenv -c "$WB_ENV" -- bun run next start -p "$PORT"
