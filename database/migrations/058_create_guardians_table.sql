-- Migration: Create guardians table
-- Description: Stores guardian and emergency contact information for students

CREATE TABLE guardians (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL UNIQUE,
    father_name VARCHAR(255) NULL,
    father_phone VARCHAR(20) NULL,
    mother_name VARCHAR(255) NULL,
    mother_phone VARCHAR(20) NULL,
    father_nid VARCHAR(50) NULL COMMENT 'Father\'s National ID number',
    mother_nid VARCHAR(50) NULL COMMENT 'Mother\'s National ID number',
    guardian_occupation VARCHAR(255) NULL COMMENT 'Guardian\'s occupation',
    annual_income DECIMAL(12,2) NULL COMMENT 'Family annual income',
    emergency_contact_name VARCHAR(255) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    emergency_contact_relation VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_guardians_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores guardian and emergency contact information for students';
