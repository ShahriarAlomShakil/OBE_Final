-- Migration: Create weekly_lesson_plan_clo_mapping table
-- Description: Maps weekly lesson plans to Course Learning Outcomes (CLOs)

CREATE TABLE weekly_lesson_plan_clo_mapping (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    weekly_lesson_plan_id BIGINT UNSIGNED NOT NULL,
    course_learning_outcome_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_lesson_plan_clo_mapping_plan FOREIGN KEY (weekly_lesson_plan_id) REFERENCES weekly_lesson_plans(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lesson_plan_clo_mapping_clo FOREIGN KEY (course_learning_outcome_id) REFERENCES course_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint: One mapping per lesson plan-CLO pair
    UNIQUE KEY uk_lesson_plan_clo (weekly_lesson_plan_id, course_learning_outcome_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Maps weekly lesson plans to Course Learning Outcomes (CLOs)';
