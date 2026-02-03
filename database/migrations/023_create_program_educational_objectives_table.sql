-- Migration: Create program_educational_objectives table
-- Description: Stores Program Educational Objectives (PEOs) for degree programs

CREATE TABLE program_educational_objectives (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    peo_no VARCHAR(20) NOT NULL COMMENT 'PEO identifier (e.g., PEO-1, PEO-2)',
    peo_description TEXT NOT NULL COMMENT 'PEO description',
    display_order INT DEFAULT 1 COMMENT 'Display order',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_peo_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_degree_order (degree_id, display_order),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores Program Educational Objectives (PEOs) for degree programs';
