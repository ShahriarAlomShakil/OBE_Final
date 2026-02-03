-- Migration: Create courses table
-- Description: Stores course information with version control and approval workflow

CREATE TABLE courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_title VARCHAR(500) NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    degree_id BIGINT UNSIGNED NOT NULL,
    credit DECIMAL(3,1) NOT NULL,
    contact_hour_per_week DECIMAL(4,1) NOT NULL,
    theory_credit DECIMAL(3,1) DEFAULT 0,
    lab_credit DECIMAL(3,1) DEFAULT 0,
    level VARCHAR(20) NULL COMMENT 'Level (1, 2, 3, 4)',
    semester VARCHAR(20) NULL COMMENT 'Semester (1, 2)',
    course_type ENUM('theory','lab','project','thesis') NOT NULL,
    elective_type ENUM('core','major_elective','general_elective','minor') NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    prerequisites TEXT NULL COMMENT 'Prerequisite course codes',
    summary TEXT NULL COMMENT 'Course summary',
    version INT DEFAULT 1,
    status ENUM('draft','pending_approval','approved','archived') DEFAULT 'draft',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT UNSIGNED NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_courses_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_courses_degree FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_courses_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_courses_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course_code (course_code),
    INDEX idx_dept_degree (department_id, degree_id),
    INDEX idx_status (status, is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores course information with version control and approval workflow';
