-- Migration: Create semester_results table
-- Description: Stores semester-wise academic results for students

CREATE TABLE semester_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to students table',
    semester_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to semesters table',
    total_credits_attempted DECIMAL(5,2) NOT NULL COMMENT 'Total credits attempted in semester',
    total_credits_earned DECIMAL(5,2) NOT NULL COMMENT 'Total credits earned in semester',
    semester_gpa DECIMAL(3,2) NOT NULL COMMENT 'Semester GPA',
    cgpa DECIMAL(3,2) NOT NULL COMMENT 'Cumulative GPA',
    published_at TIMESTAMP NULL COMMENT 'When result was published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_semester_results_student 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_semester_results_semester 
        FOREIGN KEY (semester_id) 
        REFERENCES semesters(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_credits_attempted_valid 
        CHECK (total_credits_attempted >= 0),
    
    CONSTRAINT chk_credits_earned_valid 
        CHECK (total_credits_earned >= 0 AND total_credits_earned <= total_credits_attempted),
    
    CONSTRAINT chk_semester_gpa_valid 
        CHECK (semester_gpa >= 0 AND semester_gpa <= 4.00),
    
    CONSTRAINT chk_cgpa_valid 
        CHECK (cgpa >= 0 AND cgpa <= 4.00),
    
    -- Indexes
    INDEX idx_student (student_id),
    INDEX idx_semester (semester_id),
    INDEX idx_semester_published (semester_id, published_at),
    INDEX idx_published_at (published_at),
    
    -- Unique constraint: One result per student per semester
    UNIQUE KEY uk_student_semester (student_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores semester-wise academic results for students';

-- Note: Partitioning is commented out because MySQL doesn't support foreign keys with partitioning
-- To enable partitioning, remove foreign key constraints or use triggers for referential integrity
-- PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027),
--     PARTITION p2027 VALUES LESS THAN (2028),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );
