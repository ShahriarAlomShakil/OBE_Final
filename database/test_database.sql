-- ============================================
-- Database Test Script
-- ============================================
-- This script tests basic functionality of created tables

USE obe_system;

-- 1. Test basic table structure
SELECT 'Testing table existence...' AS Status;

-- Check user table structure
DESCRIBE users;

-- 2. Test insert into users table
INSERT INTO users (name, email, username, password, role)
VALUES ('Test Admin', 'admin@test.com', 'testadmin', '$2a$12$hashedpassword', 'admin');

-- Verify insert
SELECT id, name, email, username, role, created_at FROM users WHERE username = 'testadmin';

-- 3. Test faculties table  
INSERT INTO faculties (name, short_name, is_active)
VALUES ('Faculty of Engineering', 'FOE', 1);

SELECT * FROM faculties WHERE short_name = 'FOE';

-- 4. Test departments table
SET @faculty_id = (SELECT id FROM faculties WHERE short_name = 'FOE' LIMIT 1);

INSERT INTO departments (faculty_id, name, dept_code, is_active)
VALUES (@faculty_id, 'Computer Science', 'CSE', 1);

SELECT * FROM departments WHERE dept_code = 'CSE';

-- 5. Test bloom taxonomy
SELECT * FROM bloom_taxonomy_levels;

-- 6. Test system settings
SELECT category, COUNT(*) as settings_count 
FROM system_settings 
GROUP BY category;

-- 7. Show all table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
    table_rows
FROM information_schema.TABLES
WHERE table_schema = 'obe_system'
ORDER BY (data_length + index_length) DESC;

-- Cleanup test data
DELETE FROM users WHERE username = 'testadmin';
DELETE FROM departments WHERE dept_code = 'CSE';
DELETE FROM faculties WHERE short_name = 'FOE';

SELECT 'Database test completed successfully!' AS Status;
