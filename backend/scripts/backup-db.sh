#!/bin/bash
# Database backup script for RepairForge
# Usage: ./backup-db.sh [backup-dir]

set -e

BACKUP_DIR=${1:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/repair-forge-backup-$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if required environment variables are set
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
  echo "Error: Database connection variables are not set"
  echo "Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
  exit 1
fi

# Set PGPASSWORD for psql
export PGPASSWORD="${DB_PASSWORD}"

echo "Starting database backup..."
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT:-5432}"
echo "Backup file: ${BACKUP_FILE}"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
  echo "Error: pg_dump is not installed"
  echo "Install PostgreSQL client tools to use this script"
  exit 1
fi

# Perform backup
pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --file="${BACKUP_FILE}"

# Check if backup was successful
if [ ! -f "${BACKUP_FILE}" ] || [ ! -s "${BACKUP_FILE}" ]; then
  echo "Error: Backup file was not created or is empty"
  exit 1
fi

# Compress backup
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "Backup completed: ${BACKUP_FILE}"
echo "Backup size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Keep only last 30 days of backups
if [ -d "$BACKUP_DIR" ]; then
  find "$BACKUP_DIR" -name "repair-forge-backup-*.sql.gz" -mtime +30 -delete
  echo "Old backups cleaned (kept last 30 days)"
fi

echo "Backup process completed successfully"



