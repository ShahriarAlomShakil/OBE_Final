-- Migration: Create employers table
-- Description: Stores employer information for feedback and engagement

CREATE TABLE employers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL COMMENT 'Company name',
    industry_sector VARCHAR(100) NULL COMMENT 'Industry sector',
    company_size VARCHAR(50) NULL COMMENT 'Company size (small, medium, large)',
    contact_person VARCHAR(255) NULL COMMENT 'Contact person name',
    email VARCHAR(255) NULL COMMENT 'Contact email',
    phone VARCHAR(50) NULL COMMENT 'Contact phone',
    address TEXT NULL COMMENT 'Company address',
    city VARCHAR(100) NULL COMMENT 'City',
    country VARCHAR(100) NULL COMMENT 'Country',
    website VARCHAR(500) NULL COMMENT 'Company website URL',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes
    INDEX idx_company_name (company_name),
    INDEX idx_sector (industry_sector),
    INDEX idx_is_active (is_active),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores employer information for feedback and engagement';
