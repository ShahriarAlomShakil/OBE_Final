-- Migration: Create program_learning_outcomes table
-- Description: Stores Program Learning Outcomes (PLOs) for degree programs

CREATE TABLE program_learning_outcomes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    plo_no VARCHAR(20) NOT NULL COMMENT 'PLO identifier (e.g., PLO-1, PLO-2)',
    plo_description TEXT NOT NULL COMMENT 'PLO description',
    bloom_taxonomy_level_id BIGINT UNSIGNED NOT NULL COMMENT 'Bloom taxonomy level',
    target_attainment DECIMAL(5,2) DEFAULT 60.00 COMMENT 'Target attainment percentage',
    display_order INT DEFAULT 1 COMMENT 'Display order',
    version INT DEFAULT 1 COMMENT 'Version number',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_plo_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_plo_bloom_level 
        FOREIGN KEY (bloom_taxonomy_level_id) REFERENCES bloom_taxonomy_levels(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_degree_order (degree_id, display_order),
    INDEX idx_bloom (bloom_taxonomy_level_id),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores Program Learning Outcomes (PLOs) for degree programs';
