-- Migration: Create student_assessment_marks table
-- Description: Stores student marks for each assessment component

CREATE TABLE student_assessment_marks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to students table',
    assessment_component_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment_components table',
    marks_obtained DECIMAL(6,2) NOT NULL COMMENT 'Marks obtained by student',
    marks_total DECIMAL(6,2) NOT NULL COMMENT 'Total marks for this assessment',
    percentage DECIMAL(5,2) NULL COMMENT 'Calculated percentage',
    is_absent BOOLEAN DEFAULT FALSE COMMENT 'Whether student was absent',
    remarks TEXT NULL COMMENT 'Additional remarks or comments',
    entered_by BIGINT UNSIGNED NOT NULL COMMENT 'User who entered the marks',
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When marks were entered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_student_assessment_marks_student 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_assessment_marks_component 
        FOREIGN KEY (assessment_component_id) 
        REFERENCES assessment_components(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_assessment_marks_entered_by 
        FOREIGN KEY (entered_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_marks_valid 
        CHECK (marks_obtained >= 0 AND marks_obtained <= marks_total),
    
    CONSTRAINT chk_percentage_valid 
        CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
    
    -- Indexes
    INDEX idx_student_assessment (student_id, assessment_component_id),
    INDEX idx_assessment_component (assessment_component_id),
    INDEX idx_entered_by (entered_by),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_entered_at (entered_at),
    
    -- Unique constraint to prevent duplicate marks entry
    UNIQUE KEY uk_student_assessment (student_id, assessment_component_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores student marks for each assessment component';

-- Add trigger to auto-calculate percentage
DELIMITER $$

CREATE TRIGGER trg_student_assessment_marks_percentage_insert
BEFORE INSERT ON student_assessment_marks
FOR EACH ROW
BEGIN
    IF NEW.marks_total > 0 THEN
        SET NEW.percentage = (NEW.marks_obtained / NEW.marks_total) * 100;
    ELSE
        SET NEW.percentage = NULL;
    END IF;
END$$

CREATE TRIGGER trg_student_assessment_marks_percentage_update
BEFORE UPDATE ON student_assessment_marks
FOR EACH ROW
BEGIN
    IF NEW.marks_total > 0 THEN
        SET NEW.percentage = (NEW.marks_obtained / NEW.marks_total) * 100;
    ELSE
        SET NEW.percentage = NULL;
    END IF;
END$$

DELIMITER ;
