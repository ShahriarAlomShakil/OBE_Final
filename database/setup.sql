-- ============================================
-- OBE System Database Setup Script
-- ============================================
-- This script creates the database and user with appropriate privileges
-- Run this script as MySQL root user or a user with CREATE privileges

-- Create database
CREATE DATABASE IF NOT EXISTS obe_system 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_secure_password' with actual password)
CREATE USER IF NOT EXISTS 'obe_user'@'localhost' 
  IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, 
      CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, 
      SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, TRIGGER, REFERENCES 
ON obe_system.* TO 'obe_user'@'localhost';

-- If accessing from remote host, also create:
-- CREATE USER IF NOT EXISTS 'obe_user'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, 
--       CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, 
--       SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, TRIGGER, REFERENCES 
-- ON obe_system.* TO 'obe_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES LIKE 'obe_system';

-- Verify user creation
SELECT User, Host FROM mysql.user WHERE User = 'obe_user';

-- Verify grants
SHOW GRANTS FOR 'obe_user'@'localhost';

-- Switch to the new database
USE obe_system;

-- Display success message
SELECT 'Database setup completed successfully!' AS Status;
