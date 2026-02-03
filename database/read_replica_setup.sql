-- =====================================================
-- READ REPLICA CONFIGURATION FOR OBE SYSTEM
-- File: read_replica_setup.sql
-- Description: MySQL master-slave replication configuration
-- =====================================================

-- =====================================================
-- MASTER SERVER CONFIGURATION
-- =====================================================

-- 1. Edit MySQL configuration file (my.cnf or my.ini)
-- Add these settings in [mysqld] section:

/*
[mysqld]
# Server identification
server-id = 1
log-bin = mysql-bin
binlog_format = ROW
binlog_do_db = obe_system
max_binlog_size = 100M
expire_logs_days = 7

# Performance tuning for replication
sync_binlog = 1
innodb_flush_log_at_trx_commit = 1

# GTID (Global Transaction Identifier) - recommended for MySQL 8.0+
gtid_mode = ON
enforce_gtid_consistency = ON

# Replication settings
binlog_cache_size = 1M
max_binlog_cache_size = 256M
*/

-- =====================================================
-- 2. CREATE REPLICATION USER ON MASTER
-- =====================================================

-- Create replication user with appropriate permissions
CREATE USER IF NOT EXISTS 'replication_user'@'%' 
IDENTIFIED WITH mysql_native_password BY 'StrongReplicationPassword123!';

-- Grant replication privileges
GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'%';

-- Grant monitoring privileges (optional but recommended)
GRANT SELECT, REPLICATION CLIENT ON *.* TO 'replication_user'@'%';

-- Apply privileges
FLUSH PRIVILEGES;

-- =====================================================
-- 3. GET MASTER STATUS
-- =====================================================

-- Execute this and note the File and Position values
-- You'll need these when configuring the slave
SHOW MASTER STATUS;

-- Sample output:
-- +------------------+----------+--------------+------------------+-------------------+
-- | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
-- +------------------+----------+--------------+------------------+-------------------+
-- | mysql-bin.000001 |      154 | obe_system   |                  |                   |
-- +------------------+----------+--------------+------------------+-------------------+

-- =====================================================
-- 4. CREATE SNAPSHOT FOR SLAVE (IF DATABASE EXISTS)
-- =====================================================

-- Lock tables to create consistent snapshot
FLUSH TABLES WITH READ LOCK;

-- In another terminal, create database backup:
-- mysqldump -u root -p --single-transaction --master-data=2 \
--   --databases obe_system > obe_system_master_snapshot.sql

-- After backup is complete, unlock tables:
UNLOCK TABLES;

-- =====================================================
-- SLAVE SERVER CONFIGURATION
-- =====================================================

-- 5. Edit MySQL configuration file (my.cnf or my.ini) on slave
-- Add these settings in [mysqld] section:

/*
[mysqld]
# Server identification (must be unique, different from master)
server-id = 2
relay-log = mysql-relay-bin
log_bin = mysql-bin
binlog_format = ROW
read_only = 1
super_read_only = 1

# GTID settings (must match master)
gtid_mode = ON
enforce_gtid_consistency = ON

# Replication settings
relay_log_purge = 1
relay_log_recovery = 1
slave_parallel_type = LOGICAL_CLOCK
slave_parallel_workers = 4
slave_preserve_commit_order = 1

# Performance tuning
innodb_flush_log_at_trx_commit = 2
sync_binlog = 0
*/

-- =====================================================
-- 6. RESTORE DATABASE ON SLAVE (IF NEEDED)
-- =====================================================

-- Import the snapshot on slave:
-- mysql -u root -p < obe_system_master_snapshot.sql

-- =====================================================
-- 7. CONFIGURE REPLICATION ON SLAVE
-- =====================================================

-- Stop slave if it's running
STOP SLAVE;

-- Reset slave configuration
RESET SLAVE ALL;

-- Configure slave to connect to master
-- Replace with your actual master server details
CHANGE MASTER TO
    MASTER_HOST = 'master_server_ip_or_hostname',
    MASTER_USER = 'replication_user',
    MASTER_PASSWORD = 'StrongReplicationPassword123!',
    MASTER_PORT = 3306,
    MASTER_AUTO_POSITION = 1,  -- For GTID-based replication
    MASTER_CONNECT_RETRY = 60,
    MASTER_RETRY_COUNT = 3;

-- Alternative configuration without GTID (if not using GTID):
-- CHANGE MASTER TO
--     MASTER_HOST = 'master_server_ip_or_hostname',
--     MASTER_USER = 'replication_user',
--     MASTER_PASSWORD = 'StrongReplicationPassword123!',
--     MASTER_PORT = 3306,
--     MASTER_LOG_FILE = 'mysql-bin.000001',  -- From SHOW MASTER STATUS
--     MASTER_LOG_POS = 154;                   -- From SHOW MASTER STATUS

-- Start replication
START SLAVE;

