-- Migration: Create teacher_course table
-- Description: Maps teachers to course offerings with their roles

CREATE TABLE teacher_course (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT UNSIGNED NOT NULL,
    course_offering_id BIGINT UNSIGNED NOT NULL,
    role ENUM('instructor','co_instructor','lab_instructor','teaching_assistant') DEFAULT 'instructor' COMMENT 'Teacher role in course',
    lessons TEXT NULL COMMENT 'Lesson notes or materials',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_teacher_course_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teacher_course_offering FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_teacher_offering (teacher_id, course_offering_id),
    INDEX idx_course_offering (course_offering_id),
    
    -- Unique Constraint (one teacher can't have the same role twice in the same offering)
    UNIQUE KEY uk_teacher_offering_role (teacher_id, course_offering_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps teachers to course offerings with their roles';
