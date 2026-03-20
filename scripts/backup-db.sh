#!/bin/bash
# Database backup script for Stanzom
# Add to cron: 0 2 * * * /opt/stanzom/scripts/backup-db.sh

set -e

BACKUP_DIR="/opt/stanzom/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/stanzom_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting database backup..."

# Dump and compress
docker exec stanzom-postgres pg_dump -U stanzom stanzom | gzip > "$BACKUP_FILE"

# Verify backup
if [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup created: $BACKUP_FILE ($SIZE)"
else
    echo "[$(date)] ERROR: Backup file is empty!" >&2
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Clean old backups
find "$BACKUP_DIR" -name "stanzom_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleaned backups older than $RETENTION_DAYS days"

echo "[$(date)] Backup complete."
