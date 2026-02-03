# MySQL Database Setup Instructions

## Current Status
✅ `.env` file has been updated with `DB_PASSWORD=StrongPasswordHere`  
⚠️  MySQL root password needs verification

## Option 1: If You Know Your MySQL Root Password

Run this command and enter your actual MySQL root password when prompted:

```bash
cd /home/shakil/Projects/Outcome_Based_Education_Project
mysql -u root -p < database/manual-setup.sql
```

Then test the connection:
```bash
cd obe-system/backend && node -e "require('./config/database').testConnection()"
```

## Option 2: If You Don't Remember MySQL Root Password

### Reset MySQL Root Password:

1. **Stop MySQL:**
   ```bash
   sudo systemctl stop mysql
   ```

2. **Start MySQL in safe mode:**
   ```bash
   sudo mysqld_safe --skip-grant-tables &
   ```

3. **Login without password:**
   ```bash
   mysql -u root
   ```

4. **Reset root password:**
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newrootpassword';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Restart MySQL normally:**
   ```bash
   sudo killall mysqld
   sudo systemctl start mysql
   ```

6. **Now run the setup:**
   ```bash
   mysql -u root -p < database/manual-setup.sql
   ```

## Option 3: Manual SQL Execution

1. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Copy and paste these commands:**
   ```sql
   CREATE DATABASE IF NOT EXISTS obe_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'obe_user'@'localhost' IDENTIFIED BY 'StrongPasswordHere';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, TRIGGER, REFERENCES ON obe_system.* TO 'obe_user'@'localhost';
   FLUSH PRIVILEGES;
   SHOW DATABASES LIKE 'obe_system';
   SELECT User, Host FROM mysql.user WHERE User = 'obe_user';
   EXIT;
   ```

3. **Test the connection:**
   ```bash
   cd /home/shakil/Projects/Outcome_Based_Education_Project/obe-system/backend
   node -e "require('./config/database').testConnection()"
   ```

## Verification

After setup, you should see:
- ✅ Database `obe_system` exists
- ✅ User `obe_user` exists with proper privileges
- ✅ Connection test succeeds

## Files Updated
- ✅ `obe-system/backend/.env` - DB_PASSWORD set to StrongPasswordHere
- ✅ `database/manual-setup.sql` - Ready to execute
- ✅ `database/setup.sql` - Alternative setup script
- ✅ `database/README.md` - Complete documentation

## Need Help?

Check MySQL service status:
```bash
sudo systemctl status mysql
```

View MySQL error log:
```bash
sudo tail -50 /var/log/mysql/error.log
```
