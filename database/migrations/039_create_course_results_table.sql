-- Migration: Create course_results table
-- Description: Stores final course results for students

CREATE TABLE course_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to students table',
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to course_offerings table',
    total_marks_obtained DECIMAL(6,2) NOT NULL COMMENT 'Total marks obtained',
    total_marks DECIMAL(6,2) NOT NULL COMMENT 'Total marks for the course',
    percentage DECIMAL(5,2) NOT NULL COMMENT 'Percentage obtained',
    grade_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to grade_points table',
    grade_point DECIMAL(3,2) NOT NULL COMMENT 'Grade point value',
    letter_grade VARCHAR(5) NOT NULL COMMENT 'Letter grade (A+, A, etc.)',
    credit_earned DECIMAL(3,1) DEFAULT 0 COMMENT 'Credits earned',
    is_pass BOOLEAN DEFAULT TRUE COMMENT 'Whether student passed',
    result_type ENUM('regular', 'improvement', 'retake') DEFAULT 'regular' COMMENT 'Type of result',
    published_at TIMESTAMP NULL COMMENT 'When result was published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_course_results_student 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_course_results_offering 
        FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_course_results_grade 
        FOREIGN KEY (grade_id) 
        REFERENCES grade_points(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_course_marks_valid 
        CHECK (total_marks_obtained >= 0 AND total_marks_obtained <= total_marks),
    
    CONSTRAINT chk_course_percentage_valid 
        CHECK (percentage >= 0 AND percentage <= 100),
    
    CONSTRAINT chk_course_grade_point_valid 
        CHECK (grade_point >= 0 AND grade_point <= 4.00),
    
    CONSTRAINT chk_course_credit_earned_valid 
        CHECK (credit_earned >= 0),
    
    -- Indexes
    INDEX idx_student (student_id),
    INDEX idx_offering (course_offering_id),
    INDEX idx_grade (grade_id),
    INDEX idx_offering_published (course_offering_id, published_at),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_published_at (published_at),
    INDEX idx_result_type (result_type),
    
    -- Unique constraint: One result per student per offering per type
    UNIQUE KEY uk_student_offering_type (student_id, course_offering_id, result_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores final course results for students';

-- Note: Partitioning is commented out because MySQL doesn't support foreign keys with partitioning
-- To enable partitioning, remove foreign key constraints or use triggers for referential integrity
-- PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027),
--     PARTITION p2027 VALUES LESS THAN (2028),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );
