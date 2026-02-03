-- Migration: Create peo_plo_mapping table
-- Description: Maps Program Educational Objectives (PEOs) to Program Learning Outcomes (PLOs)

CREATE TABLE peo_plo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    peo_id BIGINT UNSIGNED NOT NULL COMMENT 'PEO reference',
    plo_id BIGINT UNSIGNED NOT NULL COMMENT 'PLO reference',
    correlation_level ENUM('high','medium','low') NOT NULL COMMENT 'Correlation strength',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_peo_plo_map_peo 
        FOREIGN KEY (peo_id) REFERENCES program_educational_objectives(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_peo_plo_map_plo 
        FOREIGN KEY (plo_id) REFERENCES program_learning_outcomes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_peo_id (peo_id),
    INDEX idx_plo_id (plo_id),
    INDEX idx_correlation (correlation_level),
    
    -- Unique Constraint
    UNIQUE KEY uq_peo_plo (peo_id, plo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps Program Educational Objectives to Program Learning Outcomes';
