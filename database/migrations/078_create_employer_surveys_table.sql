-- Migration: Create employer_surveys table
-- Description: Stores employer feedback on graduate quality and program effectiveness

CREATE TABLE employer_surveys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employer_id BIGINT UNSIGNED NOT NULL COMMENT 'Employer reference',
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    survey_date DATE NOT NULL COMMENT 'Survey date',
    surveyed_by BIGINT UNSIGNED NULL COMMENT 'User who conducted the survey',
    overall_satisfaction INT NULL COMMENT 'Overall satisfaction (1-5)',
    technical_skills_rating INT NULL COMMENT 'Technical skills rating (1-5)',
    soft_skills_rating INT NULL COMMENT 'Soft skills rating (1-5)',
    work_readiness_rating INT NULL COMMENT 'Work readiness rating (1-5)',
    comments TEXT NULL COMMENT 'General comments',
    improvement_suggestions TEXT NULL COMMENT 'Suggestions for improvement',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_employer_survey_employer 
        FOREIGN KEY (employer_id) REFERENCES employers(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_employer_survey_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_employer_survey_user 
        FOREIGN KEY (surveyed_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_employer (employer_id),
    INDEX idx_degree (degree_id),
    INDEX idx_survey_date (survey_date),
    INDEX idx_surveyed_by (surveyed_by),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores employer feedback on graduate quality and program effectiveness';
