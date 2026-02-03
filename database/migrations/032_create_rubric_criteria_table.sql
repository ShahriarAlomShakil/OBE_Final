-- Migration: 032_create_rubric_criteria_table
-- Description: Creates rubric_criteria table to define criteria for each rubric
-- Dependencies: 031_create_rubrics_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS rubric_criteria (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rubric_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to parent rubric',
    criterion_name VARCHAR(255) NOT NULL COMMENT 'Name of the criterion',
    description TEXT NULL COMMENT 'Detailed description of criterion',
    max_points DECIMAL(5,2) NOT NULL COMMENT 'Maximum points for this criterion',
    weight_percentage DECIMAL(5,2) DEFAULT 0 COMMENT 'Weight percentage in rubric',
    display_order INT DEFAULT 1 COMMENT 'Display order in rubric',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_rubric_criteria_rubric 
        FOREIGN KEY (rubric_id) REFERENCES rubrics(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_max_points CHECK (max_points > 0),
    CONSTRAINT chk_rc_weight_percentage CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    CONSTRAINT chk_display_order CHECK (display_order > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Defines criteria for each rubric';

-- Indexes
CREATE INDEX idx_rubric_order ON rubric_criteria(rubric_id, display_order);
CREATE INDEX idx_deleted_at ON rubric_criteria(deleted_at);
