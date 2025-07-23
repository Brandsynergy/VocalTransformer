#!/bin/bash

# Create backup directory with timestamp
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup code files
echo "Backing up code files..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='uploads' \
    -czf "$BACKUP_DIR/code_backup.tar.gz" \
    ./client ./server ./db *.json *.ts *.js

# Backup database tables and data
echo "Backing up database..."
if [ -n "$DATABASE_URL" ]; then
    # Export tables
    psql "$DATABASE_URL" -c "\dt" > "$BACKUP_DIR/tables.txt"
    # Export schema and data
    pg_dumpall -c -U "$PGUSER" -h "$PGHOST" -p "$PGPORT" > "$BACKUP_DIR/full_backup.sql" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "Warning: Full backup failed, creating schema-only backup..."
        # Fallback to schema-only backup
        psql "$DATABASE_URL" -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'" > "$BACKUP_DIR/schema.txt"
    fi
else
    echo "Warning: DATABASE_URL not set, skipping database backup"
fi

# Create environment variables template (without sensitive values)
echo "Creating environment variables template..."
cat > "$BACKUP_DIR/env.template" << EOL
# Database Configuration
DATABASE_URL=your_database_url_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Other environment variables needed for the application
# Add new variables as needed
EOL

echo "Backup completed! Files are stored in: $BACKUP_DIR"
echo
echo "To restore:"
echo "1. Extract code: tar -xzf code_backup.tar.gz"
echo "2. If available, restore database: psql \$DATABASE_URL < full_backup.sql"
echo "3. Set up environment variables according to env.template"
echo
echo "Note: Your database schema structure is preserved in schema.txt"