-- Migration: 071_create_email_queue_table
-- Description: Creates email_queue table for asynchronous email delivery

CREATE TABLE IF NOT EXISTS email_queue (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    to_email VARCHAR(255) NOT NULL COMMENT 'Recipient email address',
    cc_email TEXT NULL COMMENT 'CC email addresses (comma-separated)',
    bcc_email TEXT NULL COMMENT 'BCC email addresses (comma-separated)',
    subject VARCHAR(500) NOT NULL COMMENT 'Email subject',
    body TEXT NOT NULL COMMENT 'Email body (HTML or plain text)',
    template_name VARCHAR(100) NULL COMMENT 'Email template identifier',
    template_data JSON NULL COMMENT 'Template variables as JSON',
    priority INT NOT NULL DEFAULT 5 COMMENT 'Email priority (1=highest, 10=lowest)',
    status ENUM('pending', 'sending', 'sent', 'failed') NOT NULL DEFAULT 'pending' COMMENT 'Current status',
    attempts INT NOT NULL DEFAULT 0 COMMENT 'Number of send attempts',
    max_attempts INT NOT NULL DEFAULT 3 COMMENT 'Maximum retry attempts',
    error_message TEXT NULL COMMENT 'Error message if failed',
    scheduled_at TIMESTAMP NULL COMMENT 'When to send the email',
    sent_at TIMESTAMP NULL COMMENT 'When email was successfully sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When queued',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
    
    -- Indexes for queue processing
    INDEX idx_status_priority (status, priority DESC),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_status_attempts (status, attempts),
    INDEX idx_created_at (created_at),
    INDEX idx_to_email (to_email),
    
    -- Constraint checks
    CHECK (priority BETWEEN 1 AND 10),
    CHECK (attempts <= max_attempts)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Email queue for asynchronous email delivery with retry logic';

-- Add comment for cleanup consideration
ALTER TABLE email_queue COMMENT = 
'Email delivery queue - implement cleanup job for old sent/failed emails (>30 days)';
