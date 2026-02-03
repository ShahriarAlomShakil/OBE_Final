-- Migration: Create result_publications table
-- Description: Tracks result publication events for semesters
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS result_publications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to semester',
    publication_type ENUM('provisional','final') NOT NULL COMMENT 'Type of result publication',
    published_by BIGINT UNSIGNED NOT NULL COMMENT 'User who published the results',
    published_at TIMESTAMP NULL COMMENT 'When results were published',
    remarks TEXT NULL COMMENT 'Additional notes or comments about the publication',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_result_publications_semester FOREIGN KEY (semester_id) 
        REFERENCES semesters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_result_publications_user FOREIGN KEY (published_by) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Result publication tracking for semesters';

-- Indexes for performance
CREATE INDEX idx_result_publications_semester_type ON result_publications(semester_id, publication_type);
CREATE INDEX idx_result_publications_published_at ON result_publications(published_at);
CREATE INDEX idx_result_publications_published_by ON result_publications(published_by);
