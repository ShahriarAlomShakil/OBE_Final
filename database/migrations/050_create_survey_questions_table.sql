-- Migration: Create survey_questions table
-- Description: Stores questions for each survey with mapping to CLOs and PLOs
-- Dependencies: surveys, course_learning_outcomes, program_learning_outcomes

CREATE TABLE IF NOT EXISTS survey_questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT UNSIGNED NOT NULL COMMENT 'Survey reference',
    question_text TEXT NOT NULL COMMENT 'Question text',
    question_type ENUM('rating_scale', 'multiple_choice', 'text', 'yes_no', 'likert_scale') NOT NULL COMMENT 'Type of question',
    options JSON NULL COMMENT 'Options for multiple choice questions (JSON array)',
    is_required BOOLEAN DEFAULT TRUE COMMENT 'Whether question is required',
    course_learning_outcome_id BIGINT UNSIGNED NULL COMMENT 'Linked CLO if applicable',
    program_learning_outcome_id BIGINT UNSIGNED NULL COMMENT 'Linked PLO if applicable',
    display_order INT DEFAULT 1 COMMENT 'Display order in survey',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_survey_questions_survey FOREIGN KEY (survey_id) 
        REFERENCES surveys(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_survey_questions_clo FOREIGN KEY (course_learning_outcome_id) 
        REFERENCES course_learning_outcomes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_survey_questions_plo FOREIGN KEY (program_learning_outcome_id) 
        REFERENCES program_learning_outcomes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_survey_questions_survey_order (survey_id, display_order),
    INDEX idx_survey_questions_clo (course_learning_outcome_id),
    INDEX idx_survey_questions_plo (program_learning_outcome_id),
    INDEX idx_survey_questions_type (question_type)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Survey questions with outcome mapping';
