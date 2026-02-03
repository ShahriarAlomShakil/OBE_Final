-- Migration: Create course_learning_outcomes table
-- Description: Stores Course Learning Outcomes (CLOs) mapped to Bloom's Taxonomy

CREATE TABLE course_learning_outcomes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    clo_id VARCHAR(20) NOT NULL COMMENT 'CLO identifier (e.g., CLO1, CLO2)',
    clo_description TEXT NOT NULL,
    bloom_taxonomy_level_id BIGINT UNSIGNED NOT NULL,
    weight_percentage DECIMAL(5,2) DEFAULT 0 COMMENT 'CLO weight percentage',
    target_attainment DECIMAL(5,2) DEFAULT 60.00 COMMENT 'Target attainment percentage',
    display_order INT DEFAULT 1,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_course_learning_outcomes_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_learning_outcomes_bloom FOREIGN KEY (bloom_taxonomy_level_id) REFERENCES bloom_taxonomy_levels(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course_order (course_id, display_order),
    INDEX idx_bloom (bloom_taxonomy_level_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores Course Learning Outcomes (CLOs) mapped to Blooms Taxonomy';
