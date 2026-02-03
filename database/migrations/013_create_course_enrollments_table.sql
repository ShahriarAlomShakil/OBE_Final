-- Migration: Create course_enrollments table
-- Description: Manages student enrollments in course offerings

CREATE TABLE course_enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    course_offering_id BIGINT UNSIGNED NOT NULL,
    enrollment_date DATE NOT NULL,
    drop_date DATE NULL,
    status ENUM('enrolled','dropped','completed','withdrawn') DEFAULT 'enrolled',
    grade_id BIGINT UNSIGNED NULL COMMENT 'Final grade reference',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_course_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_enrollments_offering FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_enrollments_grade FOREIGN KEY (grade_id) REFERENCES grade_points(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Unique constraint: One enrollment per student per offering
    UNIQUE KEY uk_student_offering (student_id, course_offering_id),
    
    -- Indexes
    INDEX idx_student_status (student_id, status),
    INDEX idx_offering_status (course_offering_id, status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Manages student enrollments in course offerings';
