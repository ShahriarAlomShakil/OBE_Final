-- Migration: Create direct_attainment_methods table
-- Description: Defines direct assessment methods used for attainment calculation
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS direct_attainment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to course offering',
    method_name VARCHAR(255) NOT NULL COMMENT 'Name of the direct assessment method',
    description TEXT NULL COMMENT 'Detailed description of the method',
    weight_percentage DECIMAL(5,2) DEFAULT 100.00 COMMENT 'Weight percentage in attainment calculation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_direct_method_offering FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_direct_method_weight CHECK (weight_percentage > 0 AND weight_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Direct assessment methods for attainment calculation';

-- Indexes for performance
CREATE INDEX idx_direct_method_offering ON direct_attainment_methods(course_offering_id);
CREATE INDEX idx_direct_method_name ON direct_attainment_methods(method_name);
