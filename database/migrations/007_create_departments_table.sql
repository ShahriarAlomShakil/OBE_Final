-- Migration: Create departments table
-- Description: Stores department information with HOD management

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Department name',
    dept_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Department code',
    faculty_id BIGINT UNSIGNED NOT NULL COMMENT 'Parent faculty',
    hod_id BIGINT UNSIGNED NULL COMMENT 'Head of department',
    description TEXT NULL COMMENT 'Department description',
    established_year YEAR NULL COMMENT 'Year established',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL COMMENT 'User who deleted',
    
    -- Indexes
    INDEX idx_dept_code (dept_code),
    INDEX idx_faculty_active (faculty_id, is_active),
    INDEX idx_deleted_at (deleted_at),
    
    -- Foreign Keys
    CONSTRAINT fk_departments_faculty FOREIGN KEY (faculty_id) 
        REFERENCES faculties(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_departments_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
    -- hod_id foreign key will be added after teachers table is created
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Department management table';
