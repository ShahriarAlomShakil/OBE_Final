-- Migration: Create indirect_attainment_results table
-- Description: Stores calculated indirect attainment results from survey data
-- Dependencies: surveys, program_learning_outcomes, course_learning_outcomes

CREATE TABLE IF NOT EXISTS indirect_attainment_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT UNSIGNED NOT NULL COMMENT 'Survey reference',
    program_learning_outcome_id BIGINT UNSIGNED NULL COMMENT 'PLO reference if applicable',
    course_learning_outcome_id BIGINT UNSIGNED NULL COMMENT 'CLO reference if applicable',
    average_rating DECIMAL(5,2) NOT NULL COMMENT 'Average rating from survey responses',
    attainment_percentage DECIMAL(5,2) NOT NULL COMMENT 'Calculated attainment percentage',
    total_responses INT NOT NULL COMMENT 'Number of responses used in calculation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_indirect_attainment_survey FOREIGN KEY (survey_id) 
        REFERENCES surveys(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_indirect_attainment_plo FOREIGN KEY (program_learning_outcome_id) 
        REFERENCES program_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_indirect_attainment_clo FOREIGN KEY (course_learning_outcome_id) 
        REFERENCES course_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_indirect_attainment_survey_plo (survey_id, program_learning_outcome_id),
    INDEX idx_indirect_attainment_survey_clo (survey_id, course_learning_outcome_id),
    INDEX idx_indirect_attainment_survey (survey_id),
    INDEX idx_indirect_attainment_plo (program_learning_outcome_id),
    INDEX idx_indirect_attainment_clo (course_learning_outcome_id),
    
    -- Constraints
    -- Note: Cannot use FK columns in CHECK constraints in MySQL 8.0 when FK has referential actions
    CONSTRAINT chk_indirect_attainment_percentage CHECK (
        attainment_percentage >= 0 AND attainment_percentage <= 100
    ),
    CONSTRAINT chk_indirect_attainment_rating CHECK (
        average_rating >= 0
    ),
    CONSTRAINT chk_indirect_attainment_responses CHECK (
        total_responses >= 0
    )
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Indirect attainment results calculated from survey data';
