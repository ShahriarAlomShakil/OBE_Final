-- Migration: Create alumni_surveys table
-- Description: Stores alumni survey responses for PEO assessment (1, 3, 5 years after graduation)

CREATE TABLE alumni_surveys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    survey_id BIGINT UNSIGNED NOT NULL COMMENT 'Survey reference',
    alumni_id BIGINT UNSIGNED NOT NULL COMMENT 'Alumni reference',
    years_after_graduation INT NULL COMMENT 'Years after graduation (1, 3, 5)',
    response_date DATE NULL COMMENT 'Response date',
    employment_status VARCHAR(50) NULL COMMENT 'Employment status',
    career_satisfaction_score INT NULL COMMENT 'Career satisfaction (1-5)',
    program_preparation_score INT NULL COMMENT 'Program preparation rating (1-5)',
    comments TEXT NULL COMMENT 'Additional comments',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_alumni_survey_survey 
        FOREIGN KEY (survey_id) REFERENCES surveys(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alumni_survey_alumni 
        FOREIGN KEY (alumni_id) REFERENCES alumni(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_survey (survey_id),
    INDEX idx_alumni (alumni_id),
    INDEX idx_years_after (years_after_graduation),
    INDEX idx_response_date (response_date),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores alumni survey responses for PEO assessment';
