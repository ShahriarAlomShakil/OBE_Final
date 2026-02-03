-- Migration: Create action_plan_outcomes table
-- Description: Tracks outcomes and effectiveness of implemented action plans
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS action_plan_outcomes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    action_plan_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to action plan',
    
    outcome_description TEXT NOT NULL COMMENT 'Description of the outcome/result achieved',
    
    effectiveness_rating ENUM('excellent', 'good', 'satisfactory', 'poor', 'not_effective') 
        NULL COMMENT 'Rating of action effectiveness',
    
    quantitative_impact JSON NULL COMMENT 'Measurable impacts (e.g., {"attainment_increase": 15, "pass_rate_increase": 10})',
    qualitative_impact TEXT NULL COMMENT 'Qualitative description of impact',
    
    evidence_documents JSON NULL COMMENT 'Array of document paths as evidence',
    
    lessons_learned TEXT NULL COMMENT 'Key lessons learned from implementation',
    recommendations TEXT NULL COMMENT 'Recommendations for future actions',
    
    sustainability_assessment TEXT NULL COMMENT 'Assessment of outcome sustainability',
    
    stakeholder_feedback TEXT NULL COMMENT 'Feedback from stakeholders',
    
    comparison_metrics JSON NULL COMMENT 'Before/after comparison metrics',
    
    follow_up_required BOOLEAN DEFAULT FALSE COMMENT 'Whether follow-up action is needed',
    follow_up_notes TEXT NULL COMMENT 'Notes on required follow-up actions',
    
    evaluation_date DATE NULL COMMENT 'When the outcome was evaluated',
    evaluated_by BIGINT UNSIGNED NULL COMMENT 'User who evaluated the outcome',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    deleted_by BIGINT UNSIGNED NULL COMMENT 'User who deleted the record',
    
    -- Foreign Keys
    CONSTRAINT fk_action_outcome_plan FOREIGN KEY (action_plan_id) 
        REFERENCES action_plans(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_action_outcome_evaluated_by FOREIGN KEY (evaluated_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_action_outcome_deleted_by FOREIGN KEY (deleted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Outcomes and effectiveness tracking of action plans';

-- Indexes for performance
CREATE INDEX idx_action_outcome_plan ON action_plan_outcomes(action_plan_id);
CREATE INDEX idx_action_outcome_effectiveness ON action_plan_outcomes(effectiveness_rating);
CREATE INDEX idx_action_outcome_follow_up ON action_plan_outcomes(follow_up_required);
CREATE INDEX idx_action_outcome_evaluation ON action_plan_outcomes(evaluation_date);
CREATE INDEX idx_action_outcome_deleted ON action_plan_outcomes(deleted_at);
