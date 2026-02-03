-- Migration: Create degree_attainment_methods table
-- Description: Links calculation methods to specific degree programs

CREATE TABLE degree_attainment_methods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    attainment_calculation_method_id BIGINT UNSIGNED NOT NULL COMMENT 'Calculation method reference',
    effective_from_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Effective from session',
    effective_to_session_id BIGINT UNSIGNED NULL COMMENT 'Effective to session',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_degree_method_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_degree_method_method 
        FOREIGN KEY (attainment_calculation_method_id) REFERENCES attainment_calculation_methods(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_degree_method_from_session 
        FOREIGN KEY (effective_from_session_id) REFERENCES academic_sessions(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_degree_method_to_session 
        FOREIGN KEY (effective_to_session_id) REFERENCES academic_sessions(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_degree (degree_id),
    INDEX idx_method (attainment_calculation_method_id),
    INDEX idx_degree_active (degree_id, is_active),
    INDEX idx_from_session (effective_from_session_id),
    INDEX idx_to_session (effective_to_session_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Links calculation methods to specific degree programs';
