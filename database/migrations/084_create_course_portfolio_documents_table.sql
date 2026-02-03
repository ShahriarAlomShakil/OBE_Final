-- Migration: Create course_portfolio_documents table
-- Description: Stores individual documents within course portfolios

CREATE TABLE course_portfolio_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_portfolio_id BIGINT UNSIGNED NOT NULL COMMENT 'Course portfolio reference',
    document_type VARCHAR(100) NOT NULL COMMENT 'Document type (syllabus, lesson_plan, assessment, etc.)',
    document_name VARCHAR(255) NOT NULL COMMENT 'Document name',
    file_path VARCHAR(500) NOT NULL COMMENT 'File path',
    file_size BIGINT NULL COMMENT 'File size in bytes',
    mime_type VARCHAR(100) NULL COMMENT 'MIME type',
    version INT DEFAULT 1 COMMENT 'Document version',
    uploaded_by BIGINT UNSIGNED NULL COMMENT 'User who uploaded',
    description TEXT NULL COMMENT 'Document description',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_portfolio_doc_portfolio 
        FOREIGN KEY (course_portfolio_id) REFERENCES course_portfolios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_portfolio_doc_user 
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_portfolio (course_portfolio_id),
    INDEX idx_portfolio_type (course_portfolio_id, document_type),
    INDEX idx_document_type (document_type),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores individual documents within course portfolios';
