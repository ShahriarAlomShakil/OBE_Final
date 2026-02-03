-- Migration: Create accreditation_bodies table
-- Description: Stores accreditation bodies (ABET, NBA, etc.) for program accreditation

CREATE TABLE accreditation_bodies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Accreditation body name',
    acronym VARCHAR(50) NOT NULL COMMENT 'Short form (e.g., ABET, NBA)',
    country VARCHAR(100) NULL COMMENT 'Country of origin',
    website VARCHAR(500) NULL COMMENT 'Official website URL',
    description TEXT NULL COMMENT 'Description of the body',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes
    INDEX idx_acronym (acronym),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores accreditation bodies (ABET, NBA, etc.) for program accreditation';
