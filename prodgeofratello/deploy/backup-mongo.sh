#!/bin/bash
# MongoDB scheduled backup script
# Add to crontab: 0 3 * * * /path/to/geo-platform/deploy/backup-mongo.sh

BACKUP_DIR="/var/backups/geo-platform"
DB_NAME="geo-platform"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Starting MongoDB backup: $DATE"

mongodump --db "$DB_NAME" --out "$BACKUP_DIR/$DATE" --quiet

if [ $? -eq 0 ]; then
  tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
  rm -rf "$BACKUP_DIR/$DATE"
  echo "[BACKUP] Done: $BACKUP_DIR/$DATE.tar.gz"
else
  echo "[BACKUP] Failed!"
  exit 1
fi

# Delete old backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$KEEP_DAYS -delete
echo "[BACKUP] Cleaned backups older than $KEEP_DAYS days"
