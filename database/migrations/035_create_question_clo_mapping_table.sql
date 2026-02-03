-- Migration: 035_create_question_clo_mapping_table
-- Description: Maps individual questions to course learning outcomes
-- Dependencies: 034_create_questions_table, 015_create_course_learning_outcomes_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS question_clo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to question',
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to CLO',
    marks_allocated DECIMAL(6,2) NOT NULL COMMENT 'Marks allocated to this CLO from this question',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_question_clo_mapping_question 
        FOREIGN KEY (question_id) REFERENCES questions(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_question_clo_mapping_clo 
        FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_qcm_marks_allocated CHECK (marks_allocated >= 0),
    
    -- Unique constraint to prevent duplicate mappings
    CONSTRAINT uk_question_clo UNIQUE (question_id, course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps questions to CLOs for granular attainment tracking';

-- Indexes
CREATE INDEX idx_question ON question_clo_mapping(question_id);
CREATE INDEX idx_clo ON question_clo_mapping(course_learning_outcome_id);
