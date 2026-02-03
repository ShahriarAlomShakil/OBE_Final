-- Migration: 034_create_questions_table
-- Description: Creates questions table to store individual questions for assessments
-- Dependencies: 029_create_assessment_components_table, 020_create_bloom_taxonomy_levels_table
-- Created: 2026-02-03

CREATE TABLE IF NOT EXISTS questions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    assessment_component_id BIGINT UNSIGNED NOT NULL COMMENT 'Reference to assessment component',
    question_number VARCHAR(20) NOT NULL COMMENT 'Question number (e.g., 1, 1a, 2b)',
    question_text TEXT NOT NULL COMMENT 'Full question text',
    question_type ENUM('mcq', 'short_answer', 'essay', 'practical', 'coding') NOT NULL COMMENT 'Type of question',
    marks DECIMAL(6,2) NOT NULL COMMENT 'Marks allocated to this question',
    bloom_taxonomy_level_id BIGINT UNSIGNED NULL COMMENT 'Bloom taxonomy level',
    difficulty_level ENUM('easy', 'medium', 'hard') NULL COMMENT 'Difficulty level',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_questions_assessment 
        FOREIGN KEY (assessment_component_id) REFERENCES assessment_components(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_questions_bloom 
        FOREIGN KEY (bloom_taxonomy_level_id) REFERENCES bloom_taxonomy_levels(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_marks CHECK (marks >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores individual questions for assessments';

-- Indexes
CREATE INDEX idx_assessment_number ON questions(assessment_component_id, question_number);
CREATE INDEX idx_bloom ON questions(bloom_taxonomy_level_id);
CREATE INDEX idx_difficulty ON questions(difficulty_level);
CREATE INDEX idx_deleted_at ON questions(deleted_at);
