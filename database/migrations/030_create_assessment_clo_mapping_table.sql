-- Migration: 030_create_assessment_clo_mapping_table
-- Description: Maps assessment components to course learning outcomes with marks allocation
-- Dependencies: 029_create_assessment_components_table, 015_create_course_learning_outcomes_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS assessment_clo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assessment_component_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment component',
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to CLO',
    marks_allocated DECIMAL(6,2) NOT NULL COMMENT 'Marks allocated to this CLO',
    weight_percentage DECIMAL(5,2) NOT NULL COMMENT 'Percentage of assessment for this CLO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_assessment_clo_mapping_component 
        FOREIGN KEY (assessment_component_id) REFERENCES assessment_components(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assessment_clo_mapping_clo 
        FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_marks_allocated CHECK (marks_allocated >= 0),
    CONSTRAINT chk_acm_weight_percentage CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    
    -- Unique constraint to prevent duplicate mappings
    CONSTRAINT uk_assessment_clo UNIQUE (assessment_component_id, course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps assessment components to CLOs with marks allocation for attainment calculation';

-- Indexes
CREATE INDEX idx_assessment_clo ON assessment_clo_mapping(assessment_component_id, course_learning_outcome_id);
CREATE INDEX idx_clo ON assessment_clo_mapping(course_learning_outcome_id);
