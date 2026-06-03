#!/usr/bin/env bash

set -e

source "$(dirname "$0")/docker-common.sh"

# Source test environment variables from .env files.
set -a
source ./.env
source ./.env.test
set +a

CONTAINER_NAME="agent-sandbox-app-hosting-test"
IMAGE_NAME="agent-sandbox-app-hosting:test"
NEXT_PUBLIC_BASE_URL="http://localhost:$PORT"
export NEXT_PUBLIC_BASE_URL

docker_cleanup
trap docker_cleanup EXIT INT TERM

docker_build_image
docker_start_container
docker_wait_for_health 60 false

echo "Container is healthy!"
echo "Container startup logs:"
docker logs "$CONTAINER_NAME"
echo "---"
echo "Running tests..."

# Ensure local dependencies are present for Playwright on the host machine.
if [ ! -d node_modules ]; then
  log "Installing dependencies for Playwright..."
  bun install --frozen-lockfile
fi

# Run tests and capture exit code
# Set CI=true to make Playwright reuse the existing Docker container server
echo "DEBUG: PORT=$PORT NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL" >&2
set +e
export CI=true
bun run playwright test "$@"
TEST_EXIT_CODE=$?
set -e

echo "---"
echo "Container logs after tests:"
docker logs "$CONTAINER_NAME"
echo "---"

if [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "Tests failed with exit code $TEST_EXIT_CODE"
  exit $TEST_EXIT_CODE
fi

echo "Tests completed successfully!"
