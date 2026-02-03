#!/bin/bash

# =====================================================
# AUTOMATED DATABASE BACKUP SCRIPT FOR OBE SYSTEM
# File: database_backup.sh
# Description: Comprehensive backup solution with rotation
# =====================================================

# =====================================================
# CONFIGURATION
# =====================================================

# Database credentials
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="obe_system"
DB_USER="root"
DB_PASSWORD="StrongPasswordHere"

# Backup directories
BACKUP_ROOT="/var/backups/mysql/obe_system"
BACKUP_DAILY="$BACKUP_ROOT/daily"
BACKUP_WEEKLY="$BACKUP_ROOT/weekly"
BACKUP_MONTHLY="$BACKUP_ROOT/monthly"
BACKUP_LOG="$BACKUP_ROOT/logs"
BACKUP_TEMP="$BACKUP_ROOT/temp"

# Retention periods (in days)
DAILY_RETENTION=7
WEEKLY_RETENTION=30
MONTHLY_RETENTION=365

# Backup settings
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DAY=$(date +%A)
BACKUP_DAY_NUM=$(date +%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Compression
COMPRESSION="gzip"  # Options: gzip, bzip2, xz
COMPRESSION_EXT=".gz"

# Notification settings
ENABLE_EMAIL_NOTIFICATION=true
ADMIN_EMAIL="admin@example.com"
SMTP_SERVER="localhost"

# =====================================================
# CREATE BACKUP DIRECTORIES
# =====================================================

create_backup_dirs() {
    echo "Creating backup directories..."
    mkdir -p "$BACKUP_DAILY"
    mkdir -p "$BACKUP_WEEKLY"
    mkdir -p "$BACKUP_MONTHLY"
    mkdir -p "$BACKUP_LOG"
    mkdir -p "$BACKUP_TEMP"
    
    # Set proper permissions
    chmod 700 "$BACKUP_ROOT"
    chmod 700 "$BACKUP_DAILY"
    chmod 700 "$BACKUP_WEEKLY"
    chmod 700 "$BACKUP_MONTHLY"
    chmod 755 "$BACKUP_LOG"
}

# =====================================================
# LOGGING FUNCTIONS
# =====================================================

LOG_FILE="$BACKUP_LOG/backup_$TIMESTAMP.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

log_success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" | tee -a "$LOG_FILE"
}

# =====================================================
# BACKUP FUNCTIONS
# =====================================================

# Full database backup
full_backup() {
    local backup_type=$1
    local backup_dir=$2
    local backup_file="$backup_dir/obe_system_full_${BACKUP_DATE}.sql${COMPRESSION_EXT}"
    
    log_message "Starting full database backup ($backup_type)..."
    
    # Perform backup with mysqldump
    if mysqldump --host="$DB_HOST" \
                 --port="$DB_PORT" \
                 --user="$DB_USER" \
                 --password="$DB_PASSWORD" \
                 --single-transaction \
                 --routines \
                 --triggers \
                 --events \
                 --add-drop-database \
                 --databases "$DB_NAME" \
                 --result-file="$BACKUP_TEMP/backup.sql" 2>> "$LOG_FILE"; then
        
        # Compress the backup
        case $COMPRESSION in
            gzip)
                gzip -9 "$BACKUP_TEMP/backup.sql"
                mv "$BACKUP_TEMP/backup.sql.gz" "$backup_file"
                ;;
            bzip2)
                bzip2 -9 "$BACKUP_TEMP/backup.sql"
                mv "$BACKUP_TEMP/backup.sql.bz2" "$backup_file"
                ;;
            xz)
                xz -9 "$BACKUP_TEMP/backup.sql"
                mv "$BACKUP_TEMP/backup.sql.xz" "$backup_file"
                ;;
        esac
        
        # Verify backup file
        if [ -f "$backup_file" ]; then
            local file_size=$(du -h "$backup_file" | cut -f1)
            log_success "Backup completed: $backup_file (Size: $file_size)"
            
            # Create checksum
            md5sum "$backup_file" > "$backup_file.md5"
            
            return 0
        else
            log_error "Backup file not created"
            return 1
        fi
    else
        log_error "mysqldump failed"
        return 1
    fi
}

