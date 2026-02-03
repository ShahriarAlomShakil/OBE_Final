-- Migration: Create clo_co_mapping table
-- Description: Maps Course Learning Outcomes (CLOs) to Course Objectives (COs)

CREATE TABLE clo_co_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'CLO reference',
    course_objective_id BIGINT UNSIGNED NOT NULL COMMENT 'CO reference',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_clo_co_map_clo 
        FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_clo_co_map_co 
        FOREIGN KEY (course_objective_id) REFERENCES course_objectives(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_clo_id (course_learning_outcome_id),
    INDEX idx_co_id (course_objective_id),
    
    -- Unique Constraint
    UNIQUE KEY uq_clo_co (course_learning_outcome_id, course_objective_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps Course Learning Outcomes to Course Objectives';
