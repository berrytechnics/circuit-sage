#!/bin/bash
# Setup script for test database
# Spins up a temporary PostgreSQL container matching GitHub Actions configuration

set -e

CONTAINER_NAME="circuit-sage-test-db"
DB_PORT="5433"
DB_USER="test_user"
DB_PASSWORD="test_password"
DB_NAME="test_db"

echo "Setting up test database..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  echo "ERROR: Docker is not installed or not in PATH"
  echo "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
  exit 1
fi

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
  echo "ERROR: Docker daemon is not running"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

# Check if container already exists and remove it
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Removing existing test database container..."
  docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1 || true
fi

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -e POSTGRES_USER="${DB_USER}" \
  -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
  -e POSTGRES_DB="${DB_NAME}" \
  -p "${DB_PORT}:5432" \
  postgres:15 \
  > /dev/null

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if docker exec "${CONTAINER_NAME}" pg_isready -U "${DB_USER}" -d "${DB_NAME}" > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo "Waiting for PostgreSQL... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "ERROR: PostgreSQL failed to become ready after $MAX_ATTEMPTS attempts"
  docker logs "${CONTAINER_NAME}"
  exit 1
fi

echo "Test database setup complete!"
echo "Container: ${CONTAINER_NAME}"
echo "Port: ${DB_PORT}"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"

