-- Migration: Create weekly_lesson_plans table
-- Description: Stores weekly lesson plans with teaching strategies and assessment methods

CREATE TABLE weekly_lesson_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    week_no INT NOT NULL COMMENT 'Week number',
    topics TEXT NOT NULL COMMENT 'Topics covered',
    specific_outcomes TEXT NULL COMMENT 'Expected outcomes',
    teaching_strategy VARCHAR(255) NULL COMMENT 'Teaching method',
    teaching_aid VARCHAR(255) NULL COMMENT 'Materials used',
    assessment_strategy VARCHAR(255) NULL COMMENT 'Assessment method',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_weekly_lesson_plans_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course_week (course_id, week_no),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores weekly lesson plans with teaching strategies and assessment methods';
