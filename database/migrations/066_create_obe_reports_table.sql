-- Migration: Create obe_reports table
-- Description: Stores generated OBE reports for attainment, analysis, and improvement
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS obe_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('clo_attainment','plo_attainment','course_report','program_report','gap_analysis','improvement_report') NOT NULL COMMENT 'Type of OBE report',
    degree_id BIGINT UNSIGNED NULL COMMENT 'Reference to degree (for program-level reports)',
    course_offering_id BIGINT UNSIGNED NULL COMMENT 'Reference to course offering (for course-level reports)',
    academic_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to academic session',
    report_title VARCHAR(500) NOT NULL COMMENT 'Title of the report',
    report_data JSON NULL COMMENT 'Structured report data in JSON format',
    file_path VARCHAR(500) NULL COMMENT 'Path to generated report file (PDF/Excel)',
    generated_by BIGINT UNSIGNED NOT NULL COMMENT 'User who generated the report',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Report generation timestamp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_obe_reports_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_obe_reports_offering FOREIGN KEY (course_offering_id) 
        REFERENCES course_offerings(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_obe_reports_session FOREIGN KEY (academic_session_id) 
        REFERENCES academic_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_obe_reports_user FOREIGN KEY (generated_by) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='OBE reports storage for attainment and analysis';

-- Indexes for performance
CREATE INDEX idx_obe_reports_type_session ON obe_reports(report_type, academic_session_id);
CREATE INDEX idx_obe_reports_generated_at ON obe_reports(generated_at);
CREATE INDEX idx_obe_reports_degree ON obe_reports(degree_id);
CREATE INDEX idx_obe_reports_offering ON obe_reports(course_offering_id);
CREATE INDEX idx_obe_reports_generated_by ON obe_reports(generated_by);