# Schema-only backup
schema_backup() {
    local backup_file="$BACKUP_DAILY/obe_system_schema_${BACKUP_DATE}.sql${COMPRESSION_EXT}"
    
    log_message "Starting schema backup..."
    
    if mysqldump --host="$DB_HOST" \
                 --port="$DB_PORT" \
                 --user="$DB_USER" \
                 --password="$DB_PASSWORD" \
                 --no-data \
                 --routines \
                 --triggers \
                 --events \
                 --databases "$DB_NAME" | gzip > "$backup_file" 2>> "$LOG_FILE"; then
        
        log_success "Schema backup completed: $backup_file"
        return 0
    else
        log_error "Schema backup failed"
        return 1
    fi
}

# Per-table backup (for large tables)
per_table_backup() {
    local backup_dir="$BACKUP_DAILY/tables_${BACKUP_DATE}"
    mkdir -p "$backup_dir"
    
    log_message "Starting per-table backup..."
    
    # Get list of tables
    local tables=$(mysql --host="$DB_HOST" \
                          --port="$DB_PORT" \
                          --user="$DB_USER" \
                          --password="$DB_PASSWORD" \
                          --batch \
                          --skip-column-names \
                          -e "SHOW TABLES FROM $DB_NAME" 2>> "$LOG_FILE")
    
    local failed_tables=0
    
    for table in $tables; do
        log_message "Backing up table: $table"
        
        if mysqldump --host="$DB_HOST" \
                     --port="$DB_PORT" \
                     --user="$DB_USER" \
                     --password="$DB_PASSWORD" \
                     --single-transaction \
                     "$DB_NAME" "$table" | gzip > "$backup_dir/${table}.sql.gz" 2>> "$LOG_FILE"; then
            log_message "  ✓ $table backed up successfully"
        else
            log_error "  ✗ Failed to backup $table"
            ((failed_tables++))
        fi
    done
    
    if [ $failed_tables -eq 0 ]; then
        log_success "All tables backed up successfully"
        return 0
    else
        log_error "$failed_tables table(s) failed to backup"
        return 1
    fi
}

# Incremental backup (binary logs)
incremental_backup() {
    local backup_dir="$BACKUP_DAILY/binlogs_${BACKUP_DATE}"
    mkdir -p "$backup_dir"
    
    log_message "Starting incremental backup (binary logs)..."
    
    # Flush logs to create new binary log
    mysql --host="$DB_HOST" \
          --port="$DB_PORT" \
          --user="$DB_USER" \
          --password="$DB_PASSWORD" \
          -e "FLUSH LOGS" 2>> "$LOG_FILE"
    
    # Get binary log directory
    local binlog_dir=$(mysql --host="$DB_HOST" \
                             --port="$DB_PORT" \
                             --user="$DB_USER" \
                             --password="$DB_PASSWORD" \
                             --batch \
                             --skip-column-names \
                             -e "SHOW VARIABLES LIKE 'log_bin_basename'" | cut -f2 | xargs dirname)
    
    # Copy binary logs
    if [ -d "$binlog_dir" ]; then
        cp "$binlog_dir"/mysql-bin.* "$backup_dir/" 2>> "$LOG_FILE"
        log_success "Binary logs backed up to $backup_dir"
    else
        log_error "Binary log directory not found"
        return 1
    fi
}

# =====================================================
# BACKUP ROTATION & CLEANUP
# =====================================================

