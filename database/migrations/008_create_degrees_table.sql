-- Migration: Create degrees table
-- Description: Stores degree program information

CREATE TABLE IF NOT EXISTS degrees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Degree name',
    degree_type ENUM('bachelor','master','diploma','phd') NOT NULL COMMENT 'Degree type',
    faculty_id BIGINT UNSIGNED NOT NULL COMMENT 'Parent faculty',
    department_id BIGINT UNSIGNED NOT NULL COMMENT 'Managing department',
    total_credits DECIMAL(5,2) NOT NULL COMMENT 'Required credits',
    duration_years INT NOT NULL COMMENT 'Program duration in years',
    accreditation_status VARCHAR(100) NULL COMMENT 'Accreditation information',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL COMMENT 'User who deleted',
    
    -- Indexes
    INDEX idx_dept_active (department_id, is_active),
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_degree_type (degree_type),
    INDEX idx_deleted_at (deleted_at),
    
    -- Foreign Keys
    CONSTRAINT fk_degrees_faculty FOREIGN KEY (faculty_id) 
        REFERENCES faculties(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_degrees_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_degrees_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Degree program management table';
