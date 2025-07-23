#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: ./restore.sh <backup_directory>"
    exit 1
fi

BACKUP_DIR=$1

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Restore code files
echo "Restoring code files..."
tar -xzf "$BACKUP_DIR/code_backup.tar.gz"

# Restore database schema
echo "Restoring database schema..."
psql "$DATABASE_URL" < "$BACKUP_DIR/schema.sql"

echo
echo "Restore completed!"
echo "Important: Don't forget to set up your environment variables according to env.template"
