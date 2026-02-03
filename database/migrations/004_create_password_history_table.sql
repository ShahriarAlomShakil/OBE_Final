-- Migration: Create password_history table
-- Created: 2026-02-03
-- Description: Track password history to prevent password reuse (security requirement)

-- Drop table if exists (for rollback)
-- DROP TABLE IF EXISTS password_history;

CREATE TABLE password_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- User Reference
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to user',
    
    -- Password Information
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password (previous password)',
    
    -- Timestamp
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When password was changed',
    
    -- Foreign Keys
    CONSTRAINT fk_password_history_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_user_id (user_id) COMMENT 'Fast lookup by user'
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='Password history tracking to prevent password reuse';

-- Comments for documentation
-- Note: Store last 5-10 passwords per user (configurable)
-- Note: When user changes password, add old password to this table
-- Note: Before accepting new password, check against this table
-- Note: Automatically deleted when user is deleted (CASCADE)
-- Note: Consider retention policy (e.g., keep last 5 passwords or 1 year history)