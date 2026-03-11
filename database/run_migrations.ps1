# ============================================
# OBE System - Run All Migrations Script
# ============================================
# This script runs all database migrations in order
# Usage: .\run_migrations.ps1

param(
    [string]$DBHost = "localhost",
    [string]$DBUser = "root",
    [string]$DBName = "obe_system",
    [string]$DBPassword = ""
)

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-ErrorMsg { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warn { Write-Host $args -ForegroundColor Yellow }

Write-Info "`n============================================"
Write-Info "OBE System - Database Migration Runner"
Write-Info "============================================`n"

# Check if MySQL is installed
try {
    $mysqlVersion = mysql --version
    Write-Success "[OK] MySQL is installed: $mysqlVersion"
} catch {
    Write-ErrorMsg "[ERROR] MySQL is not installed or not in PATH"
    Write-Info "Please install MySQL and ensure it's in your system PATH"
    exit 1
}

# Prompt for password if not provided
if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Info "Please enter MySQL password for user '$DBUser':"
    $SecurePassword = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    $DBPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Test database connection
Write-Info "`nTesting database connection..."
$testResult = mysql -h $DBHost -u $DBUser -p"$DBPassword" -e "SELECT 1 as test;" $DBName 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "`n[ERROR] Cannot connect to database '$DBName'"
    Write-Warn "Error: $testResult"
    Write-Info "`nTrying to create database..."
    
    # Try to create database
    $createResult = mysql -h $DBHost -u $DBUser -p"$DBPassword" -e "CREATE DATABASE IF NOT EXISTS $DBName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "[OK] Database '$DBName' created successfully"
    } else {
        Write-ErrorMsg "[ERROR] Failed to create database. Please check your credentials."
        exit 1
    }
} else {
    Write-Success "[OK] Successfully connected to database '$DBName'"
}

# Get all migration files
$migrationPath = Join-Path $PSScriptRoot "migrations"
$migrationFiles = Get-ChildItem -Path $migrationPath -Filter "*.sql" | Sort-Object Name

Write-Info "`nFound $($migrationFiles.Count) migration files"
Write-Info "Starting migrations...`n"

# Initialize counters
$successCount = 0
$failCount = 0
$skippedCount = 0
$failedMigrations = @()

# Run each migration
foreach ($file in $migrationFiles) {
    $migrationName = $file.Name
    Write-Host "Running: $migrationName... " -NoNewline
    
    try {
        # Run migration
        $result = Get-Content $file.FullName -Raw | mysql -h $DBHost -u $DBUser -p"$DBPassword" $DBName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "[OK]"
            $successCount++
        } else {
            # Check if error is because table already exists
            if ($result -match "Table.*already exists") {
                Write-Warn "[EXISTS]"
                $skippedCount++
            } else {
                Write-ErrorMsg "[FAIL]"
                Write-Warn "  Error: $result"
                $failCount++
                $failedMigrations += @{
                    File = $migrationName
                    Error = $result
                }
            }
        }
    } catch {
        Write-ErrorMsg "[FAIL]"
        Write-Warn "  Exception: $_"
        $failCount++
        $failedMigrations += @{
            File = $migrationName
            Error = $_
        }
    }
}

# Print summary
Write-Info "`n============================================"
Write-Info "Migration Summary"
Write-Info "============================================"
Write-Success "[OK] Successful: $successCount"
Write-Warn "[EXISTS] Skipped (already exists): $skippedCount"
Write-ErrorMsg "[FAIL] Failed: $failCount"

if ($failCount -gt 0) {
    Write-Info "`nFailed Migrations:"
    foreach ($failed in $failedMigrations) {
        Write-ErrorMsg "  - $($failed.File)"
        Write-Warn "    $($failed.Error)"
    }
}

# Verify tables
Write-Info "`n============================================"
Write-Info "Verifying Database Tables"
Write-Info "============================================`n"

$tableCount = mysql -h $DBHost -u $DBUser -p"$DBPassword" -D $DBName -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE();" -N 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "[OK] Total tables created: $tableCount"
} else {
    Write-ErrorMsg "[ERROR] Could not verify tables"
}

# Show all tables
Write-Info "`nDatabase Tables:"
mysql -h $DBHost -u $DBUser -p"$DBPassword" -D $DBName -e "SHOW TABLES;"

Write-Info "`n============================================"
if ($failCount -eq 0) {
    Write-Success "[OK] All migrations completed successfully!"
} else {
    Write-Warn "[WARNING] Migrations completed with $failCount error(s)"
}
Write-Info "============================================`n"
