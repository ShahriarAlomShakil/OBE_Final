-- Migration: Create password_reset_tokens table
-- Created: 2026-02-03
-- Description: Password reset token management with expiration tracking

-- Drop table if exists (for rollback)
-- DROP TABLE IF EXISTS password_reset_tokens;

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY COMMENT 'User email address',
    
    -- Token Information
    token VARCHAR(255) NOT NULL COMMENT 'Hashed password reset token',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Token creation time',
    expires_at TIMESTAMP NOT NULL COMMENT 'Token expiration time',
    
    -- Indexes for Performance
    INDEX idx_token (token) COMMENT 'Fast token lookup',
    INDEX idx_expires_at (expires_at) COMMENT 'Efficient cleanup of expired tokens'
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='Password reset token storage with expiration';

-- Comments for documentation
-- Note: Email is the primary key (one active token per email)
-- Note: Token should be hashed before storage for security
-- Note: expires_at typically set to created_at + 1 hour
-- Note: Expired tokens should be cleaned up periodically (cron job)
-- Note: On password reset success, delete the token immediately