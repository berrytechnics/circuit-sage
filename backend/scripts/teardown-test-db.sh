#!/bin/bash
# Teardown script for test database
# Stops and removes the test database container

set -e

CONTAINER_NAME="circuit-sage-test-db"

echo "Tearing down test database..."

# Check if Docker is available (don't fail if it's not)
if ! command -v docker &> /dev/null || ! docker ps &> /dev/null; then
  echo "Docker is not available, skipping teardown"
  echo "Test database teardown complete!"
  exit 0
fi

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Stopping and removing test database container..."
  docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1 || true
  echo "Test database container removed"
else
  echo "Test database container not found (may already be removed)"
fi

echo "Test database teardown complete!"

