-- Migration: Create program_plo_attainment_summary table
-- Description: Summary of PLO attainment for entire program
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS program_plo_attainment_summary (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to degree program',
    program_learning_outcome_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to PLO',
    academic_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to academic session',
    total_students INT NOT NULL COMMENT 'Total number of students assessed',
    students_attained INT NOT NULL COMMENT 'Number of students who attained target',
    attainment_percentage DECIMAL(5,2) NOT NULL COMMENT 'Overall attainment percentage',
    direct_attainment DECIMAL(5,2) NULL COMMENT 'Direct assessment attainment percentage',
    indirect_attainment DECIMAL(5,2) NULL COMMENT 'Indirect assessment attainment percentage',
    is_target_met BOOLEAN DEFAULT FALSE COMMENT 'Whether target attainment was met',
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When summary was calculated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_program_plo_summary_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_program_plo_summary_plo FOREIGN KEY (program_learning_outcome_id) 
        REFERENCES program_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_program_plo_summary_session FOREIGN KEY (academic_session_id) 
        REFERENCES academic_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_program_plo_total_students CHECK (total_students >= 0),
    CONSTRAINT chk_program_plo_students_attained CHECK (students_attained >= 0 AND students_attained <= total_students),
    CONSTRAINT chk_program_plo_att_percentage CHECK (attainment_percentage >= 0 AND attainment_percentage <= 100),
    CONSTRAINT chk_program_plo_direct_att CHECK (direct_attainment IS NULL OR (direct_attainment >= 0 AND direct_attainment <= 100)),
    CONSTRAINT chk_program_plo_indirect_att CHECK (indirect_attainment IS NULL OR (indirect_attainment >= 0 AND indirect_attainment <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Program-level PLO attainment summary';

-- Indexes for performance
CREATE INDEX idx_program_plo_summary_degree_plo_session ON program_plo_attainment_summary(degree_id, program_learning_outcome_id, academic_session_id);
CREATE INDEX idx_program_plo_summary_degree ON program_plo_attainment_summary(degree_id);
CREATE INDEX idx_program_plo_summary_plo ON program_plo_attainment_summary(program_learning_outcome_id);
CREATE INDEX idx_program_plo_summary_session ON program_plo_attainment_summary(academic_session_id);
CREATE INDEX idx_program_plo_summary_target_met ON program_plo_attainment_summary(is_target_met);
CREATE INDEX idx_program_plo_summary_calculated ON program_plo_attainment_summary(calculated_at);
