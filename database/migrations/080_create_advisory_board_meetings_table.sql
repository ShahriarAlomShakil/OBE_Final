-- Migration: Create advisory_board_meetings table
-- Description: Records advisory board meetings and their outcomes

CREATE TABLE advisory_board_meetings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    meeting_date DATE NOT NULL COMMENT 'Meeting date',
    meeting_type VARCHAR(100) NULL COMMENT 'Meeting type (regular, special, curriculum_review)',
    agenda TEXT NULL COMMENT 'Meeting agenda',
    minutes TEXT NULL COMMENT 'Meeting minutes',
    recommendations TEXT NULL COMMENT 'Recommendations from the board',
    action_items TEXT NULL COMMENT 'Action items identified',
    next_meeting_date DATE NULL COMMENT 'Next scheduled meeting date',
    conducted_by BIGINT UNSIGNED NULL COMMENT 'Meeting conductor reference',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_board_meeting_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_board_meeting_user 
        FOREIGN KEY (conducted_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_degree (degree_id),
    INDEX idx_degree_date (degree_id, meeting_date),
    INDEX idx_meeting_date (meeting_date),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Records advisory board meetings and their outcomes';
