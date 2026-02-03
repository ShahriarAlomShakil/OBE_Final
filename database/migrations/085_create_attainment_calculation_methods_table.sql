-- Migration: Create attainment_calculation_methods table
-- Description: Defines various methods for calculating CLO/PLO attainment

CREATE TABLE attainment_calculation_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Method name',
    type ENUM('clo','plo','indirect') NOT NULL COMMENT 'Attainment type',
    description TEXT NULL COMMENT 'Method description',
    formula TEXT NOT NULL COMMENT 'Calculation formula/algorithm',
    parameters JSON NULL COMMENT 'Parameters like weights, thresholds',
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Default method flag',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_by BIGINT UNSIGNED NULL COMMENT 'Creator reference',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_calc_method_creator 
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_type (type),
    INDEX idx_type_active (type, is_active),
    INDEX idx_is_default (is_default),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Defines various methods for calculating CLO/PLO attainment';
