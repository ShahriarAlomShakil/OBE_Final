-- Migration: 029_create_assessment_components_table
-- Description: Creates assessment_components table to store individual assessments for course offerings
-- Dependencies: 012_create_course_offerings_table, 028_create_assessment_types_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS assessment_components (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to course offering',
    assessment_type_id BIGINT UNSIGNED NOT NULL COMMENT 'Type of assessment',
    name VARCHAR(255) NOT NULL COMMENT 'Component name (e.g., Midterm 1, Quiz 2)',
    total_marks DECIMAL(6,2) NOT NULL COMMENT 'Total marks for this assessment',
    weight_percentage DECIMAL(5,2) NOT NULL COMMENT 'Weight percentage in final grade',
    scheduled_date DATE NULL COMMENT 'Scheduled date for assessment',
    duration_minutes INT NULL COMMENT 'Duration in minutes',
    instructions TEXT NULL COMMENT 'Instructions for students',
    is_published BOOLEAN DEFAULT FALSE COMMENT 'Whether results are published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_assessment_components_course_offering 
        FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assessment_components_type 
        FOREIGN KEY (assessment_type_id) REFERENCES assessment_types(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_total_marks CHECK (total_marks >= 0),
    CONSTRAINT chk_weight_percentage CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    CONSTRAINT chk_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores assessment components for each course offering';

-- Indexes
CREATE INDEX idx_offering_date ON assessment_components(course_offering_id, scheduled_date);
CREATE INDEX idx_type ON assessment_components(assessment_type_id);
CREATE INDEX idx_is_published ON assessment_components(is_published);
CREATE INDEX idx_deleted_at ON assessment_components(deleted_at);
