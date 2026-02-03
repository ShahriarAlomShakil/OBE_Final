-- Migration: Create cgpas table
-- Description: Stores cumulative GPA information for students

CREATE TABLE cgpas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL UNIQUE,
    cgpa DECIMAL(3,2) NOT NULL COMMENT 'Cumulative GPA value',
    total_credits_earned DECIMAL(5,2) NOT NULL COMMENT 'Total credits earned',
    total_credits_attempted DECIMAL(5,2) NOT NULL COMMENT 'Total credits attempted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_cgpas_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_cgpa (cgpa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores cumulative GPA information for students';
