-- Migration: Create accreditation_criteria table
-- Description: Stores accreditation criteria and their hierarchy

CREATE TABLE accreditation_criteria (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    accreditation_body_id BIGINT UNSIGNED NOT NULL COMMENT 'Accreditation body reference',
    criterion_code VARCHAR(50) NOT NULL COMMENT 'Criterion code (e.g., SO1, Criterion 3)',
    criterion_name VARCHAR(255) NOT NULL COMMENT 'Criterion name',
    description TEXT NULL COMMENT 'Detailed description',
    parent_criterion_id BIGINT UNSIGNED NULL COMMENT 'Parent criterion for hierarchical structure',
    display_order INT DEFAULT 1 COMMENT 'Display order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_criteria_body 
        FOREIGN KEY (accreditation_body_id) REFERENCES accreditation_bodies(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_criteria_parent 
        FOREIGN KEY (parent_criterion_id) REFERENCES accreditation_criteria(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_body_code (accreditation_body_id, criterion_code),
    INDEX idx_parent (parent_criterion_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores accreditation criteria and their hierarchy';
