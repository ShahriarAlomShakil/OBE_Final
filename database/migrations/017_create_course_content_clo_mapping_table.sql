-- Migration: Create course_content_clo_mapping table
-- Description: Maps course content topics to Course Learning Outcomes (CLOs)

CREATE TABLE course_content_clo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_content_id BIGINT UNSIGNED NOT NULL,
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_content_clo_mapping_content FOREIGN KEY (course_content_id) REFERENCES course_contents(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_content_clo_mapping_clo FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint: One mapping per content-CLO pair
    UNIQUE KEY uk_content_clo (course_content_id, course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps course content topics to Course Learning Outcomes (CLOs)';
