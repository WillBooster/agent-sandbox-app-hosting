#!/usr/bin/env bash

set -e

# Load env vars from mise.{MISE_ENV}.toml
eval "$(mise env -s bash)"

# Always use port 8080 in Docker
export PORT=8080

echo "=== Entrypoint starting ==="
echo "MISE_ENV: $MISE_ENV"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

mkdir -p drizzle/mount

echo "=== Running drizzle-kit migrate ==="
if ! bun run drizzle-kit migrate; then
    echo "Migration failed" >&2
    if [ "$MISE_ENV" != "production" ]; then
        echo "=== Falling back to drizzle-kit push (non-production) ===" >&2
        bun run drizzle-kit push || { echo "Drizzle push failed" >&2; exit 1; }
        echo "Drizzle push completed" >&2
    else
        exit 1
    fi
else
    if [ "$MISE_ENV" != "production" ]; then
        echo "=== Running drizzle-kit migrate again (idempotency check) ==="
        bun run drizzle-kit migrate || { echo "Migration failed on second run" >&2; exit 1; }
    fi
    echo "Migration completed"
fi

echo "=== Running seed script ==="
bun src/db/seed.ts || { echo "Seeding failed"; exit 1; }
echo "Seeding completed"

echo "=== Starting Next.js server ==="
exec bun run next start -p "$PORT"
