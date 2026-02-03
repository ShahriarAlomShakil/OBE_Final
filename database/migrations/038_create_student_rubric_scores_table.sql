-- Migration: Create student_rubric_scores table
-- Description: Stores rubric-based assessment scores for students

CREATE TABLE student_rubric_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to students table',
    assessment_component_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment_components table',
    rubric_criteria_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to rubric_criteria table',
    rubric_level_id BIGINT UNSIGNED NOT NULL COMMENT 'Level achieved by student',
    points_earned DECIMAL(5,2) NOT NULL COMMENT 'Points earned for this criterion',
    comments TEXT NULL COMMENT 'Evaluator comments',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_student_rubric_scores_student 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_rubric_scores_assessment 
        FOREIGN KEY (assessment_component_id) 
        REFERENCES assessment_components(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_rubric_scores_criteria 
        FOREIGN KEY (rubric_criteria_id) 
        REFERENCES rubric_criteria(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_rubric_scores_level 
        FOREIGN KEY (rubric_level_id) 
        REFERENCES rubric_levels(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_points_non_negative 
        CHECK (points_earned >= 0),
    
    -- Indexes
    INDEX idx_student_assessment_criteria (student_id, assessment_component_id, rubric_criteria_id),
    INDEX idx_student (student_id),
    INDEX idx_assessment (assessment_component_id),
    INDEX idx_criteria (rubric_criteria_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores rubric-based assessment scores for students';
