-- Migration: Create users table with all security fields
-- Created: 2026-02-03
-- Description: Core user authentication and profile management table with GDPR compliance

-- Drop table if exists (for rollback)
-- DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL COMMENT 'Full name of the user',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email address (unique login credential)',
    email_verified_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Email verification timestamp',
    phone VARCHAR(20) NULL DEFAULT NULL COMMENT 'Contact phone number',
    username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Username (unique login credential)',
    
    -- Authentication & Security
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    role ENUM('admin', 'dean', 'hod', 'teacher', 'student', 'staff') NOT NULL COMMENT 'User role for RBAC',
    remember_token VARCHAR(100) NULL DEFAULT NULL COMMENT 'Remember me token for persistent sessions',
    last_login_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Last successful login timestamp',
    
    -- Profile Information
    profile_image VARCHAR(500) NULL DEFAULT NULL COMMENT 'Path to profile image',
    dob DATE NULL DEFAULT NULL COMMENT 'Date of birth',
    nationality VARCHAR(100) NULL DEFAULT NULL COMMENT 'User nationality',
    nid_no VARCHAR(50) NULL DEFAULT NULL COMMENT 'National ID number',
    blood_group VARCHAR(5) NULL DEFAULT NULL COMMENT 'Blood group (A+, B+, O-, etc.)',
    
    -- Account Status & GDPR Compliance
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Account active status',
    is_pii BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Contains personally identifiable information',
    consent_given BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'User consent for data processing (GDPR)',
    consent_date TIMESTAMP NULL DEFAULT NULL COMMENT 'Date when consent was given',
    
    -- Soft Delete Support
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'User ID who performed the deletion',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_users_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role_active (role, is_active),
    INDEX idx_deleted_at (deleted_at)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='Core users table with authentication and security fields';

-- Add check constraint for email format (MySQL 8.0.16+)
ALTER TABLE users 
ADD CONSTRAINT chk_email_format 
CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$');

-- Add check constraint for username (alphanumeric and underscore only)
ALTER TABLE users 
ADD CONSTRAINT chk_username_format 
CHECK (username REGEXP '^[a-zA-Z0-9_]{3,100}$');

-- Add check constraint for phone number format
ALTER TABLE users 
ADD CONSTRAINT chk_phone_format 
CHECK (phone IS NULL OR phone REGEXP '^[0-9+\\-\\s()]{10,20}$');

-- Comments for documentation
-- Note: The deleted_by foreign key references users.id to track who performed the soft delete
-- Note: is_pii flag helps identify records containing personally identifiable information for GDPR compliance
-- Note: consent_given and consent_date track user consent for data processing (GDPR Article 6)
-- Note: Soft deletes are implemented using deleted_at timestamp (set to NULL for active records)