cleanup_old_backups() {
    log_message "Starting backup cleanup..."
    
    # Daily backups cleanup
    log_message "Cleaning up daily backups older than $DAILY_RETENTION days..."
    find "$BACKUP_DAILY" -name "*.sql.gz" -mtime +$DAILY_RETENTION -type f -delete 2>> "$LOG_FILE"
    find "$BACKUP_DAILY" -name "*.md5" -mtime +$DAILY_RETENTION -type f -delete 2>> "$LOG_FILE"
    
    # Weekly backups cleanup
    log_message "Cleaning up weekly backups older than $WEEKLY_RETENTION days..."
    find "$BACKUP_WEEKLY" -name "*.sql.gz" -mtime +$WEEKLY_RETENTION -type f -delete 2>> "$LOG_FILE"
    find "$BACKUP_WEEKLY" -name "*.md5" -mtime +$WEEKLY_RETENTION -type f -delete 2>> "$LOG_FILE"
    
    # Monthly backups cleanup
    log_message "Cleaning up monthly backups older than $MONTHLY_RETENTION days..."
    find "$BACKUP_MONTHLY" -name "*.sql.gz" -mtime +$MONTHLY_RETENTION -type f -delete 2>> "$LOG_FILE"
    find "$BACKUP_MONTHLY" -name "*.md5" -mtime +$MONTHLY_RETENTION -type f -delete 2>> "$LOG_FILE"
    
    # Cleanup old logs
    log_message "Cleaning up old log files..."
    find "$BACKUP_LOG" -name "*.log" -mtime +30 -type f -delete 2>> "$LOG_FILE"
    
    # Cleanup temp directory
    rm -rf "$BACKUP_TEMP"/*
    
    log_success "Cleanup completed"
}

# =====================================================
# BACKUP VERIFICATION
# =====================================================

verify_backup() {
    local backup_file=$1
    
    log_message "Verifying backup: $backup_file"
    
    # Check if file exists and is not empty
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found"
        return 1
    fi
    
    if [ ! -s "$backup_file" ]; then
        log_error "Backup file is empty"
        return 1
    fi
    
    # Verify checksum if exists
    if [ -f "$backup_file.md5" ]; then
        if md5sum -c "$backup_file.md5" >> "$LOG_FILE" 2>&1; then
            log_success "Checksum verification passed"
        else
            log_error "Checksum verification failed"
            return 1
        fi
    fi
    
    # Test decompression
    case $COMPRESSION in
        gzip)
            if gzip -t "$backup_file" 2>> "$LOG_FILE"; then
                log_success "Backup file integrity verified"
                return 0
            fi
            ;;
        bzip2)
            if bzip2 -t "$backup_file" 2>> "$LOG_FILE"; then
                log_success "Backup file integrity verified"
                return 0
            fi
            ;;
        xz)
            if xz -t "$backup_file" 2>> "$LOG_FILE"; then
                log_success "Backup file integrity verified"
                return 0
            fi
            ;;
    esac
    
    log_error "Backup file integrity check failed"
    return 1
}

# =====================================================
# BACKUP REPORTING
# =====================================================

generate_backup_report() {
    local status=$1
    local backup_type=$2
    local backup_file=$3
    
    local report_file="$BACKUP_LOG/backup_report_${TIMESTAMP}.txt"
    
    {
        echo "=================================================="
        echo "OBE SYSTEM DATABASE BACKUP REPORT"
        echo "=================================================="
        echo ""
        echo "Backup Type: $backup_type"
        echo "Date/Time: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Status: $status"
        echo ""
        echo "Database Details:"
        echo "  Host: $DB_HOST"
        echo "  Port: $DB_PORT"
        echo "  Database: $DB_NAME"
        echo ""
        
        if [ "$status" == "SUCCESS" ]; then
            echo "Backup File: $backup_file"
            echo "File Size: $(du -h "$backup_file" 2>/dev/null | cut -f1)"
            echo "Checksum: $(cat "$backup_file.md5" 2>/dev/null | cut -d' ' -f1)"
            echo ""
            
            # Disk usage
            echo "Backup Directory Usage:"
            df -h "$BACKUP_ROOT" | tail -1
            echo ""
            
            # Backup counts
            echo "Backup Statistics:"
            echo "  Daily backups: $(ls -1 "$BACKUP_DAILY"/*.sql.gz 2>/dev/null | wc -l)"
            echo "  Weekly backups: $(ls -1 "$BACKUP_WEEKLY"/*.sql.gz 2>/dev/null | wc -l)"
            echo "  Monthly backups: $(ls -1 "$BACKUP_MONTHLY"/*.sql.gz 2>/dev/null | wc -l)"
        else
            echo "ERROR: Backup failed!"
            echo "Please check log file: $LOG_FILE"
        fi
        
        echo ""
        echo "=================================================="
    } > "$report_file"
    
    cat "$report_file"
}

# =====================================================
# EMAIL NOTIFICATION
# =====================================================

send_email_notification() {
    local status=$1
    local report_file=$2
    
    if [ "$ENABLE_EMAIL_NOTIFICATION" = true ]; then
        local subject="OBE Database Backup - $status - $(date '+%Y-%m-%d')"
        
        if command -v mail &> /dev/null; then
            mail -s "$subject" "$ADMIN_EMAIL" < "$report_file"
            log_message "Email notification sent to $ADMIN_EMAIL"
        else
            log_message "mail command not found. Install mailutils to enable email notifications."
        fi
    fi
}

# =====================================================
# MAIN BACKUP ORCHESTRATION
# =====================================================

main() {
    log_message "=============================================="
    log_message "OBE SYSTEM BACKUP STARTED"
    log_message "=============================================="
    
    # Create directories
    create_backup_dirs
    
    # Determine backup type based on schedule
    local backup_type="daily"
    local backup_dir="$BACKUP_DAILY"
    
    # Weekly backup on Sunday
    if [ "$BACKUP_DAY" == "Sunday" ]; then
        backup_type="weekly"
        backup_dir="$BACKUP_WEEKLY"
    fi
    
    # Monthly backup on 1st day of month
    if [ "$BACKUP_DAY_NUM" == "01" ]; then
        backup_type="monthly"
        backup_dir="$BACKUP_MONTHLY"
    fi
    
    log_message "Backup Type: $backup_type"
    
    # Perform backup
    if full_backup "$backup_type" "$backup_dir"; then
        backup_file=$(ls -t "$backup_dir"/obe_system_full_*.sql.gz | head -1)
        
        # Verify backup
        if verify_backup "$backup_file"; then
            # Also create schema backup (daily only)
            if [ "$backup_type" == "daily" ]; then
                schema_backup
            fi
            
            # Cleanup old backups
            cleanup_old_backups
            
            # Generate report
            generate_backup_report "SUCCESS" "$backup_type" "$backup_file"
            
            # Send notification
            report_file="$BACKUP_LOG/backup_report_${TIMESTAMP}.txt"
            send_email_notification "SUCCESS" "$report_file"
            
            log_success "Backup process completed successfully"
            exit 0
        else
            generate_backup_report "FAILED (Verification)" "$backup_type" "$backup_file"
            report_file="$BACKUP_LOG/backup_report_${TIMESTAMP}.txt"
            send_email_notification "FAILED" "$report_file"
            
            log_error "Backup verification failed"
            exit 1
        fi
    else
        generate_backup_report "FAILED (Backup)" "$backup_type" "N/A"
        report_file="$BACKUP_LOG/backup_report_${TIMESTAMP}.txt"
        send_email_notification "FAILED" "$report_file"
        
        log_error "Backup process failed"
        exit 1
    fi
}

# =====================================================
# SCRIPT EXECUTION
# =====================================================

# Check if running as root or with sufficient permissions
if [ ! -w "$BACKUP_ROOT" ] && [ ! -d "$BACKUP_ROOT" ]; then
    echo "Error: Insufficient permissions. Run with sudo or as mysql user."
    exit 1
fi

# Run main function
main

# =====================================================
# CRON SCHEDULE EXAMPLES
# =====================================================

# Add to crontab: crontab -e
#
# Daily backup at 2 AM:
# 0 2 * * * /path/to/database_backup.sh >> /var/log/mysql/backup_cron.log 2>&1
#
# Multiple daily backups:
# 0 2,14 * * * /path/to/database_backup.sh >> /var/log/mysql/backup_cron.log 2>&1
#
# Weekly backup (Sunday at 3 AM):
# 0 3 * * 0 /path/to/database_backup.sh >> /var/log/mysql/backup_cron.log 2>&1
#
# Monthly backup (1st of month at 4 AM):
# 0 4 1 * * /path/to/database_backup.sh >> /var/log/mysql/backup_cron.log 2>&1
