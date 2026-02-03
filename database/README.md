# Database Optimization Guide - OBE System

## Overview
This directory contains all database optimization scripts, configurations, and documentation for the Outcome Based Education (OBE) system.

---

## 📁 Directory Structure

```
database/
├── migrations/                          # Database migration files (001-089)
│   └── 089_add_performance_indexes.sql # Performance indexes ✨
├── read_replica_setup.sql               # Read replica configuration ✨
├── table_partitioning.sql               # Table partitioning setup ✨
├── database_backup.sh                   # Automated backup script ✨
├── database_restore.sh                  # Database restore utility ✨
├── database_maintenance.sql             # Maintenance procedures ✨
├── DATABASE_CONSTRAINTS.md              # Constraints documentation ✨
├── setup.sql                            # Initial database setup
└── README.md                            # This file

✨ = New optimization files (Step 2.16)
```

---

## 🚀 Quick Start

### Step 1: Create Database and User

Run the SQL setup script as MySQL root user:

```bash
mysql -u root -p < database/setup.sql
```

Or manually execute the commands:

```bash
# Login as root
mysql -u root -p

# Then run:
CREATE DATABASE obe_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'obe_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, 
      CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, 
      SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, TRIGGER, REFERENCES 
ON obe_system.* TO 'obe_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Update Environment Variables

Edit `backend/.env` and update the following:
- `DB_PASSWORD`: Set your actual database password
- `JWT_SECRET`: Generate a strong secret key
- `SESSION_SECRET`: Generate a strong secret key

### Step 3: Test Database Connection

```bash
cd obe-system/backend
node -e "require('./config/database').testConnection()"
```

### Step 4: Apply Performance Optimizations

```bash
# Add performance indexes
mysql -u obe_user -p obe_system < migrations/089_add_performance_indexes.sql

# Install maintenance procedures
mysql -u root -p obe_system < database_maintenance.sql
```

### Step 5: Setup Automated Backups

```bash
# Make scripts executable
chmod +x database_backup.sh database_restore.sh

# Configure and test backup
sudo ./database_backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /path/to/database_backup.sh >> /var/log/mysql/backup_cron.log 2>&1
```

---

## 📊 Performance Optimization Features

### 1. Performance Indexes (89 indexes added)
- User authentication & session management
- Course and enrollment queries
- Assessment and marks processing
- OBE framework calculations
- Audit logs and notifications

### 2. Read Replicas Configuration
- Master-slave replication setup
- Load distribution for read queries
- Automatic failover procedures
- Monitoring and troubleshooting guides

### 3. Table Partitioning
- Partitioned large tables (audit_logs, sessions, marks)
- Automated partition management
- Fast archival and cleanup
- Improved query performance

### 4. Automated Backups
- Daily, weekly, and monthly backups
- Compression and integrity checks
- Email notifications
- Easy restoration utility

### 5. Database Maintenance
- Automated cleanup procedures
- Table optimization and analysis
- Index rebuilding
- Health monitoring

---

## 📚 Documentation

- **[DATABASE_CONSTRAINTS.md](DATABASE_CONSTRAINTS.md)**: Complete constraints documentation
- **[database_revised.md](../database_revised.md)**: Full schema documentation
- **[read_replica_setup.sql](read_replica_setup.sql)**: Replication configuration guide
- **[table_partitioning.sql](table_partitioning.sql)**: Partitioning setup and management
- **[database_maintenance.sql](database_maintenance.sql)**: Maintenance procedures

---

## 🛠️ Maintenance Commands

```sql
-- Run full maintenance
CALL sp_run_full_maintenance();

-- Generate size report
CALL sp_database_size_report();

-- Cleanup old data
CALL sp_cleanup_old_audit_logs(90);
CALL sp_cleanup_old_notifications(30);

-- Check database health
CALL sp_check_database_health();

-- Find slow queries
CALL sp_find_slow_queries();
```

---

## Database Migrations

The project uses `db-migrate` for database migrations.

### Create a new migration:
```bash
npm run migrate:create -- migration-name
```

### Run migrations:
```bash
npm run migrate:up
```

### Rollback migrations:
```bash
npm run migrate:down
```

### Reset database:
```bash
npm run migrate:reset
```

## Database Connection Pool Configuration

The database connection is configured in `backend/config/database.js` with the following settings:

- **Connection Limit**: 10 (adjustable via `DB_CONNECTION_LIMIT`)
- **Max Idle**: 10 connections
- **Idle Timeout**: 60 seconds
- **Character Set**: utf8mb4
- **Timezone**: UTC

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - Minimum 16 characters for production
3. **Rotate secrets regularly** - Especially JWT and session secrets
4. **Limit database privileges** - Only grant necessary permissions
5. **Use SSL/TLS** - For production database connections

## Troubleshooting

### Connection refused
- Check if MySQL is running: `sudo systemctl status mysql`
- Verify port 3306 is open: `netstat -an | grep 3306`

### Access denied
- Verify user exists: `SELECT User, Host FROM mysql.user WHERE User = 'obe_user';`
- Check grants: `SHOW GRANTS FOR 'obe_user'@'localhost';`

### Character set issues
- Verify database charset: `SHOW CREATE DATABASE obe_system;`
- Should show: `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
