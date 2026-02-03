-- ============================================
-- OBE System Database Setup - Step by Step
-- ============================================
-- Copy and paste these commands into MySQL command line
-- Login first with: mysql -u root -p
-- Then enter your MySQL root password when prompted
-- ============================================

-- 1. Create database
CREATE DATABASE IF NOT EXISTS obe_system 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 2. Create user with the password from prompt.txt
CREATE USER IF NOT EXISTS 'obe_user'@'localhost' 
  IDENTIFIED BY 'StrongPasswordHere';

-- 3. Grant all necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, 
      CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, 
      SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, TRIGGER, REFERENCES 
ON obe_system.* TO 'obe_user'@'localhost';

-- 4. Apply changes
FLUSH PRIVILEGES;

-- 5. Verify database was created
SHOW DATABASES LIKE 'obe_system';

-- 6. Verify user was created
SELECT User, Host FROM mysql.user WHERE User = 'obe_user';

-- 7. Verify grants
SHOW GRANTS FOR 'obe_user'@'localhost';

-- Success message
SELECT '✅ Database setup completed successfully!' AS Status;
SELECT '📝 Next: Update backend/.env with DB_PASSWORD=StrongPasswordHere' AS NextStep;
