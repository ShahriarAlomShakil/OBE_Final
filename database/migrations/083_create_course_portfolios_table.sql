-- Migration: Create course_portfolios table
-- Description: Manages course portfolio/file documentation for accreditation

CREATE TABLE course_portfolios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Course offering reference',
    academic_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Academic session reference',
    version INT DEFAULT 1 COMMENT 'Portfolio version',
    status ENUM('draft','submitted','approved','archived') DEFAULT 'draft' COMMENT 'Portfolio status',
    submitted_by BIGINT UNSIGNED NULL COMMENT 'Teacher who submitted',
    submitted_at TIMESTAMP NULL COMMENT 'Submission timestamp',
    approved_by BIGINT UNSIGNED NULL COMMENT 'User who approved',
    approved_at TIMESTAMP NULL COMMENT 'Approval timestamp',
    approval_comments TEXT NULL COMMENT 'Approval comments',
    folder_path VARCHAR(500) NULL COMMENT 'Folder path for portfolio files',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_portfolio_offering 
        FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_portfolio_session 
        FOREIGN KEY (academic_session_id) REFERENCES academic_sessions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_portfolio_submitted 
        FOREIGN KEY (submitted_by) REFERENCES teachers(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_portfolio_approved 
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_offering (course_offering_id),
    INDEX idx_session (academic_session_id),
    INDEX idx_offering_session (course_offering_id, academic_session_id),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Manages course portfolio/file documentation for accreditation';
