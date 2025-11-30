# Database Backup and Restore Guide

This guide covers database backup and restore procedures for CircuitSage.

## Overview

Regular database backups are critical for production deployments. This guide provides:
- Automated backup strategies
- Manual backup procedures
- Restore procedures
- Backup verification

## Backup Strategies

### Option 1: Render.com Managed Backups

If using Render.com managed PostgreSQL:

1. **Automatic Backups**: Available on paid plans
   - Daily backups retained for 7 days
   - Point-in-time recovery available
   - Configure in Render dashboard → Database → Backups

2. **Manual Backups**: 
   - Go to Database → Backups → "Create Backup"
   - Download backup file

### Option 2: Automated Script Backups

Use the provided backup script for external databases or additional backup layers.

### Option 3: Cloud Provider Backups

- **AWS RDS**: Automated backups enabled by default
- **Google Cloud SQL**: Automated backups configurable
- **Azure Database**: Automated backups available

## Backup Scripts

### Automated Backup Script

Create a backup script (`backend/scripts/backup-db.sh`):

```bash
#!/bin/bash
# Database backup script for CircuitSage
# Usage: ./backup-db.sh [backup-dir]

set -e

BACKUP_DIR=${1:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/circuit-sage-backup-$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set PGPASSWORD for psql
export PGPASSWORD="${DB_PASSWORD}"

echo "Starting database backup..."
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Backup file: ${BACKUP_FILE}"

# Perform backup
pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --file="${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "Backup completed: ${BACKUP_FILE}"
echo "Backup size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "circuit-sage-backup-*.sql.gz" -mtime +30 -delete

echo "Old backups cleaned (kept last 30 days)"
```

### Cron Job Setup

Set up automated daily backups:

```bash
# Add to crontab (crontab -e)
# Run daily at 2 AM
0 2 * * * /path/to/circuit-sage/backend/scripts/backup-db.sh /path/to/backups >> /var/log/circuit-sage-backup.log 2>&1
```

## Manual Backup Procedures

### Using pg_dump

```bash
# Set environment variables
export PGPASSWORD="your_password"

# Create backup
pg_dump \
  -h your-db-host \
  -p 5432 \
  -U your-username \
  -d circuit_sage_db \
  --clean \
  --if-exists \
  --create \
  --format=plain \
  --file=backup-$(date +%Y%m%d).sql

# Compress backup
gzip backup-$(date +%Y%m%d).sql
```

### Using Docker (if database is in Docker)

```bash
# Backup from Docker container
docker exec circuit-sage-db pg_dump \
  -U repair_admin \
  -d repair_business \
  --clean \
  --if-exists \
  --create \
  --format=plain > backup-$(date +%Y%m%d).sql
```

### Using Render.com

1. Go to Render dashboard
2. Select your database
3. Click "Backups" tab
4. Click "Create Backup"
5. Download backup file when ready

## Restore Procedures

### From SQL Backup File

```bash
# Set environment variables
export PGPASSWORD="your_password"

# Restore database
psql \
  -h your-db-host \
  -p 5432 \
  -U your-username \
  -d postgres \
  -f backup-20240101.sql
```

### From Compressed Backup

```bash
# Decompress and restore
gunzip < backup-20240101.sql.gz | psql \
  -h your-db-host \
  -p 5432 \
  -U your-username \
  -d postgres
```

### Using Docker

```bash
# Restore to Docker container
docker exec -i circuit-sage-db psql \
  -U repair_admin \
  -d repair_business < backup-20240101.sql
```

### From Render.com Backup

1. Go to Render dashboard
2. Select your database
3. Click "Backups" tab
4. Select backup to restore
5. Click "Restore" (creates new database) or download and restore manually

## Backup Verification

### Verify Backup File

```bash
# Check backup file exists and has content
ls -lh backup-*.sql.gz

# Verify backup file integrity
gunzip -t backup-20240101.sql.gz

# Check backup contains expected tables
gunzip < backup-20240101.sql.gz | grep -i "CREATE TABLE" | wc -l
```

### Test Restore

Before relying on backups, test restore procedure:

1. Create test database
2. Restore backup to test database
3. Verify data integrity
4. Run application migrations
5. Test application functionality

## Backup Best Practices

### Frequency

- **Production**: Daily backups minimum
- **Development**: Weekly backups sufficient
- **Before major changes**: Manual backup before deployment

### Retention

- **Daily backups**: Keep 30 days
- **Weekly backups**: Keep 12 weeks
- **Monthly backups**: Keep 12 months

### Storage

- Store backups in separate location from database
- Use cloud storage (S3, Google Cloud Storage, etc.)
- Encrypt backups containing sensitive data
- Test restore procedures regularly

### Automation

- Automate backup creation
- Automate backup verification
- Set up backup failure alerts
- Monitor backup storage usage

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

Target: Restore service within 4 hours of incident

### Recovery Point Objective (RPO)

Target: Maximum 24 hours of data loss

### Recovery Steps

1. **Assess Damage**: Determine scope of data loss
2. **Stop Services**: Prevent further data corruption
3. **Restore Database**: Restore from most recent backup
4. **Verify Data**: Check data integrity
5. **Restart Services**: Bring application back online
6. **Monitor**: Watch for issues post-restore

## Backup Script Implementation

Create the backup script file:

```bash
# Make script executable
chmod +x backend/scripts/backup-db.sh

# Test backup
./backend/scripts/backup-db.sh
```

## Monitoring Backups

### Check Backup Status

```bash
# List recent backups
ls -lht backups/ | head -10

# Check backup sizes
du -sh backups/*

# Verify backup age
find backups/ -name "*.sql.gz" -mtime -1
```

### Backup Alerts

Set up alerts for:
- Backup failures
- Backup age (if backups are too old)
- Backup storage limits
- Backup verification failures

## Troubleshooting

### Backup Fails

**Common issues:**
- Database connection errors
- Insufficient disk space
- Permission errors
- Database locks

**Solutions:**
- Verify database credentials
- Check disk space
- Ensure backup user has necessary permissions
- Run backup during low-traffic periods

### Restore Fails

**Common issues:**
- Backup file corruption
- Schema conflicts
- Missing dependencies
- Permission errors

**Solutions:**
- Verify backup file integrity
- Check backup file format
- Ensure database is empty or use --clean flag
- Verify user permissions

## Additional Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [Render.com Backup Guide](https://render.com/docs/databases#backups)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)



