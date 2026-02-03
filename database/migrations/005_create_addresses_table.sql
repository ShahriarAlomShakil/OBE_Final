-- Migration: Create addresses table
-- Created: 2026-02-03
-- Description: User address information (present and permanent addresses)
-- Dependencies: Requires users table (001_create_users_table.sql)

-- Drop table if exists (for rollback)
-- DROP TABLE IF EXISTS addresses;

CREATE TABLE addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- User Reference
    user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT 'One-to-one relationship with users table',
    
    -- Present Address
    present_division VARCHAR(100) NULL DEFAULT NULL COMMENT 'Current administrative division',
    present_district VARCHAR(100) NULL DEFAULT NULL COMMENT 'Current district',
    present_upazilla VARCHAR(100) NULL DEFAULT NULL COMMENT 'Current upazilla/sub-district',
    present_area TEXT NULL DEFAULT NULL COMMENT 'Current detailed area/street address',
    
    -- Permanent Address
    permanent_division VARCHAR(100) NULL DEFAULT NULL COMMENT 'Permanent administrative division',
    permanent_district VARCHAR(100) NULL DEFAULT NULL COMMENT 'Permanent district',
    permanent_upazilla VARCHAR(100) NULL DEFAULT NULL COMMENT 'Permanent upazilla/sub-district',
    permanent_area TEXT NULL DEFAULT NULL COMMENT 'Permanent detailed area/street address',
    
    -- Additional Information
    permanent_district_distance DECIMAL(6,2) NULL DEFAULT NULL COMMENT 'Distance from present to permanent address in kilometers',
    
    -- Soft Delete Support
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_addresses_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_user_id (user_id)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='User address information with present and permanent addresses';

-- Add check constraint for distance (must be positive)
ALTER TABLE addresses 
ADD CONSTRAINT chk_distance_positive 
CHECK (permanent_district_distance IS NULL OR permanent_district_distance >= 0);

-- Comments for documentation
-- Note: user_id has UNIQUE constraint ensuring one-to-one relationship with users table
-- Note: ON DELETE CASCADE ensures addresses are deleted when user is hard-deleted
-- Note: All address fields are nullable as users may not provide complete information initially
-- Note: permanent_district_distance helps in understanding student mobility patterns
