-- Migration: Create action_plans table
-- Description: Stores continuous improvement action plans based on OBE assessment results
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS action_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to degree program',
    course_id BIGINT UNSIGNED NULL COMMENT 'Reference to course (if course-specific)',
    plo_id BIGINT UNSIGNED NULL COMMENT 'Reference to PLO (if PLO-specific)',
    academic_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to academic session',
    
    plan_title VARCHAR(500) NOT NULL COMMENT 'Action plan title',
    issue_identified TEXT NOT NULL COMMENT 'Description of the issue/gap identified',
    root_cause_analysis TEXT NULL COMMENT 'Analysis of root causes',
    proposed_action TEXT NOT NULL COMMENT 'Detailed proposed action',
    
    action_category ENUM(
        'curriculum_revision',
        'teaching_method',
        'assessment_method',
        'learning_resources',
        'infrastructure',
        'faculty_development',
        'student_support',
        'policy_change',
        'other'
    ) NOT NULL COMMENT 'Category of action',
    
    priority_level ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium' COMMENT 'Priority level',
    
    responsible_person_id BIGINT UNSIGNED NULL COMMENT 'Faculty/Staff responsible for implementation',
    collaborators JSON NULL COMMENT 'Array of user IDs collaborating on this plan',
    
    target_start_date DATE NULL COMMENT 'Planned start date',
    target_completion_date DATE NULL COMMENT 'Planned completion date',
    actual_start_date DATE NULL COMMENT 'Actual start date',
    actual_completion_date DATE NULL COMMENT 'Actual completion date',
    
    budget_allocated DECIMAL(10,2) NULL COMMENT 'Budget allocated for this action',
    budget_spent DECIMAL(10,2) NULL COMMENT 'Budget spent so far',
    
    status ENUM(
        'proposed',
        'approved',
        'in_progress',
        'completed',
        'on_hold',
        'cancelled',
        'failed'
    ) DEFAULT 'proposed' COMMENT 'Current status of action plan',
    
    progress_percentage DECIMAL(5,2) DEFAULT 0 COMMENT 'Completion progress (0-100)',
    
    implementation_notes TEXT NULL COMMENT 'Notes on implementation progress',
    challenges_faced TEXT NULL COMMENT 'Challenges encountered during implementation',
    
    approved_by BIGINT UNSIGNED NULL COMMENT 'User who approved the plan',
    approved_at TIMESTAMP NULL COMMENT 'When the plan was approved',
    
    created_by BIGINT UNSIGNED NOT NULL COMMENT 'User who created the plan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL COMMENT 'User who deleted the record',
    
    -- Foreign Keys
    CONSTRAINT fk_action_plan_degree FOREIGN KEY (degree_id) 
        REFERENCES degrees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_plo FOREIGN KEY (plo_id) 
        REFERENCES program_learning_outcomes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_session FOREIGN KEY (academic_session_id) 
        REFERENCES academic_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_responsible FOREIGN KEY (responsible_person_id) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_approved_by FOREIGN KEY (approved_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_action_plan_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_action_plan_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_action_plan_budget CHECK (budget_spent IS NULL OR budget_allocated IS NULL OR budget_spent <= budget_allocated),
    CONSTRAINT chk_action_plan_dates CHECK (target_completion_date IS NULL OR target_start_date IS NULL OR target_completion_date >= target_start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Continuous improvement action plans based on OBE assessment';

-- Indexes for performance
CREATE INDEX idx_action_plan_degree_session ON action_plans(degree_id, academic_session_id);
CREATE INDEX idx_action_plan_course ON action_plans(course_id);
CREATE INDEX idx_action_plan_plo ON action_plans(plo_id);
CREATE INDEX idx_action_plan_status ON action_plans(status);
CREATE INDEX idx_action_plan_priority ON action_plans(priority_level);
CREATE INDEX idx_action_plan_responsible ON action_plans(responsible_person_id);
CREATE INDEX idx_action_plan_category ON action_plans(action_category);
CREATE INDEX idx_action_plan_dates ON action_plans(target_start_date, target_completion_date);
CREATE INDEX idx_action_plan_deleted ON action_plans(deleted_at);
