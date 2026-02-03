-- Migration: 033_create_rubric_levels_table
-- Description: Creates rubric_levels table to define performance levels for each criterion
-- Dependencies: 032_create_rubric_criteria_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS rubric_levels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rubric_criteria_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to parent criterion',
    level_name VARCHAR(100) NOT NULL COMMENT 'Level name (e.g., Excellent, Good, Fair, Poor)',
    description TEXT NULL COMMENT 'Detailed description of this level',
    points DECIMAL(5,2) NOT NULL COMMENT 'Points awarded for this level',
    display_order INT DEFAULT 1 COMMENT 'Display order in criterion',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_rubric_levels_criteria 
        FOREIGN KEY (rubric_criteria_id) REFERENCES rubric_criteria(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_points CHECK (points >= 0),
    CONSTRAINT chk_rl_display_order CHECK (display_order > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Defines performance levels for each rubric criterion';

-- Indexes
CREATE INDEX idx_criteria_order ON rubric_levels(rubric_criteria_id, display_order);
CREATE INDEX idx_deleted_at ON rubric_levels(deleted_at);
