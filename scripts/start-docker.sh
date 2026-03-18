#!/usr/bin/env bash

set -e

source "$(dirname "$0")/docker-common.sh"

# Source test environment variables from .env files.
set -a
source ./.env
source ./.env.test
set +a

CONTAINER_NAME="agent-sandbox-app-hosting-dev"
IMAGE_NAME="agent-sandbox-app-hosting:dev"

# Check if container is already running
if docker_container_running; then
  echo "Container $CONTAINER_NAME is already running."
  docker_open_url
  echo "To stop: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
  exit 0
fi

docker_cleanup
trap docker_cleanup EXIT INT TERM

docker_build_image
docker_start_container
docker_wait_for_health 60 true

echo "Container is healthy!"
docker_open_url

echo ""
echo "Container is running. To stop: docker stop $CONTAINER_NAME && docker rm -f $CONTAINER_NAME"
echo "To view logs: docker logs -f $CONTAINER_NAME"
