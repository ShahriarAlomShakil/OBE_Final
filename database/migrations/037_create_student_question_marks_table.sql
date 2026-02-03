-- Migration: Create student_question_marks table
-- Description: Stores student marks for individual questions

CREATE TABLE student_question_marks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to students table',
    question_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to questions table',
    marks_obtained DECIMAL(6,2) NOT NULL COMMENT 'Marks obtained for this question',
    marks_total DECIMAL(6,2) NOT NULL COMMENT 'Total marks for this question',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_student_question_marks_student 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_student_question_marks_question 
        FOREIGN KEY (question_id) 
        REFERENCES questions(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_question_marks_valid 
        CHECK (marks_obtained >= 0 AND marks_obtained <= marks_total),
    
    -- Indexes
    INDEX idx_student_question (student_id, question_id),
    INDEX idx_question (question_id),
    INDEX idx_deleted_at (deleted_at),
    
    -- Unique constraint to prevent duplicate marks entry
    UNIQUE KEY uk_student_question (student_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores student marks for individual questions';
