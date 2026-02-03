-- Migration: Create audit_logs table
-- Description: Comprehensive audit trail for all system actions and data changes
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL COMMENT 'User who performed the action',
    action ENUM('CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL COMMENT 'Type of action performed',
    table_name VARCHAR(100) NULL COMMENT 'Database table affected',
    record_id BIGINT UNSIGNED NULL COMMENT 'ID of the affected record',
    old_values JSON NULL COMMENT 'Previous values before change',
    new_values JSON NULL COMMENT 'New values after change',
    ip_address VARCHAR(45) NULL COMMENT 'IP address of the user (IPv4/IPv6)',
    user_agent VARCHAR(500) NULL COMMENT 'Browser/client user agent string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action occurred',
    
    -- Foreign Keys
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Complete audit trail for security and compliance';

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Note: Table partitioning by created_at (yearly) should be configured separately
-- due to foreign key constraints. See manual setup documentation.
-- Example partition command (to be run manually after initial setup):
/*
ALTER TABLE audit_logs PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
*/
