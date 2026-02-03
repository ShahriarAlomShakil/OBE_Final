-- Migration: Create sessions table
-- Created: 2026-02-03
-- Description: Session management table for tracking active user sessions with security features

-- Drop table if exists (for rollback)
-- DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY COMMENT 'Unique session identifier (session ID)',
    
    -- User Information
    user_id BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Reference to authenticated user (NULL for guest sessions)',
    
    -- Security & Tracking
    ip_address VARCHAR(45) NULL DEFAULT NULL COMMENT 'IPv4 or IPv6 address of the client',
    user_agent TEXT NULL DEFAULT NULL COMMENT 'Browser user agent string for device tracking',
    
    -- Session Data
    payload LONGTEXT NOT NULL COMMENT 'Serialized session data (encrypted)',
    last_activity INT UNSIGNED NOT NULL COMMENT 'Unix timestamp of last session activity',
    
    -- Foreign Keys
    CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_user_id (user_id) COMMENT 'Fast lookup by user',
    INDEX idx_last_activity (last_activity) COMMENT 'Cleanup expired sessions efficiently'
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='Active session tracking and management table';

-- Comments for documentation
-- Note: ip_address supports both IPv4 (15 chars) and IPv6 (45 chars) addresses
-- Note: last_activity is stored as Unix timestamp for efficient comparison and cleanup
-- Note: payload contains serialized session data (should be encrypted in application layer)
-- Note: Sessions are automatically deleted when user is deleted (CASCADE)
-- Note: Guest sessions have user_id = NULL
-- Note: Use last_activity index for periodic cleanup of expired sessions
