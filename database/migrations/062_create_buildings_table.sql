-- Migration: Create buildings table
-- Description: Stores building/hall information

CREATE TABLE buildings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Building name',
    building_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Building code/abbreviation',
    purpose ENUM('hall', 'academic', 'administrative', 'lab', 'library', 'other') NOT NULL COMMENT 'Building purpose',
    total_floors INT DEFAULT 0 COMMENT 'Total number of floors',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_purpose_active (purpose, is_active),
    INDEX idx_building_code (building_code),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores building/hall information';
