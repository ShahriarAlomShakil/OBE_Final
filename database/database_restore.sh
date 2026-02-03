#!/bin/bash

# =====================================================
# DATABASE RESTORE SCRIPT FOR OBE SYSTEM
# File: database_restore.sh
# Description: Restore database from backup files
# =====================================================

# Configuration
BACKUP_ROOT="/var/backups/mysql/obe_system"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="obe_system"
DB_USER="root"
DB_PASSWORD="StrongPasswordHere"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =====================================================
# FUNCTIONS
# =====================================================

list_backups() {
    local backup_type=$1
    
    echo -e "${YELLOW}Available $backup_type backups:${NC}"
    echo "=================================================="
    
    case $backup_type in
        daily)
            ls -lh "$BACKUP_ROOT/daily"/*.sql.gz 2>/dev/null | awk '{print NR") "$9" - "$5}'
            ;;
        weekly)
            ls -lh "$BACKUP_ROOT/weekly"/*.sql.gz 2>/dev/null | awk '{print NR") "$9" - "$5}'
            ;;
        monthly)
            ls -lh "$BACKUP_ROOT/monthly"/*.sql.gz 2>/dev/null | awk '{print NR") "$9" - "$5}'
            ;;
        all)
            find "$BACKUP_ROOT" -name "*.sql.gz" -type f -exec ls -lh {} \; | awk '{print NR") "$9" - "$5}'
            ;;
    esac
}

restore_backup() {
    local backup_file=$1
    
    echo -e "${YELLOW}Starting restore process...${NC}"
    
    # Verify backup file exists
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}Error: Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    # Verify checksum if available
    if [ -f "$backup_file.md5" ]; then
        echo "Verifying backup integrity..."
        if md5sum -c "$backup_file.md5"; then
            echo -e "${GREEN}✓ Checksum verified${NC}"
        else
            echo -e "${RED}✗ Checksum verification failed${NC}"
            read -p "Continue anyway? (yes/no): " continue
            if [ "$continue" != "yes" ]; then
                exit 1
            fi
        fi
    fi
    
    # Confirm restore
    echo -e "${RED}WARNING: This will overwrite the current database!${NC}"
    echo "Database: $DB_NAME"
    echo "Backup file: $backup_file"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Restore cancelled."
        exit 0
    fi
    
    # Create backup of current database before restore
    echo "Creating safety backup of current database..."
    local safety_backup="/tmp/obe_system_before_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
    mysqldump --host="$DB_HOST" \
              --port="$DB_PORT" \
              --user="$DB_USER" \
              --password="$DB_PASSWORD" \
              --single-transaction \
              --databases "$DB_NAME" | gzip > "$safety_backup"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Safety backup created: $safety_backup${NC}"
    else
        echo -e "${RED}✗ Failed to create safety backup${NC}"
        exit 1
    fi
    
    # Perform restore
    echo "Restoring database from backup..."
    gunzip < "$backup_file" | mysql --host="$DB_HOST" \
                                     --port="$DB_PORT" \
                                     --user="$DB_USER" \
                                     --password="$DB_PASSWORD"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database restored successfully!${NC}"
        echo "Safety backup kept at: $safety_backup"
        return 0
    else
        echo -e "${RED}✗ Restore failed!${NC}"
        echo "Restoring from safety backup..."
        gunzip < "$safety_backup" | mysql --host="$DB_HOST" \
                                           --port="$DB_PORT" \
                                           --user="$DB_USER" \
                                           --password="$DB_PASSWORD"
        exit 1
    fi
}

# =====================================================
# MAIN MENU
# =====================================================

show_menu() {
    echo ""
    echo "=================================================="
    echo "    OBE SYSTEM DATABASE RESTORE UTILITY"
    echo "=================================================="
    echo "1) List daily backups"
    echo "2) List weekly backups"
    echo "3) List monthly backups"
    echo "4) List all backups"
    echo "5) Restore from specific file"
    echo "6) Exit"
    echo "=================================================="
}

main() {
    while true; do
        show_menu
        read -p "Select an option: " option
        
        case $option in
            1)
                list_backups "daily"
                read -p "Enter backup file path to restore (or press Enter to go back): " backup_file
                if [ -n "$backup_file" ]; then
                    restore_backup "$backup_file"
                fi
                ;;
            2)
                list_backups "weekly"
                read -p "Enter backup file path to restore (or press Enter to go back): " backup_file
                if [ -n "$backup_file" ]; then
                    restore_backup "$backup_file"
                fi
                ;;
            3)
                list_backups "monthly"
                read -p "Enter backup file path to restore (or press Enter to go back): " backup_file
                if [ -n "$backup_file" ]; then
                    restore_backup "$backup_file"
                fi
                ;;
            4)
                list_backups "all"
                read -p "Enter backup file path to restore (or press Enter to go back): " backup_file
                if [ -n "$backup_file" ]; then
                    restore_backup "$backup_file"
                fi
                ;;
            5)
                read -p "Enter full path to backup file: " backup_file
                restore_backup "$backup_file"
                ;;
            6)
                echo "Exiting..."
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
    done
}

# Run main function
main
