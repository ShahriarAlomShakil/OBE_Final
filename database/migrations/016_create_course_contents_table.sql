-- Migration: Create course_contents table
-- Description: Stores detailed course content topics with teaching and assessment strategies

CREATE TABLE course_contents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    topic_number INT NOT NULL COMMENT 'Topic sequence',
    content TEXT NOT NULL COMMENT 'Content detail',
    teaching_strategy VARCHAR(255) NULL COMMENT 'Teaching methods',
    assessment_strategy VARCHAR(255) NULL COMMENT 'Assessment methods',
    duration_hours DECIMAL(4,1) NULL COMMENT 'Hours allocated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_course_contents_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course_topic (course_id, topic_number),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores detailed course content topics with teaching and assessment strategies';
