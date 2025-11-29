#!/bin/bash
# Orchestrate complete backend test flow with database setup and teardown
# Matches GitHub Actions workflow exactly

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Cleanup function to ensure teardown happens even on failure
cleanup() {
  EXIT_CODE=$?
  echo ""
  echo "Cleaning up test database..."
  "${SCRIPT_DIR}/teardown-test-db.sh" || true
  if [ $EXIT_CODE -ne 0 ]; then
    echo "Tests failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
  fi
}

# Set trap to ensure cleanup happens
trap cleanup EXIT

echo "========================================="
echo "Running Backend Tests with Database Setup"
echo "========================================="
echo ""

# Step 1: Setup test database
echo "Step 1: Setting up test database..."
"${SCRIPT_DIR}/setup-test-db.sh"

# Step 2: Run migrations
echo ""
echo "Step 2: Running database migrations..."
"${SCRIPT_DIR}/run-test-migrations.sh"

# Step 3: Run tests
echo ""
echo "Step 3: Running tests..."
cd "${BACKEND_DIR}"
yarn test

echo ""
echo "========================================="
echo "All tests passed!"
echo "========================================="

