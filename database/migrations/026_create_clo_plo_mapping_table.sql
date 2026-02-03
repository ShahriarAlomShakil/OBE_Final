-- Migration: Create clo_plo_mapping table
-- Description: Maps Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs)

CREATE TABLE clo_plo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'CLO reference',
    program_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'PLO reference',
    mapping_level ENUM('1','2','3') NOT NULL COMMENT 'Mapping strength: 1=Low, 2=Medium, 3=High',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_clo_plo_map_clo 
        FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_clo_plo_map_plo 
        FOREIGN KEY (program_learning_outcome_id) REFERENCES program_learning_outcomes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_clo_id (course_learning_outcome_id),
    INDEX idx_plo_id (program_learning_outcome_id),
    INDEX idx_mapping_level (mapping_level),
    
    -- Unique Constraint
    UNIQUE KEY uq_clo_plo (course_learning_outcome_id, program_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps Course Learning Outcomes to Program Learning Outcomes';
