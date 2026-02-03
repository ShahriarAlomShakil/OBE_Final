-- Migration: Create genders table
-- Created: 2026-02-03
-- Description: User gender information table
-- Dependencies: Requires users table (001_create_users_table.sql)

-- Drop table if exists (for rollback)
-- DROP TABLE IF EXISTS genders;

CREATE TABLE genders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- User Reference
    user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT 'One-to-one relationship with users table',
    
    -- Gender Information
    name ENUM('male', 'female', 'other') NOT NULL COMMENT 'Gender identification',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_genders_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='User gender information stored separately for data sensitivity';

-- Comments for documentation
-- Note: user_id has UNIQUE constraint ensuring one-to-one relationship with users table
-- Note: ON DELETE CASCADE ensures gender records are deleted when user is hard-deleted
-- Note: Separated from users table to allow for easier privacy compliance and data management
-- Note: ENUM values follow inclusive gender identification standards
-- Note: Index on name field allows for demographic reporting and analytics
