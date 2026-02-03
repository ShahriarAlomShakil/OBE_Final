-- Migration: Create bloom_taxonomy_levels table (prerequisite for course_learning_outcomes)
-- Description: Stores Bloom's Taxonomy cognitive levels (Remember, Understand, Apply, Analyze, Evaluate, Create)

CREATE TABLE bloom_taxonomy_levels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    level_number INT NOT NULL UNIQUE COMMENT 'Level number (1-6)',
    name VARCHAR(50) NOT NULL COMMENT 'Level name (Remember, Understand, Apply, Analyze, Evaluate, Create)',
    description TEXT NULL,
    keywords TEXT NULL COMMENT 'Action verbs for this level',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores Blooms Taxonomy cognitive levels';

-- Insert default Bloom's Taxonomy levels
INSERT INTO bloom_taxonomy_levels (level_number, name, description, keywords) VALUES
(1, 'Remember', 'Recall facts and basic concepts', 'define, duplicate, list, memorize, recall, repeat, reproduce, state'),
(2, 'Understand', 'Explain ideas or concepts', 'classify, describe, discuss, explain, identify, locate, recognize, report, select, translate'),
(3, 'Apply', 'Use information in new situations', 'execute, implement, solve, use, demonstrate, interpret, operate, schedule, sketch'),
(4, 'Analyze', 'Draw connections among ideas', 'differentiate, organize, relate, compare, contrast, distinguish, examine, experiment, question, test'),
(5, 'Evaluate', 'Justify a decision or course of action', 'appraise, argue, defend, judge, select, support, value, critique, weigh'),
(6, 'Create', 'Produce new or original work', 'design, assemble, construct, conjecture, develop, formulate, author, investigate');
