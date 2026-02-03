-- Migration: 070_create_notifications_table
-- Description: Creates notifications table for user notifications

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Recipient user',
    type ENUM('email', 'in_app', 'sms') NOT NULL COMMENT 'Notification delivery type',
    title VARCHAR(255) NOT NULL COMMENT 'Notification title',
    message TEXT NULL COMMENT 'Notification message content',
    action_url VARCHAR(500) NULL COMMENT 'URL for notification action',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether notification has been read',
    read_at TIMESTAMP NULL COMMENT 'When notification was read',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When notification was created',
    
    -- Foreign Keys
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_type (type)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='User notifications (email, in-app, SMS)';

-- Add comment for partition consideration
ALTER TABLE notifications COMMENT = 
'User notifications - consider partitioning by created_at for large datasets';
