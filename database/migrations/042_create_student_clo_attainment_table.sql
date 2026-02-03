-- Migration: Create student_clo_attainment table
-- Description: Tracks individual student attainment of Course Learning Outcomes (CLOs)
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS student_clo_attainment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to student',
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to course offering',
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to CLO',
    total_marks_obtained DECIMAL(6,2) NOT NULL COMMENT 'Total marks obtained by student for this CLO',
    total_marks_possible DECIMAL(6,2) NOT NULL COMMENT 'Total possible marks for this CLO',
    attainment_percentage DECIMAL(5,2) NOT NULL COMMENT 'Calculated attainment percentage',
    is_attained BOOLEAN DEFAULT FALSE COMMENT 'Whether target attainment was met',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When attainment was calculated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_student_clo_att_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_clo_att_offering FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_clo_att_clo FOREIGN KEY (course_learning_outcome_id) 
        REFERENCES course_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique Constraint: One record per student-offering-CLO combination
    CONSTRAINT uq_student_offering_clo UNIQUE (student_id, course_offering_id, course_learning_outcome_id),
    
    -- Check Constraints
    CONSTRAINT chk_student_clo_marks_obtained CHECK (total_marks_obtained >= 0),
    CONSTRAINT chk_student_clo_marks_possible CHECK (total_marks_possible > 0),
    CONSTRAINT chk_student_clo_percentage CHECK (attainment_percentage >= 0 AND attainment_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual student CLO attainment tracking';

-- Indexes for performance
CREATE INDEX idx_student_clo_att_offering_clo ON student_clo_attainment(course_offering_id, course_learning_outcome_id);
CREATE INDEX idx_student_clo_att_student ON student_clo_attainment(student_id);
CREATE INDEX idx_student_clo_att_is_attained ON student_clo_attainment(is_attained);
CREATE INDEX idx_student_clo_att_calculated ON student_clo_attainment(calculated_at);
