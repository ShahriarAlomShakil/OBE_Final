-- Migration: Create external_examiner_assignments table
-- Description: Tracks external examiner assignments to courses and assessments

CREATE TABLE external_examiner_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    external_examiner_id BIGINT UNSIGNED NOT NULL COMMENT 'External examiner reference',
    course_offering_id BIGINT UNSIGNED NOT NULL COMMENT 'Course offering reference',
    assessment_component_id BIGINT UNSIGNED NULL COMMENT 'Assessment component reference',
    assignment_date DATE NOT NULL COMMENT 'Assignment date',
    submission_deadline DATE NULL COMMENT 'Submission deadline',
    evaluation_report TEXT NULL COMMENT 'Evaluation report',
    recommendations TEXT NULL COMMENT 'Recommendations',
    status ENUM('assigned','in_progress','completed','cancelled') DEFAULT 'assigned' COMMENT 'Assignment status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_ext_exam_assign_examiner 
        FOREIGN KEY (external_examiner_id) REFERENCES external_examiners(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ext_exam_assign_offering 
        FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ext_exam_assign_assessment 
        FOREIGN KEY (assessment_component_id) REFERENCES assessment_components(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_examiner (external_examiner_id),
    INDEX idx_offering (course_offering_id),
    INDEX idx_examiner_status (external_examiner_id, status),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks external examiner assignments to courses and assessments';
