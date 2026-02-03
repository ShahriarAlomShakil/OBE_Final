-- Migration: Create plo_accreditation_mapping table
-- Description: Maps Program Learning Outcomes (PLOs) to accreditation criteria

CREATE TABLE plo_accreditation_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'PLO reference',
    accreditation_criterion_id BIGINT UNSIGNED NOT NULL COMMENT 'Accreditation criterion reference',
    mapping_strength ENUM('full','partial','supportive') DEFAULT 'full' COMMENT 'Mapping strength level',
    justification TEXT NULL COMMENT 'Justification for the mapping',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_plo_accred_plo 
        FOREIGN KEY (program_learning_outcome_id) REFERENCES program_learning_outcomes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_plo_accred_criterion 
        FOREIGN KEY (accreditation_criterion_id) REFERENCES accreditation_criteria(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique Constraint
    UNIQUE KEY unique_plo_criterion (program_learning_outcome_id, accreditation_criterion_id),
    
    -- Indexes
    INDEX idx_plo (program_learning_outcome_id),
    INDEX idx_criterion (accreditation_criterion_id),
    INDEX idx_strength (mapping_strength)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps Program Learning Outcomes (PLOs) to accreditation criteria';
