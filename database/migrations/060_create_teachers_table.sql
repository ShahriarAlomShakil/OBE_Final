-- Migration: Create teachers table
-- Description: Stores teacher/faculty member information

CREATE TABLE teachers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    faculty_id BIGINT UNSIGNED NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    designation_id BIGINT UNSIGNED NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Employee/Faculty ID',
    joining_date DATE NOT NULL,
    specialization VARCHAR(255) NULL COMMENT 'Area of specialization',
    qualification VARCHAR(255) NULL COMMENT 'Highest degree obtained',
    research_interests TEXT NULL COMMENT 'Research areas and interests',
    career_obj TEXT NULL COMMENT 'Career objectives',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT UNSIGNED NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_teachers_faculty FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_teachers_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_teachers_designation FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_teachers_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_employee_id (employee_id),
    INDEX idx_dept_active (department_id, is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores teacher/faculty member information';
