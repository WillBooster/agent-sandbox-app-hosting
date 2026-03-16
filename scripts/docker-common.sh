#!/usr/bin/env bash

docker_container_running() {
  docker ps -q -f name="$CONTAINER_NAME" | grep -q .
}

docker_build_image() {
  log "Building Docker image..."
  docker build -t "$IMAGE_NAME" \
    --build-arg MISE_ENV="${MISE_ENV}" \
    .
}

docker_start_container() {
  log "Starting container..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:8080" \
    "$IMAGE_NAME"
}

docker_wait_for_health() {
  local max_retries="$1"
  local cleanup_on_fail="${2:-false}"
  local retry_count=0

  docker logs -f "$CONTAINER_NAME" &
  local logs_pid=$!
  trap 'kill "$logs_pid" 2>/dev/null || true' RETURN

  log "Waiting for container to be healthy..."
  until curl -sf "http://localhost:$PORT/api/ping" > /dev/null 2>&1; do
    retry_count=$((retry_count + 1))
    if [ "$retry_count" -ge "$max_retries" ]; then
      log "Container failed to become healthy after $max_retries seconds"
      if [ "$cleanup_on_fail" = "true" ]; then
        docker_cleanup
      fi
      return 1
    fi
    log "Waiting for container... ($retry_count/$max_retries)"
    sleep 1
  done
}

docker_open_url() {
  log "Opening http://localhost:$PORT ..."
  open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null || \
    log "Please open http://localhost:$PORT in your browser"
}

docker_cleanup() {
  log "Cleaning up..."
  docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
}

log() {
  echo "$@" >&2
}
