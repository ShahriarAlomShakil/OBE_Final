-- Migration: 069_create_system_settings_table
-- Description: Creates system_settings table for application configuration

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique setting identifier',
    setting_value TEXT NULL COMMENT 'Setting value (can be JSON)',
    setting_type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string' COMMENT 'Data type of the value',
    category VARCHAR(100) NULL COMMENT 'Setting category for grouping',
    description TEXT NULL COMMENT 'Human-readable description',
    is_public BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether setting can be accessed publicly',
    updated_by BIGINT UNSIGNED NULL COMMENT 'User who last updated this setting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_system_settings_updated_by 
        FOREIGN KEY (updated_by) REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    INDEX idx_updated_by (updated_by)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='System-wide configuration settings';

-- Add audit trigger comment
ALTER TABLE system_settings COMMENT = 'System configuration settings with audit support';
