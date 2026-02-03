-- Migration: Create attainment_thresholds table
-- Description: Defines attainment thresholds for CLOs and PLOs per degree program
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS attainment_thresholds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to degree program',
    threshold_type ENUM('clo','plo') NOT NULL COMMENT 'Type of threshold: CLO or PLO',
    minimum_percentage DECIMAL(5,2) DEFAULT 60.00 COMMENT 'Minimum attainment percentage',
    target_percentage DECIMAL(5,2) DEFAULT 75.00 COMMENT 'Target attainment percentage',
    excellence_percentage DECIMAL(5,2) DEFAULT 85.00 COMMENT 'Excellence attainment percentage',
    effective_from_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Effective from academic session',
    effective_to_session_id BIGINT UNSIGNED NULL COMMENT 'Effective to academic session (NULL = ongoing)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_att_threshold_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_att_threshold_from_session FOREIGN KEY (effective_from_session_id) 
        REFERENCES academic_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_att_threshold_to_session FOREIGN KEY (effective_to_session_id) 
        REFERENCES academic_sessions(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_att_threshold_minimum CHECK (minimum_percentage >= 0 AND minimum_percentage <= 100),
    CONSTRAINT chk_att_threshold_target CHECK (target_percentage >= minimum_percentage AND target_percentage <= 100),
    CONSTRAINT chk_att_threshold_excellence CHECK (excellence_percentage >= target_percentage AND excellence_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Attainment threshold definitions for CLOs and PLOs';

-- Indexes for performance
CREATE INDEX idx_att_threshold_degree_type ON attainment_thresholds(degree_id, threshold_type);
CREATE INDEX idx_att_threshold_degree ON attainment_thresholds(degree_id);
CREATE INDEX idx_att_threshold_effective_from ON attainment_thresholds(effective_from_session_id);
CREATE INDEX idx_att_threshold_effective_to ON attainment_thresholds(effective_to_session_id);