-- =====================================================
-- 8. VERIFY REPLICATION STATUS
-- =====================================================

-- Check slave status
SHOW SLAVE STATUS\G

-- Key indicators of successful replication:
-- Slave_IO_Running: Yes
-- Slave_SQL_Running: Yes
-- Seconds_Behind_Master: 0 (or a small number)
-- Last_Error: (should be empty)

-- Check replication lag
SELECT 
    CASE 
        WHEN Seconds_Behind_Master IS NULL THEN 'Replication Not Running'
        WHEN Seconds_Behind_Master = 0 THEN 'No Lag'
        ELSE CONCAT(Seconds_Behind_Master, ' seconds behind')
    END AS replication_status
FROM performance_schema.replication_connection_status
WHERE channel_name = '';

-- =====================================================
-- 9. ADDITIONAL SLAVE SERVERS
-- =====================================================

-- For each additional slave:
-- 1. Use unique server-id (e.g., 3, 4, 5...)
-- 2. Follow steps 5-8
-- 3. Can replicate from master or cascade from another slave

-- =====================================================
-- 10. MONITORING QUERIES
-- =====================================================

-- Check replication threads on master
SHOW PROCESSLIST;

-- View binary logs on master
SHOW BINARY LOGS;

-- Check which slaves are connected to master
SELECT 
    HOST,
    USER,
    COMMAND,
    TIME,
    STATE
FROM information_schema.PROCESSLIST
WHERE COMMAND = 'Binlog Dump';

-- Monitor replication lag on slave
SELECT 
    UNIX_TIMESTAMP() - UNIX_TIMESTAMP(ts) AS lag_seconds
FROM (
    SELECT MAX(last_applied_transaction_original_commit_timestamp) AS ts
    FROM performance_schema.replication_applier_status_by_worker
) AS subquery;

-- =====================================================
-- 11. APPLICATION CONFIGURATION
-- =====================================================

-- For read-write splitting in your application:
/*
Master Connection (for writes):
- Host: master_server_ip
- Port: 3306
- User: obe_user
- Database: obe_system
- Use for: INSERT, UPDATE, DELETE, CREATE, ALTER, DROP

Slave Connection (for reads):
- Host: slave_server_ip
- Port: 3306
- User: obe_readonly_user
- Database: obe_system
- Use for: SELECT queries

Load Balancer for Multiple Slaves:
- Use HAProxy, ProxySQL, or MySQL Router
- Distribute read traffic across multiple slaves
- Automatic failover on slave failure
*/

-- =====================================================
-- 12. CREATE READ-ONLY USER FOR SLAVES
-- =====================================================

-- Execute on master (will replicate to slaves):
CREATE USER IF NOT EXISTS 'obe_readonly_user'@'%' 
IDENTIFIED WITH mysql_native_password BY 'StrongReadOnlyPassword123!';

-- Grant only SELECT privileges
GRANT SELECT ON obe_system.* TO 'obe_readonly_user'@'%';

FLUSH PRIVILEGES;

-- =====================================================
-- 13. FAILOVER PROCEDURES
-- =====================================================

-- In case master fails, promote a slave to master:

-- On the slave to be promoted:
-- 1. Stop slave
STOP SLAVE;

-- 2. Reset slave configuration
RESET SLAVE ALL;

-- 3. Disable read-only mode
SET GLOBAL read_only = 0;
SET GLOBAL super_read_only = 0;

-- 4. Update application configuration to point to new master

-- On other slaves:
-- 1. Stop slave
STOP SLAVE;

-- 2. Point to new master
CHANGE MASTER TO
    MASTER_HOST = 'new_master_ip',
    MASTER_USER = 'replication_user',
    MASTER_PASSWORD = 'StrongReplicationPassword123!',
    MASTER_AUTO_POSITION = 1;

-- 3. Start slave
START SLAVE;

-- =====================================================
-- 14. TROUBLESHOOTING
-- =====================================================

-- Reset replication if errors occur:
-- On slave:
STOP SLAVE;
RESET SLAVE;
-- Reconfigure as in step 7
START SLAVE;

-- Skip one replication error (use cautiously):
-- SET GLOBAL SQL_SLAVE_SKIP_COUNTER = 1;
-- START SLAVE;

-- For GTID-based replication, skip a transaction:
-- STOP SLAVE;
-- SET GTID_NEXT='problematic-gtid-here';
-- BEGIN; COMMIT;
-- SET GTID_NEXT='AUTOMATIC';
-- START SLAVE;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Always use SSL/TLS for replication in production
-- 2. Monitor replication lag regularly
-- 3. Test failover procedures in staging environment
-- 4. Keep slave hardware similar to master for better performance
-- 5. Consider using ProxySQL or MySQL Router for automatic failover
-- 6. Regular testing of backup restoration from slaves
-- 7. Document your replication topology
-- =====================================================

SELECT 'Read replica configuration guide completed!' AS status;
