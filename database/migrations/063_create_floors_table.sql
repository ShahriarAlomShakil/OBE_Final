-- Migration: Create floors table
-- Description: Stores floor information within buildings

CREATE TABLE floors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT UNSIGNED NOT NULL COMMENT 'Parent building',
    floor_number INT NOT NULL COMMENT 'Floor number (can be negative for basement)',
    total_rooms INT DEFAULT 0 COMMENT 'Total number of rooms on this floor',
    `usage` VARCHAR(255) NULL COMMENT 'Floor usage description',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_floors_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_building_floor (building_id, floor_number),
    INDEX idx_deleted_at (deleted_at),
    
    -- Unique constraint
    UNIQUE KEY uk_building_floor (building_id, floor_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores floor information within buildings';
