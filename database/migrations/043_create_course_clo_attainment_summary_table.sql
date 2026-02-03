-- Migration: Create course_clo_attainment_summary table
-- Description: Summary of CLO attainment for entire course offering
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS course_clo_attainment_summary (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to course offering',
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to CLO',
    total_students INT NOT NULL COMMENT 'Total number of students assessed',
    students_attained INT NOT NULL COMMENT 'Number of students who attained target',
    attainment_percentage DECIMAL(5,2) NOT NULL COMMENT 'Overall attainment percentage',
    average_score DECIMAL(5,2) NOT NULL COMMENT 'Average score across all students',
    is_target_met BOOLEAN DEFAULT FALSE COMMENT 'Whether target attainment was met',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When summary was calculated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_course_clo_summary_offering FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_clo_summary_clo FOREIGN KEY (course_learning_outcome_id) 
        REFERENCES course_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique Constraint: One summary per offering-CLO combination
    CONSTRAINT uq_offering_clo_summary UNIQUE (course_offering_id, course_learning_outcome_id),
    
    -- Check Constraints
    CONSTRAINT chk_course_clo_total_students CHECK (total_students >= 0),
    CONSTRAINT chk_course_clo_students_attained CHECK (students_attained >= 0 AND students_attained <= total_students),
    CONSTRAINT chk_course_clo_att_percentage CHECK (attainment_percentage >= 0 AND attainment_percentage <= 100),
    CONSTRAINT chk_course_clo_avg_score CHECK (average_score >= 0 AND average_score <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Course-level CLO attainment summary';

-- Indexes for performance
CREATE INDEX idx_course_clo_summary_offering ON course_clo_attainment_summary(course_offering_id);
CREATE INDEX idx_course_clo_summary_clo ON course_clo_attainment_summary(course_learning_outcome_id);
CREATE INDEX idx_course_clo_summary_target_met ON course_clo_attainment_summary(is_target_met);
CREATE INDEX idx_course_clo_summary_calculated ON course_clo_attainment_summary(calculated_at);
