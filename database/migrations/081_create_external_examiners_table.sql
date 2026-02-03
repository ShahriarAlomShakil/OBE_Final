-- Migration: Create external_examiners table
-- Description: Stores external examiner information for quality assurance

CREATE TABLE external_examiners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Examiner name',
    designation VARCHAR(255) NULL COMMENT 'Professional designation',
    institution VARCHAR(255) NULL COMMENT 'Institution/organization',
    specialization VARCHAR(255) NULL COMMENT 'Area of specialization',
    email VARCHAR(255) NULL COMMENT 'Contact email',
    phone VARCHAR(50) NULL COMMENT 'Contact phone',
    country VARCHAR(100) NULL COMMENT 'Country',
    appointment_date DATE NULL COMMENT 'Appointment date',
    term_end_date DATE NULL COMMENT 'Term end date',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    cv_document_path VARCHAR(500) NULL COMMENT 'CV document path',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_institution (institution),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores external examiner information for quality assurance';
