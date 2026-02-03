-- Migration: Create course_offerings table
-- Description: Tracks course offerings per semester with sections and enrollment management

CREATE TABLE course_offerings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    semester_id BIGINT UNSIGNED NOT NULL,
    section VARCHAR(10) NOT NULL COMMENT 'Section (A, B, C)',
    max_students INT DEFAULT 40,
    enrolled_count INT DEFAULT 0,
    classroom VARCHAR(100) NULL COMMENT 'Room assignment',
    schedule JSON NULL COMMENT 'Class schedule data',
    status ENUM('planning','open','ongoing','closed','completed') DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_course_offerings_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_offerings_semester FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint: One course offering per section per semester
    UNIQUE KEY uk_course_semester_section (course_id, semester_id, section),
    
    -- Indexes
    INDEX idx_semester_course (semester_id, course_id),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks course offerings per semester with sections and enrollment management';
