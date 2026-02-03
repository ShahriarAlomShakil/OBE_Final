-- Migration: Create academic_sessions table
-- Description: Stores academic session information

CREATE TABLE IF NOT EXISTS academic_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Session name e.g., 2024-2025',
    start_date DATE NOT NULL COMMENT 'Session start date',
    end_date DATE NOT NULL COMMENT 'Session end date',
    is_active BOOLEAN DEFAULT FALSE COMMENT 'Active status (only one should be active)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes
    INDEX idx_is_active (is_active),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_session_name (session_name),
    
    -- Constraints
    CONSTRAINT chk_academic_sessions_dates CHECK (end_date > start_date)
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Academic session management table';
