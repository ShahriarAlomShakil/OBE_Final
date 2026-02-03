-- =====================================================
-- DATABASE MAINTENANCE PROCEDURES FOR OBE SYSTEM
-- File: database_maintenance.sql
-- Description: Stored procedures for database maintenance
-- =====================================================

USE obe_system;

DELIMITER $$

-- =====================================================
-- 1. TABLE OPTIMIZATION PROCEDURES
-- =====================================================

-- Procedure to optimize all tables in the database
CREATE PROCEDURE IF NOT EXISTS sp_optimize_all_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(255);
    DECLARE tbl_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'obe_system' 
        AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SELECT 'Starting table optimization...' AS status;
    
    OPEN tbl_cursor;
    
    read_loop: LOOP
        FETCH tbl_cursor INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('OPTIMIZE TABLE ', tbl_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('Optimized: ', tbl_name) AS status;
    END LOOP;
    
    CLOSE tbl_cursor;
    
    SELECT 'All tables optimized successfully!' AS status;
END$$

-- Procedure to analyze all tables (update statistics)
CREATE PROCEDURE IF NOT EXISTS sp_analyze_all_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(255);
    DECLARE tbl_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'obe_system' 
        AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SELECT 'Starting table analysis...' AS status;
    
    OPEN tbl_cursor;
    
    read_loop: LOOP
        FETCH tbl_cursor INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET @sql = CONCAT('ANALYZE TABLE ', tbl_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('Analyzed: ', tbl_name) AS status;
    END LOOP;
    
    CLOSE tbl_cursor;
    
    SELECT 'All tables analyzed successfully!' AS status;
END$$

-- Procedure to check and repair tables
CREATE PROCEDURE IF NOT EXISTS sp_check_and_repair_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(255);
    DECLARE check_result VARCHAR(50);
    DECLARE tbl_cursor CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'obe_system' 
        AND TABLE_TYPE = 'BASE TABLE';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_repair_report (
        table_name VARCHAR(255),
        check_status VARCHAR(50),
        repair_status VARCHAR(50)
    );
    
    TRUNCATE TABLE temp_repair_report;
    
    SELECT 'Starting table check and repair...' AS status;
    
    OPEN tbl_cursor;
    
    read_loop: LOOP
        FETCH tbl_cursor INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Check table
        SET @sql = CONCAT('CHECK TABLE ', tbl_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- If check fails, repair table
        SET @sql = CONCAT('REPAIR TABLE ', tbl_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        INSERT INTO temp_repair_report VALUES (tbl_name, 'Checked', 'Repaired if needed');
    END LOOP;
    
    CLOSE tbl_cursor;
    
    SELECT * FROM temp_repair_report;
    DROP TEMPORARY TABLE temp_repair_report;
    
    SELECT 'Table check and repair completed!' AS status;
END$$

-- =====================================================
-- 2. INDEX MAINTENANCE PROCEDURES
-- =====================================================

-- Procedure to rebuild all indexes
CREATE PROCEDURE IF NOT EXISTS sp_rebuild_indexes()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(255);
    DECLARE tbl_cursor CURSOR FOR 
        SELECT DISTINCT TABLE_NAME 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'obe_system';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SELECT 'Starting index rebuild...' AS status;
    
    OPEN tbl_cursor;
    
    read_loop: LOOP
        FETCH tbl_cursor INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Rebuild indexes by optimizing table
        SET @sql = CONCAT('ALTER TABLE ', tbl_name, ' ENGINE=InnoDB');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('Indexes rebuilt for: ', tbl_name) AS status;
    END LOOP;
    
    CLOSE tbl_cursor;
    
    SELECT 'All indexes rebuilt successfully!' AS status;
END$$

-- Procedure to find and report missing indexes
CREATE PROCEDURE IF NOT EXISTS sp_find_missing_indexes()
BEGIN
    SELECT 
        'Missing Index Analysis' AS report_title,
        CONCAT('Check slow query log and performance_schema for suggestions') AS recommendation;
    
    -- Show tables without indexes (except PRIMARY)
    SELECT 
        t.TABLE_NAME,
        t.TABLE_ROWS,
        ROUND((t.DATA_LENGTH + t.INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb,
        'No indexes found (except PRIMARY)' AS issue
    FROM information_schema.TABLES t
    LEFT JOIN information_schema.STATISTICS s 
        ON t.TABLE_SCHEMA = s.TABLE_SCHEMA 
        AND t.TABLE_NAME = s.TABLE_NAME
        AND s.INDEX_NAME != 'PRIMARY'
    WHERE t.TABLE_SCHEMA = 'obe_system'
        AND t.TABLE_TYPE = 'BASE TABLE'
        AND s.INDEX_NAME IS NULL
        AND t.TABLE_ROWS > 100
    ORDER BY t.TABLE_ROWS DESC;
END$$

-- =====================================================
-- 3. DATA CLEANUP PROCEDURES
-- =====================================================

-- Procedure to cleanup expired sessions
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_expired_sessions()
BEGIN
    DECLARE deleted_count INT;
    
    -- Delete sessions older than 7 days
    DELETE FROM sessions 
    WHERE last_activity < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY));
    
    SET deleted_count = ROW_COUNT();
    
    SELECT CONCAT('Cleaned up ', deleted_count, ' expired sessions') AS status;
END$$

-- Procedure to cleanup expired password reset tokens
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_expired_tokens()
BEGIN
    DECLARE deleted_count INT;
    
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW();
    
    SET deleted_count = ROW_COUNT();
    
    SELECT CONCAT('Cleaned up ', deleted_count, ' expired tokens') AS status;
END$$

-- Procedure to cleanup old audit logs
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_old_audit_logs(
    IN retention_days INT
)
BEGIN
    DECLARE deleted_count INT;
    
    DELETE FROM audit_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL retention_days DAY);
    
    SET deleted_count = ROW_COUNT();
    
    SELECT CONCAT('Cleaned up ', deleted_count, ' old audit log entries') AS status;
END$$

-- Procedure to cleanup old notifications
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_old_notifications(
    IN retention_days INT
)
BEGIN
    DECLARE deleted_count INT;
    
    DELETE FROM notifications 
    WHERE is_read = 1 
    AND created_at < DATE_SUB(NOW(), INTERVAL retention_days DAY);
    
    SET deleted_count = ROW_COUNT();
    
    SELECT CONCAT('Cleaned up ', deleted_count, ' old notifications') AS status;
END$$

-- Procedure to purge soft-deleted records
CREATE PROCEDURE IF NOT EXISTS sp_purge_soft_deleted_records(
    IN days_before_purge INT
)
BEGIN
    DECLARE purge_date TIMESTAMP;
    SET purge_date = DATE_SUB(NOW(), INTERVAL days_before_purge DAY);
    
    -- Purge from users
    DELETE FROM users WHERE deleted_at IS NOT NULL AND deleted_at < purge_date;
    SELECT CONCAT('Purged ', ROW_COUNT(), ' users') AS status;
    
    -- Purge from courses
    DELETE FROM courses WHERE deleted_at IS NOT NULL AND deleted_at < purge_date;
    SELECT CONCAT('Purged ', ROW_COUNT(), ' courses') AS status;
    
    -- Purge from students
    DELETE FROM students WHERE deleted_at IS NOT NULL AND deleted_at < purge_date;
    SELECT CONCAT('Purged ', ROW_COUNT(), ' students') AS status;
    
    -- Add more tables as needed
    
    SELECT 'Soft-deleted records purged successfully!' AS status;
END$$

-- =====================================================
-- 4. DATABASE STATISTICS PROCEDURES
-- =====================================================

-- Procedure to generate database size report
CREATE PROCEDURE IF NOT EXISTS sp_database_size_report()
BEGIN
    SELECT 
        TABLE_NAME,
        TABLE_ROWS AS row_count,
        ROUND(DATA_LENGTH / 1024 / 1024, 2) AS data_size_mb,
        ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS index_size_mb,
        ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_size_mb,
        ROUND((DATA_LENGTH + INDEX_LENGTH) * 100.0 / 
            (SELECT SUM(DATA_LENGTH + INDEX_LENGTH) 
             FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = 'obe_system'), 2) AS pct_of_database
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = 'obe_system'
    AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
    
    -- Total database size
    SELECT 
        ROUND(SUM(DATA_LENGTH) / 1024 / 1024, 2) AS total_data_mb,
        ROUND(SUM(INDEX_LENGTH) / 1024 / 1024, 2) AS total_index_mb,
        ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_database_mb
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = 'obe_system';
END$$

-- Procedure to analyze table fragmentation
CREATE PROCEDURE IF NOT EXISTS sp_analyze_fragmentation()
BEGIN
    SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        ROUND(DATA_LENGTH / 1024 / 1024, 2) AS data_size_mb,
        ROUND(DATA_FREE / 1024 / 1024, 2) AS data_free_mb,
        ROUND((DATA_FREE * 100.0 / DATA_LENGTH), 2) AS fragmentation_pct,
        CASE 
            WHEN (DATA_FREE * 100.0 / DATA_LENGTH) > 20 THEN 'Optimize Recommended'
            WHEN (DATA_FREE * 100.0 / DATA_LENGTH) > 10 THEN 'Moderate Fragmentation'
            ELSE 'Good'
        END AS recommendation
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = 'obe_system'
    AND DATA_FREE > 0
    AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY (DATA_FREE * 100.0 / DATA_LENGTH) DESC;
END$$

-- Procedure to show index usage statistics
CREATE PROCEDURE IF NOT EXISTS sp_index_usage_stats()
BEGIN
    SELECT 
        OBJECT_SCHEMA AS database_name,
        OBJECT_NAME AS table_name,
        INDEX_NAME,
        COUNT_READ,
        COUNT_WRITE,
        COUNT_FETCH,
        COUNT_INSERT,
        COUNT_UPDATE,
        COUNT_DELETE
    FROM performance_schema.table_io_waits_summary_by_index_usage
    WHERE OBJECT_SCHEMA = 'obe_system'
    AND INDEX_NAME IS NOT NULL
    ORDER BY COUNT_READ DESC;
END$$

-- =====================================================
-- 5. COMPREHENSIVE MAINTENANCE PROCEDURE
-- =====================================================

-- Master procedure that runs all maintenance tasks
CREATE PROCEDURE IF NOT EXISTS sp_run_full_maintenance()
BEGIN
    DECLARE start_time DATETIME;
    DECLARE end_time DATETIME;
    
    SET start_time = NOW();
    
    SELECT '========================================' AS separator;
    SELECT 'STARTING FULL DATABASE MAINTENANCE' AS status;
    SELECT '========================================' AS separator;
    
    -- 1. Cleanup expired data
    SELECT '1. Cleaning up expired data...' AS task;
    CALL sp_cleanup_expired_sessions();
    CALL sp_cleanup_expired_tokens();
    CALL sp_cleanup_old_audit_logs(90);
    CALL sp_cleanup_old_notifications(30);
    
    -- 2. Check and repair tables
    SELECT '2. Checking and repairing tables...' AS task;
    CALL sp_check_and_repair_tables();
    
    -- 3. Analyze tables
    SELECT '3. Analyzing tables...' AS task;
    CALL sp_analyze_all_tables();
    
    -- 4. Check fragmentation and optimize if needed
    SELECT '4. Checking fragmentation...' AS task;
    CALL sp_analyze_fragmentation();
    
    SELECT '5. Optimizing fragmented tables...' AS task;
    CALL sp_optimize_all_tables();
    
    -- 6. Generate reports
    SELECT '6. Generating database statistics...' AS task;
    CALL sp_database_size_report();
    
    SET end_time = NOW();
    
    SELECT '========================================' AS separator;
    SELECT 'MAINTENANCE COMPLETED' AS status;
    SELECT CONCAT('Duration: ', TIMESTAMPDIFF(SECOND, start_time, end_time), ' seconds') AS duration;
    SELECT '========================================' AS separator;
END$$

-- =====================================================
-- 6. MONITORING PROCEDURES
-- =====================================================

-- Procedure to check database health
CREATE PROCEDURE IF NOT EXISTS sp_check_database_health()
BEGIN
    -- Connection statistics
    SELECT 'Connection Statistics' AS metric_category;
    SHOW STATUS LIKE 'Threads_connected';
    SHOW STATUS LIKE 'Max_used_connections';
    SHOW VARIABLES LIKE 'max_connections';
    
    -- Table lock statistics
    SELECT 'Lock Statistics' AS metric_category;
    SHOW STATUS LIKE 'Table_locks%';
    SHOW STATUS LIKE 'Innodb_row_lock%';
    
    -- Query cache statistics (if enabled)
    SELECT 'Query Cache Statistics' AS metric_category;
    SHOW STATUS LIKE 'Qcache%';
    
    -- Slow queries
    SELECT 'Slow Queries' AS metric_category;
    SHOW STATUS LIKE 'Slow_queries';
    SHOW VARIABLES LIKE 'long_query_time';
    
    -- InnoDB buffer pool statistics
    SELECT 'InnoDB Buffer Pool' AS metric_category;
    SHOW STATUS LIKE 'Innodb_buffer_pool%';
END$$

-- Procedure to identify slow queries
CREATE PROCEDURE IF NOT EXISTS sp_find_slow_queries()
BEGIN
    SELECT 
        DIGEST_TEXT AS query,
        COUNT_STAR AS exec_count,
        ROUND(AVG_TIMER_WAIT / 1000000000000, 2) AS avg_time_sec,
        ROUND(MAX_TIMER_WAIT / 1000000000000, 2) AS max_time_sec,
        ROUND(SUM_LOCK_TIME / 1000000000000, 2) AS total_lock_time_sec,
        ROUND(SUM_ROWS_EXAMINED / COUNT_STAR, 0) AS avg_rows_examined,
        ROUND(SUM_ROWS_SENT / COUNT_STAR, 0) AS avg_rows_sent
    FROM performance_schema.events_statements_summary_by_digest
    WHERE SCHEMA_NAME = 'obe_system'
    ORDER BY AVG_TIMER_WAIT DESC
    LIMIT 20;
END$$

DELIMITER ;

-- =====================================================
-- AUTOMATED MAINTENANCE EVENTS
-- =====================================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Daily cleanup event (runs at 2 AM)
CREATE EVENT IF NOT EXISTS evt_daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO
    CALL sp_cleanup_expired_sessions();

-- Weekly optimization event (runs Sunday at 3 AM)
CREATE EVENT IF NOT EXISTS evt_weekly_optimization
ON SCHEDULE EVERY 1 WEEK
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL (7 - WEEKDAY(CURRENT_DATE)) DAY + INTERVAL 3 HOUR)
DO
    CALL sp_analyze_all_tables();

-- Monthly full maintenance (runs 1st day of month at 4 AM)
CREATE EVENT IF NOT EXISTS evt_monthly_maintenance
ON SCHEDULE EVERY 1 MONTH
STARTS (TIMESTAMP(LAST_DAY(CURRENT_DATE)) + INTERVAL 1 DAY + INTERVAL 4 HOUR)
DO
    CALL sp_run_full_maintenance();

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

/*
-- Run full maintenance manually:
CALL sp_run_full_maintenance();

-- Check database health:
CALL sp_check_database_health();

-- Generate size report:
CALL sp_database_size_report();

-- Cleanup old data:
CALL sp_cleanup_old_audit_logs(90);
CALL sp_cleanup_old_notifications(30);

-- Purge soft-deleted records (permanently delete after 365 days):
CALL sp_purge_soft_deleted_records(365);

-- Check for slow queries:
CALL sp_find_slow_queries();

-- Analyze fragmentation:
CALL sp_analyze_fragmentation();

-- View index usage:
CALL sp_index_usage_stats();

-- View scheduled events:
SHOW EVENTS FROM obe_system;

-- Disable an event:
ALTER EVENT evt_daily_cleanup DISABLE;

-- Enable an event:
ALTER EVENT evt_daily_cleanup ENABLE;

-- Drop an event:
DROP EVENT IF EXISTS evt_daily_cleanup;
*/

SELECT 'Database maintenance procedures created successfully!' AS status;
