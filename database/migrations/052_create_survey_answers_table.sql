-- Migration: Create survey_answers table
-- Description: Stores individual answers to survey questions
-- Dependencies: survey_responses, survey_questions

CREATE TABLE IF NOT EXISTS survey_answers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_response_id BIGINT UNSIGNED NOT NULL COMMENT 'Response reference',
    survey_question_id BIGINT UNSIGNED NOT NULL COMMENT 'Question reference',
    answer_text TEXT NULL COMMENT 'Text answer for open-ended questions',
    answer_value DECIMAL(5,2) NULL COMMENT 'Numeric answer for rating/scale questions',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_survey_answers_response FOREIGN KEY (survey_response_id) 
        REFERENCES survey_responses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_survey_answers_question FOREIGN KEY (survey_question_id) 
        REFERENCES survey_questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_survey_answers_response_question (survey_response_id, survey_question_id),
    INDEX idx_survey_answers_response (survey_response_id),
    INDEX idx_survey_answers_question (survey_question_id),
    
    -- Unique Constraint: One answer per question per response
    UNIQUE KEY uk_survey_answers_response_question (survey_response_id, survey_question_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Individual answers to survey questions';
