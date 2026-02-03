-- Migration: Create student_plo_attainment table
-- Description: Tracks individual student attainment of Program Learning Outcomes (PLOs)
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS student_plo_attainment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to student',
    program_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to PLO',
    semester_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to semester',
    attainment_score DECIMAL(5,2) NOT NULL COMMENT 'Calculated attainment score',
    attainment_percentage DECIMAL(5,2) NOT NULL COMMENT 'Attainment percentage',
    is_attained BOOLEAN DEFAULT FALSE COMMENT 'Whether target attainment was met',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When attainment was calculated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_student_plo_att_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_plo_att_plo FOREIGN KEY (program_learning_outcome_id) 
        REFERENCES program_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_student_plo_att_semester FOREIGN KEY (semester_id) 
        REFERENCES semesters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_student_plo_score CHECK (attainment_score >= 0),
    CONSTRAINT chk_student_plo_percentage CHECK (attainment_percentage >= 0 AND attainment_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Individual student PLO attainment tracking';

-- Indexes for performance
CREATE INDEX idx_student_plo_att_student_plo_semester ON student_plo_attainment(student_id, program_learning_outcome_id, semester_id);
CREATE INDEX idx_student_plo_att_student ON student_plo_attainment(student_id);
CREATE INDEX idx_student_plo_att_plo ON student_plo_attainment(program_learning_outcome_id);
CREATE INDEX idx_student_plo_att_semester ON student_plo_attainment(semester_id);
CREATE INDEX idx_student_plo_att_is_attained ON student_plo_attainment(is_attained);
CREATE INDEX idx_student_plo_att_calculated ON student_plo_attainment(calculated_at);
