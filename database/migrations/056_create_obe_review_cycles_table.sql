-- Migration: Create obe_review_cycles table
-- Description: Manages periodic OBE review cycles for continuous improvement
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS obe_review_cycles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to degree program',
    
    cycle_name VARCHAR(200) NOT NULL COMMENT 'Name of the review cycle (e.g., "2024-2025 Annual Review")',
    cycle_type ENUM(
        'annual',
        'biannual',
        'curriculum_review',
        'accreditation',
        'mid_term',
        'special'
    ) NOT NULL COMMENT 'Type of review cycle',
    
    academic_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to academic session',
    
    review_start_date DATE NOT NULL COMMENT 'When review cycle starts',
    review_end_date DATE NOT NULL COMMENT 'When review cycle ends',
    
    objectives TEXT NOT NULL COMMENT 'Objectives of this review cycle',
    scope TEXT NULL COMMENT 'Scope and areas covered in this review',
    
    status ENUM(
        'planned',
        'in_progress',
        'data_collection',
        'analysis',
        'report_preparation',
        'under_review',
        'completed',
        'archived'
    ) DEFAULT 'planned' COMMENT 'Current status of review cycle',
    
    -- Key Review Components
    plo_attainment_reviewed BOOLEAN DEFAULT FALSE COMMENT 'PLO attainment data reviewed',
    clo_attainment_reviewed BOOLEAN DEFAULT FALSE COMMENT 'CLO attainment data reviewed',
    survey_results_reviewed BOOLEAN DEFAULT FALSE COMMENT 'Survey results reviewed',
    stakeholder_feedback_reviewed BOOLEAN DEFAULT FALSE COMMENT 'Stakeholder feedback reviewed',
    assessment_methods_reviewed BOOLEAN DEFAULT FALSE COMMENT 'Assessment methods reviewed',
    curriculum_content_reviewed BOOLEAN DEFAULT FALSE COMMENT 'Curriculum content reviewed',
    
    -- Review Findings
    overall_findings TEXT NULL COMMENT 'Summary of overall findings',
    strengths_identified TEXT NULL COMMENT 'Strengths identified during review',
    weaknesses_identified TEXT NULL COMMENT 'Weaknesses/gaps identified',
    opportunities TEXT NULL COMMENT 'Opportunities for improvement',
    threats TEXT NULL COMMENT 'Threats or challenges identified',
    
    -- Data Sources
    data_sources JSON NULL COMMENT 'Array of data sources used in review',
    courses_reviewed JSON NULL COMMENT 'Array of course IDs reviewed',
    semesters_covered JSON NULL COMMENT 'Array of semester IDs covered',
    
    -- Metrics Summary
    average_plo_attainment DECIMAL(5,2) NULL COMMENT 'Average PLO attainment across program',
    average_clo_attainment DECIMAL(5,2) NULL COMMENT 'Average CLO attainment across courses',
    student_satisfaction_score DECIMAL(5,2) NULL COMMENT 'Average student satisfaction score',
    alumni_satisfaction_score DECIMAL(5,2) NULL COMMENT 'Average alumni satisfaction score',
    employer_satisfaction_score DECIMAL(5,2) NULL COMMENT 'Average employer satisfaction score',
    
    -- Action Items
    action_items_generated INT DEFAULT 0 COMMENT 'Number of action items generated',
    high_priority_actions INT DEFAULT 0 COMMENT 'Number of high priority actions',
    
    -- Review Committee
    committee_chair_id BIGINT UNSIGNED NULL COMMENT 'Chair of review committee',
    committee_members JSON NULL COMMENT 'Array of committee member user IDs',
    
    -- Report Generation
    report_file_path VARCHAR(500) NULL COMMENT 'Path to final review report',
    report_generated_at TIMESTAMP NULL COMMENT 'When report was generated',
    
    -- Approval
    reviewed_by BIGINT UNSIGNED NULL COMMENT 'User who conducted/led the review',
    approved_by BIGINT UNSIGNED NULL COMMENT 'User who approved the review report',
    approved_at TIMESTAMP NULL COMMENT 'When review was approved',
    
    next_review_due_date DATE NULL COMMENT 'When next review is due',
    
    remarks TEXT NULL COMMENT 'Additional remarks or notes',
    
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'User who created this review cycle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL COMMENT 'User who deleted the record',
    
    -- Foreign Keys
    CONSTRAINT fk_review_cycle_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_cycle_session FOREIGN KEY (academic_session_id) 
        REFERENCES academic_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_cycle_chair FOREIGN KEY (committee_chair_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_review_cycle_reviewed_by FOREIGN KEY (reviewed_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_review_cycle_approved_by FOREIGN KEY (approved_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_review_cycle_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_review_cycle_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_review_cycle_dates CHECK (review_end_date >= review_start_date),
    CONSTRAINT chk_review_cycle_plo_attainment CHECK (average_plo_attainment IS NULL OR (average_plo_attainment >= 0 AND average_plo_attainment <= 100)),
    CONSTRAINT chk_review_cycle_clo_attainment CHECK (average_clo_attainment IS NULL OR (average_clo_attainment >= 0 AND average_clo_attainment <= 100)),
    CONSTRAINT chk_review_cycle_satisfaction CHECK (
        (student_satisfaction_score IS NULL OR (student_satisfaction_score >= 0 AND student_satisfaction_score <= 5)) AND
        (alumni_satisfaction_score IS NULL OR (alumni_satisfaction_score >= 0 AND alumni_satisfaction_score <= 5)) AND
        (employer_satisfaction_score IS NULL OR (employer_satisfaction_score >= 0 AND employer_satisfaction_score <= 5))
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='OBE review cycles for continuous program improvement';

-- Indexes for performance
CREATE INDEX idx_review_cycle_degree_session ON obe_review_cycles(degree_id, academic_session_id);
CREATE INDEX idx_review_cycle_type ON obe_review_cycles(cycle_type);
CREATE INDEX idx_review_cycle_status ON obe_review_cycles(status);
CREATE INDEX idx_review_cycle_dates ON obe_review_cycles(review_start_date, review_end_date);
CREATE INDEX idx_review_cycle_chair ON obe_review_cycles(committee_chair_id);
CREATE INDEX idx_review_cycle_next_due ON obe_review_cycles(next_review_due_date);
CREATE INDEX idx_review_cycle_deleted ON obe_review_cycles(deleted_at);
