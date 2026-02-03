-- Migration: Create alumni table
-- Description: Tracks alumni information for PEO assessment and career tracking

CREATE TABLE alumni (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Student reference',
    graduation_year INT NOT NULL COMMENT 'Year of graduation',
    graduation_semester VARCHAR(50) NULL COMMENT 'Semester of graduation',
    current_employer VARCHAR(255) NULL COMMENT 'Current employer name',
    job_title VARCHAR(255) NULL COMMENT 'Current job title',
    industry_sector VARCHAR(100) NULL COMMENT 'Industry sector',
    job_start_date DATE NULL COMMENT 'Job start date',
    salary_range VARCHAR(50) NULL COMMENT 'Salary range',
    country VARCHAR(100) NULL COMMENT 'Country of employment',
    city VARCHAR(100) NULL COMMENT 'City of employment',
    is_higher_studies BOOLEAN DEFAULT FALSE COMMENT 'Pursuing higher studies',
    higher_studies_institution VARCHAR(255) NULL COMMENT 'Institution for higher studies',
    higher_studies_degree VARCHAR(100) NULL COMMENT 'Degree pursuing',
    linkedin_profile VARCHAR(500) NULL COMMENT 'LinkedIn profile URL',
    email VARCHAR(255) NULL COMMENT 'Contact email',
    phone VARCHAR(50) NULL COMMENT 'Contact phone',
    willing_to_participate BOOLEAN DEFAULT FALSE COMMENT 'Willing to participate in surveys',
    last_contact_date DATE NULL COMMENT 'Last contact date',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_alumni_student 
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_student (student_id),
    INDEX idx_graduation_year (graduation_year),
    INDEX idx_employer (current_employer),
    INDEX idx_sector (industry_sector),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks alumni information for PEO assessment and career tracking';
