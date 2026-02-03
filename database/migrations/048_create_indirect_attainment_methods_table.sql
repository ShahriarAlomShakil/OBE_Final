-- Migration: Create indirect_attainment_methods table
-- Description: Defines indirect assessment methods used for attainment calculation
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS indirect_attainment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to degree program',
    method_name VARCHAR(255) NOT NULL COMMENT 'Name of the indirect assessment method',
    description TEXT NULL COMMENT 'Detailed description of the method',
    weight_percentage DECIMAL(5,2) DEFAULT 20.00 COMMENT 'Weight percentage in attainment calculation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_indirect_method_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_indirect_method_weight CHECK (weight_percentage > 0 AND weight_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Indirect assessment methods for attainment calculation';

-- Indexes for performance
CREATE INDEX idx_indirect_method_degree ON indirect_attainment_methods(degree_id);
CREATE INDEX idx_indirect_method_name ON indirect_attainment_methods(method_name);
