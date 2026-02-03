-- Migration: Create surveys table
-- Description: Stores survey information for course exit, alumni, employer, and student satisfaction surveys
-- Dependencies: degrees, course_offerings, users

CREATE TABLE IF NOT EXISTS surveys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL COMMENT 'Survey title',
    description TEXT NULL COMMENT 'Survey description',
    survey_type ENUM('course_exit', 'alumni', 'employer', 'student_satisfaction', 'faculty_feedback') NOT NULL COMMENT 'Type of survey',
    degree_id BIGINT UNSIGNED NULL COMMENT 'For degree-level surveys',
    course_offering_id BIGINT UNSIGNED NULL COMMENT 'For course-specific surveys',
    target_audience ENUM('students', 'alumni', 'employers', 'faculty') NOT NULL COMMENT 'Target audience for survey',
    is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Whether survey responses are anonymous',
    start_date DATE NOT NULL COMMENT 'Survey start date',
    end_date DATE NOT NULL COMMENT 'Survey end date',
    status ENUM('draft', 'active', 'closed', 'archived') DEFAULT 'draft' COMMENT 'Survey status',
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'User who created the survey',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_surveys_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_surveys_course_offering FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_surveys_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_surveys_type_status (survey_type, status),
    INDEX idx_surveys_dates (start_date, end_date),
    INDEX idx_surveys_degree (degree_id),
    INDEX idx_surveys_course_offering (course_offering_id),
    INDEX idx_surveys_created_by (created_by),
    INDEX idx_surveys_deleted_at (deleted_at),
    
    -- Constraints
    CONSTRAINT chk_surveys_dates CHECK (end_date >= start_date)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Survey information for feedback collection';
