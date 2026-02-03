-- Migration: Create students table (prerequisite for course_enrollments)
-- Description: Stores complete student information including academic and residential details

CREATE TABLE students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    faculty_id BIGINT UNSIGNED NOT NULL,
    degree_id BIGINT UNSIGNED NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    hall_id BIGINT UNSIGNED NULL COMMENT 'Reference to buildings table (halls/dormitories)',
    student_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Student ID/Roll number',
    batch_year INT NOT NULL COMMENT 'Admission batch year',
    admission_date DATE NOT NULL,
    current_level VARCHAR(20) NULL COMMENT 'Current level (1, 2, 3, 4)',
    current_semester VARCHAR(20) NULL COMMENT 'Current semester (1, 2)',
    session_year INT NULL COMMENT 'Academic session year',
    residential_status ENUM('resident','non_resident') NULL COMMENT 'Residential status',
    academic_status ENUM('active','graduated','suspended','withdrawn','on_leave') DEFAULT 'active',
    graduation_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT UNSIGNED NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_students_faculty FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_students_degree FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_students_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Note: hall_id FK to buildings table will be added when buildings table is created
    CONSTRAINT fk_students_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_student_id (student_id),
    INDEX idx_dept_batch (department_id, batch_year),
    INDEX idx_status (academic_status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores complete student information';
