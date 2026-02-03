-- Migration: Create faculties table
-- Description: Stores faculty information with dean management

CREATE TABLE IF NOT EXISTS faculties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Faculty name',
    short_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Faculty abbreviation',
    description TEXT NULL COMMENT 'Faculty description',
    dean_id BIGINT UNSIGNED NULL COMMENT 'Current dean reference',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL COMMENT 'User who deleted',
    
    -- Indexes
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at),
    
    -- Foreign Keys (dean_id will be added after teachers table is created)
    CONSTRAINT fk_faculties_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Faculty management table';
