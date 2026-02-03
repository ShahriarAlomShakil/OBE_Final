-- Migration: 031_create_rubrics_table
-- Description: Creates rubrics table for rubric-based assessments
-- Dependencies: 015_create_course_learning_outcomes_table, 029_create_assessment_components_table, 001_create_users_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS rubrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_learning_outcome_id BIGINT UNSIGNED NULL COMMENT 'Associated CLO (optional)',
    assessment_component_id BIGINT UNSIGNED NULL COMMENT 'Associated assessment component (optional)',
    name VARCHAR(255) NOT NULL COMMENT 'Rubric name',
    description TEXT NULL COMMENT 'Rubric description',
    total_points DECIMAL(5,2) NOT NULL COMMENT 'Total points for this rubric',
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'User who created the rubric',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_rubrics_clo 
        FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_rubrics_assessment 
        FOREIGN KEY (assessment_component_id) REFERENCES assessment_components(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_rubrics_creator 
        FOREIGN KEY (created_by) REFERENCES users(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_total_points CHECK (total_points > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores rubrics for rubric-based assessments';

-- Indexes
CREATE INDEX idx_clo ON rubrics(course_learning_outcome_id);
CREATE INDEX idx_assessment ON rubrics(assessment_component_id);
CREATE INDEX idx_created_by ON rubrics(created_by);
CREATE INDEX idx_deleted_at ON rubrics(deleted_at);
