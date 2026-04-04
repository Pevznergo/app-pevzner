#!/bin/bash
# db-backup.sh — SQLite backup script for Pevzner Foundation app
# Usage:
#   ./db-backup.sh               — creates timestamped backup in ./backups/
#   ./db-backup.sh dump          — also prints SQL dump to stdout
#   ./db-backup.sh view          — opens Prisma Studio in browser
#
# Cron example (daily at 3:00 AM, keep last 30 days):
#   0 3 * * * cd /path/to/app && ./db-backup.sh >> /var/log/db-backup.log 2>&1

set -e

DB_PATH="./prisma/dev.db"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dev-$TIMESTAMP.db"
DUMP_FILE="$BACKUP_DIR/dev-$TIMESTAMP.sql"

# ── View mode ──────────────────────────────────────────────────────────────────
if [ "${1}" = "view" ]; then
  echo "Opening Prisma Studio at http://localhost:5555 ..."
  npx prisma studio
  exit 0
fi

# ── Backup ─────────────────────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "ERROR: Database not found at $DB_PATH"
  exit 1
fi

# Binary backup (fast, exact copy)
cp "$DB_PATH" "$BACKUP_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Binary backup: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# SQL dump (human-readable, portable)
if command -v sqlite3 &>/dev/null; then
  sqlite3 "$DB_PATH" .dump > "$DUMP_FILE"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] SQL dump:    $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] sqlite3 not found — skipping SQL dump (binary backup is complete)"
fi

# ── Print SQL dump to stdout if requested ──────────────────────────────────────
if [ "${1}" = "dump" ] && command -v sqlite3 &>/dev/null; then
  echo ""
  echo "=== SQL DUMP ==="
  cat "$DUMP_FILE"
fi

# ── Rotate: keep last 30 backups ───────────────────────────────────────────────
KEEP=30
TOTAL=$(find "$BACKUP_DIR" -name "dev-*.db" | wc -l | tr -d ' ')
if [ "$TOTAL" -gt "$KEEP" ]; then
  # Delete oldest (by modification time)
  DELETED=$(find "$BACKUP_DIR" -name "dev-*.db" -printf '%T@ %p\n' 2>/dev/null | \
    sort -n | head -n $(( TOTAL - KEEP )) | awk '{print $2}')
  for f in $DELETED; do
    rm -f "$f" "${f%.db}.sql" 2>/dev/null || true
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rotated old backup: $f"
  done
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done. Backups kept: $(find "$BACKUP_DIR" -name "dev-*.db" | wc -l | tr -d ' ')/$KEEP"
