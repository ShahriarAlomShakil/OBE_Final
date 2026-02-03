-- Migration: Create improvement_retake_records table
-- Description: Tracks improvement and retake exam records for students

CREATE TABLE improvement_retake_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to students table',
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to course_offerings table',
    original_result_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to original course result',
    attempt_number INT NOT NULL COMMENT 'Attempt number (1, 2, 3...)',
    attempt_type ENUM('improvement', 'retake') NOT NULL COMMENT 'Improvement or retake',
    attempt_semester_id BIGINT UNSIGNED NOT NULL COMMENT 'Semester when attempt was made',
    new_result_id BIGINT UNSIGNED NULL COMMENT 'Reference to new course result (if completed)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_improvement_retake_student 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_improvement_retake_offering 
        FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_improvement_retake_original_result 
        FOREIGN KEY (original_result_id) 
        REFERENCES course_results(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_improvement_retake_semester 
        FOREIGN KEY (attempt_semester_id) 
        REFERENCES semesters(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_improvement_retake_new_result 
        FOREIGN KEY (new_result_id) 
        REFERENCES course_results(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_attempt_number_positive 
        CHECK (attempt_number > 0),
    
    -- Indexes
    INDEX idx_student_course_attempt (student_id, course_offering_id, attempt_number),
    INDEX idx_student (student_id),
    INDEX idx_offering (course_offering_id),
    INDEX idx_original_result (original_result_id),
    INDEX idx_attempt_semester (attempt_semester_id),
    INDEX idx_new_result (new_result_id),
    INDEX idx_attempt_type (attempt_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks improvement and retake exam records for students';
