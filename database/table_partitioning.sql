-- =====================================================
-- TABLE PARTITIONING CONFIGURATION FOR OBE SYSTEM
-- File: table_partitioning.sql
-- Description: Partition large tables for better performance
-- =====================================================

USE obe_system;

-- =====================================================
-- IMPORTANT NOTES BEFORE PARTITIONING
-- =====================================================
-- 1. Backup your database before applying partitioning
-- 2. Partitioning requires table to have no foreign keys or unique constraints
--    that don't include the partition key
-- 3. Test in development environment first
-- 4. Consider downtime window for production
-- 5. Monitor performance before and after
-- =====================================================

-- =====================================================
-- 1. PARTITION audit_logs BY RANGE (DATE)
-- =====================================================
-- Large table with historical data, perfect for time-based partitioning

-- Drop existing foreign keys if any
ALTER TABLE audit_logs DROP FOREIGN KEY IF EXISTS fk_audit_logs_user_id;

-- Add partitioning (partition by year and month)
ALTER TABLE audit_logs
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p_2024_01 VALUES LESS THAN (202402),
    PARTITION p_2024_02 VALUES LESS THAN (202403),
    PARTITION p_2024_03 VALUES LESS THAN (202404),
    PARTITION p_2024_04 VALUES LESS THAN (202405),
    PARTITION p_2024_05 VALUES LESS THAN (202406),
    PARTITION p_2024_06 VALUES LESS THAN (202407),
    PARTITION p_2024_07 VALUES LESS THAN (202408),
    PARTITION p_2024_08 VALUES LESS THAN (202409),
    PARTITION p_2024_09 VALUES LESS THAN (202410),
    PARTITION p_2024_10 VALUES LESS THAN (202411),
    PARTITION p_2024_11 VALUES LESS THAN (202412),
    PARTITION p_2024_12 VALUES LESS THAN (202501),
    PARTITION p_2025_01 VALUES LESS THAN (202502),
    PARTITION p_2025_02 VALUES LESS THAN (202503),
    PARTITION p_2025_03 VALUES LESS THAN (202504),
    PARTITION p_2025_04 VALUES LESS THAN (202505),
    PARTITION p_2025_05 VALUES LESS THAN (202506),
    PARTITION p_2025_06 VALUES LESS THAN (202507),
    PARTITION p_2025_07 VALUES LESS THAN (202508),
    PARTITION p_2025_08 VALUES LESS THAN (202509),
    PARTITION p_2025_09 VALUES LESS THAN (202510),
    PARTITION p_2025_10 VALUES LESS THAN (202511),
    PARTITION p_2025_11 VALUES LESS THAN (202512),
    PARTITION p_2025_12 VALUES LESS THAN (202601),
    PARTITION p_2026_01 VALUES LESS THAN (202602),
    PARTITION p_2026_02 VALUES LESS THAN (202603),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =====================================================
-- 2. PARTITION sessions BY RANGE (TIMESTAMP)
-- =====================================================
-- Session data with time-based cleanup

ALTER TABLE sessions
PARTITION BY RANGE (last_activity) (
    PARTITION p_old VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01')),
    PARTITION p_2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
    PARTITION p_2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
    PARTITION p_2024_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
    PARTITION p_2024_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01')),
    PARTITION p_2025_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2025-04-01')),
    PARTITION p_2025_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2025-07-01')),
    PARTITION p_2025_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2025-10-01')),
    PARTITION p_2025_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2026-01-01')),
    PARTITION p_2026_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2026-04-01')),
    PARTITION p_2026_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2026-07-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =====================================================
-- 3. PARTITION student_assessment_marks BY LIST (semester_id)
-- =====================================================
-- Large table with assessment data per semester

-- First, we need to modify the table structure
-- Note: This is a complex operation, consider creating a new partitioned table
-- and migrating data if the table is very large

-- Example for hash partitioning by semester:
ALTER TABLE student_assessment_marks
PARTITION BY HASH(semester_id)
PARTITIONS 16;  -- Adjust based on expected number of semesters

-- =====================================================
-- 4. PARTITION student_question_marks BY HASH
-- =====================================================

ALTER TABLE student_question_marks
PARTITION BY HASH(student_id)
PARTITIONS 16;  -- Distributes load across 16 partitions

-- =====================================================
-- 5. PARTITION course_enrollments BY RANGE (academic year)
-- =====================================================
-- Enrollment data partitioned by academic session

-- Add a generated column for partitioning if enrollment_date is used
ALTER TABLE course_enrollments
PARTITION BY RANGE (YEAR(enrollment_date)) (
    PARTITION p_2020 VALUES LESS THAN (2021),
    PARTITION p_2021 VALUES LESS THAN (2022),
    PARTITION p_2022 VALUES LESS THAN (2023),
    PARTITION p_2023 VALUES LESS THAN (2024),
    PARTITION p_2024 VALUES LESS THAN (2025),
    PARTITION p_2025 VALUES LESS THAN (2026),
    PARTITION p_2026 VALUES LESS THAN (2027),
    PARTITION p_2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =====================================================
-- 6. PARTITION notifications BY RANGE (DATE)
-- =====================================================

ALTER TABLE notifications
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p_2024_01 VALUES LESS THAN (202402),
    PARTITION p_2024_02 VALUES LESS THAN (202403),
    PARTITION p_2024_03 VALUES LESS THAN (202404),
    PARTITION p_2024_04 VALUES LESS THAN (202405),
    PARTITION p_2024_05 VALUES LESS THAN (202406),
    PARTITION p_2024_06 VALUES LESS THAN (202407),
    PARTITION p_2024_07 VALUES LESS THAN (202408),
    PARTITION p_2024_08 VALUES LESS THAN (202409),
    PARTITION p_2024_09 VALUES LESS THAN (202410),
    PARTITION p_2024_10 VALUES LESS THAN (202411),
    PARTITION p_2024_11 VALUES LESS THAN (202412),
    PARTITION p_2024_12 VALUES LESS THAN (202501),
    PARTITION p_2025_01 VALUES LESS THAN (202502),
    PARTITION p_2025_02 VALUES LESS THAN (202503),
    PARTITION p_2025_03 VALUES LESS THAN (202504),
    PARTITION p_2025_04 VALUES LESS THAN (202505),
    PARTITION p_2025_05 VALUES LESS THAN (202506),
    PARTITION p_2025_06 VALUES LESS THAN (202507),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =====================================================
-- 7. PARTITION email_queue BY RANGE (scheduled_at)
-- =====================================================

ALTER TABLE email_queue
PARTITION BY RANGE (UNIX_TIMESTAMP(scheduled_at)) (
    PARTITION p_past VALUES LESS THAN (UNIX_TIMESTAMP('2024-01-01')),
    PARTITION p_2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
    PARTITION p_2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
    PARTITION p_2024_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01')),
    PARTITION p_2024_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01')),
    PARTITION p_2025_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2025-04-01')),
    PARTITION p_2025_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2025-07-01')),
    PARTITION p_2025_q3 VALUES LESS THAN (UNIX_TIMESTAMP('2025-10-01')),
    PARTITION p_2025_q4 VALUES LESS THAN (UNIX_TIMESTAMP('2026-01-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =====================================================
-- PARTITION MANAGEMENT PROCEDURES
-- =====================================================

DELIMITER $$

-- Procedure to add new monthly partitions to audit_logs
CREATE PROCEDURE sp_add_audit_log_partition(
    IN partition_year INT,
    IN partition_month INT
)
BEGIN
    DECLARE partition_name VARCHAR(20);
    DECLARE partition_value INT;
    DECLARE next_value INT;
    
    SET partition_name = CONCAT('p_', partition_year, '_', LPAD(partition_month, 2, '0'));
    SET partition_value = partition_year * 100 + partition_month;
    SET next_value = IF(partition_month = 12, 
                        (partition_year + 1) * 100 + 1, 
                        partition_year * 100 + partition_month + 1);
    
    SET @sql = CONCAT(
        'ALTER TABLE audit_logs REORGANIZE PARTITION p_future INTO (',
        'PARTITION ', partition_name, ' VALUES LESS THAN (', next_value, '),',
        'PARTITION p_future VALUES LESS THAN MAXVALUE)'
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Partition ', partition_name, ' added successfully') AS message;
END$$

-- Procedure to drop old partitions (for archival)
CREATE PROCEDURE sp_drop_old_partition(
    IN table_name VARCHAR(64),
    IN partition_name VARCHAR(64)
)
BEGIN
    SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP PARTITION ', partition_name);
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Partition ', partition_name, ' dropped from ', table_name) AS message;
END$$

-- Procedure to archive old partition data before dropping
CREATE PROCEDURE sp_archive_partition_data(
    IN table_name VARCHAR(64),
    IN partition_name VARCHAR(64),
    IN archive_table VARCHAR(64)
)
BEGIN
    -- Create archive table if not exists
    SET @create_archive = CONCAT(
        'CREATE TABLE IF NOT EXISTS ', archive_table, 
        ' LIKE ', table_name
    );
    PREPARE stmt FROM @create_archive;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Copy data from partition to archive
    SET @copy_data = CONCAT(
        'INSERT INTO ', archive_table,
        ' SELECT * FROM ', table_name,
        ' PARTITION (', partition_name, ')'
    );
    PREPARE stmt FROM @copy_data;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT CONCAT('Data from partition ', partition_name, ' archived to ', archive_table) AS message;
END$$

-- Procedure to view partition information
CREATE PROCEDURE sp_show_partition_info(
    IN table_name VARCHAR(64)
)
BEGIN
    SELECT 
        PARTITION_NAME,
        PARTITION_METHOD,
        PARTITION_EXPRESSION,
        PARTITION_DESCRIPTION,
        TABLE_ROWS,
        AVG_ROW_LENGTH,
        DATA_LENGTH,
        INDEX_LENGTH,
        CREATE_TIME,
        UPDATE_TIME
    FROM information_schema.PARTITIONS
    WHERE TABLE_SCHEMA = 'obe_system'
    AND TABLE_NAME = table_name
    ORDER BY PARTITION_ORDINAL_POSITION;
END$$

DELIMITER ;

-- =====================================================
-- AUTOMATED PARTITION MAINTENANCE EVENT
-- =====================================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Create event to add new partitions automatically
-- Runs monthly to add partitions for next 3 months
DELIMITER $$

CREATE EVENT IF NOT EXISTS evt_add_monthly_partitions
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DECLARE next_year INT;
    DECLARE next_month INT;
    DECLARE i INT DEFAULT 0;
    
    -- Add partitions for next 3 months
    WHILE i < 3 DO
        SET next_year = YEAR(DATE_ADD(NOW(), INTERVAL i MONTH));
        SET next_month = MONTH(DATE_ADD(NOW(), INTERVAL i MONTH));
        
        -- Add partition to audit_logs (ignore if already exists)
        BEGIN
            DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
            CALL sp_add_audit_log_partition(next_year, next_month);
        END;
        
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- =====================================================
-- PARTITION PRUNING QUERIES (OPTIMIZED)
-- =====================================================

-- Query with partition pruning (fast)
-- Only searches relevant partition
SELECT * FROM audit_logs
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'
AND action = 'DELETE';

-- Without partition pruning (slow)
-- Searches all partitions
SELECT * FROM audit_logs
WHERE user_id = 123;

-- =====================================================
-- VIEW PARTITION STATISTICS
-- =====================================================

-- View partition sizes
SELECT 
    TABLE_NAME,
    PARTITION_NAME,
    PARTITION_METHOD,
    PARTITION_EXPRESSION,
    TABLE_ROWS,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS data_size_mb,
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS index_size_mb,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS total_size_mb,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.PARTITIONS
WHERE TABLE_SCHEMA = 'obe_system'
AND PARTITION_NAME IS NOT NULL
ORDER BY TABLE_NAME, PARTITION_ORDINAL_POSITION;

-- Check partition row distribution
SELECT 
    TABLE_NAME,
    PARTITION_NAME,
    TABLE_ROWS,
    ROUND(TABLE_ROWS * 100.0 / SUM(TABLE_ROWS) OVER (PARTITION BY TABLE_NAME), 2) AS percentage
FROM information_schema.PARTITIONS
WHERE TABLE_SCHEMA = 'obe_system'
AND PARTITION_NAME IS NOT NULL
ORDER BY TABLE_NAME, PARTITION_ORDINAL_POSITION;

-- =====================================================
-- MAINTENANCE TASKS
-- =====================================================

-- Analyze partitions for better query optimization
ALTER TABLE audit_logs ANALYZE PARTITION ALL;
ALTER TABLE sessions ANALYZE PARTITION ALL;
ALTER TABLE student_assessment_marks ANALYZE PARTITION ALL;
ALTER TABLE notifications ANALYZE PARTITION ALL;

-- Optimize partitions (rebuilds and defragments)
ALTER TABLE audit_logs OPTIMIZE PARTITION ALL;

-- Check partition integrity
ALTER TABLE audit_logs CHECK PARTITION ALL;

-- Rebuild specific partition
ALTER TABLE audit_logs REBUILD PARTITION p_2024_01;

-- =====================================================
-- BEST PRACTICES & RECOMMENDATIONS
-- =====================================================

/*
1. PARTITION KEY SELECTION:
   - Use columns frequently used in WHERE clauses
   - Should be part of primary key or unique index
   - Choose stable columns that don't change frequently

2. PARTITION STRATEGY:
   - RANGE: For time-series data (dates, timestamps)
   - LIST: For discrete values (status, categories)
   - HASH: For even distribution across partitions
   - KEY: Similar to HASH but uses MySQL's hashing

3. PARTITION COUNT:
   - Don't over-partition (too many small partitions is inefficient)
   - Recommended: 50-100 partitions maximum
   - Each partition should have reasonable size (1-10 GB)

4. MAINTENANCE:
   - Regularly add new partitions for growing tables
   - Archive and drop old partitions to save space
   - Analyze partitions after significant data changes
   - Monitor partition sizes and row distribution

5. QUERY OPTIMIZATION:
   - Always include partition key in WHERE clause
   - Use EXPLAIN PARTITIONS to verify partition pruning
   - Test queries before and after partitioning

6. BACKUP CONSIDERATIONS:
   - Can backup/restore individual partitions
   - Faster backup of recent data partitions
   - Test recovery procedures regularly

7. LIMITATIONS:
   - Foreign keys must include partition key
   - Full-text indexes not supported
   - Spatial indexes not supported in some versions
   - Maximum 8192 partitions per table
*/

-- =====================================================
-- ROLLBACK PARTITIONING (IF NEEDED)
-- =====================================================

-- Remove partitioning from a table
-- ALTER TABLE audit_logs REMOVE PARTITIONING;
-- ALTER TABLE sessions REMOVE PARTITIONING;

SELECT 'Table partitioning configuration completed!' AS status;
