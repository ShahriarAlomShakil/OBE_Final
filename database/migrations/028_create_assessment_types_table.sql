-- Migration: 028_create_assessment_types_table
-- Description: Creates assessment_types table to categorize different types of assessments
-- Dependencies: None
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS assessment_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Assessment type name',
    category ENUM('formative', 'summative') NOT NULL COMMENT 'Assessment category',
    description TEXT NULL COMMENT 'Description of the assessment type',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores different types of assessments (quiz, exam, assignment, etc.)';

-- Indexes
CREATE INDEX idx_is_active ON assessment_types(is_active);
CREATE INDEX idx_category ON assessment_types(category);
