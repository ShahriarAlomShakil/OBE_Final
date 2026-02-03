-- Migration: Create survey_responses table
-- Description: Stores individual survey responses from users
-- Dependencies: surveys, users

CREATE TABLE IF NOT EXISTS survey_responses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT UNSIGNED NOT NULL COMMENT 'Survey reference',
    user_id BIGINT UNSIGNED NULL COMMENT 'User who responded (NULL if anonymous)',
    response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When response was submitted',
    is_complete BOOLEAN DEFAULT FALSE COMMENT 'Whether survey was fully completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_survey_responses_survey FOREIGN KEY (survey_id) 
        REFERENCES surveys(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_survey_responses_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_survey_responses_survey_user (survey_id, user_id),
    INDEX idx_survey_responses_date (response_date),
    INDEX idx_survey_responses_complete (is_complete),
    INDEX idx_survey_responses_survey (survey_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Survey responses from users';
