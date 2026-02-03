-- Migration: Create curriculum_revisions table
-- Description: Tracks curriculum change history for degree programs

CREATE TABLE curriculum_revisions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    revision_number VARCHAR(50) NOT NULL COMMENT 'Revision number/identifier',
    effective_from_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Effective from session',
    revision_type ENUM('minor','major','restructure') NULL COMMENT 'Revision type',
    reason_for_change TEXT NULL COMMENT 'Reason for curriculum change',
    changes_summary TEXT NULL COMMENT 'Summary of changes',
    approved_by BIGINT UNSIGNED NULL COMMENT 'Approver reference',
    approved_date DATE NULL COMMENT 'Approval date',
    document_path VARCHAR(500) NULL COMMENT 'Revision document path',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_curriculum_revision_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_curriculum_revision_session 
        FOREIGN KEY (effective_from_session_id) REFERENCES academic_sessions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_curriculum_revision_approver 
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_degree (degree_id),
    INDEX idx_degree_session (degree_id, effective_from_session_id),
    INDEX idx_revision_type (revision_type),
    INDEX idx_session (effective_from_session_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks curriculum change history for degree programs';
