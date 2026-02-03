-- Seed: 004_seed_assessment_types
-- Description: Seeds default assessment types for OBE system
-- Dependencies: 028_create_assessment_types_table
-- Created: 2026-02-03

-- Insert default assessment types
INSERT INTO assessment_types (name, category, description, is_active) VALUES
('Quiz', 'formative', 'Short assessments to evaluate understanding of recent topics', TRUE),
('Assignment', 'formative', 'Take-home tasks to apply learned concepts', TRUE),
('Class Participation', 'formative', 'Active participation in class discussions and activities', TRUE),
('Lab Work', 'formative', 'Practical laboratory exercises and experiments', TRUE),
('Presentation', 'formative', 'Oral presentations on assigned topics', TRUE),
('Midterm Exam', 'summative', 'Mid-semester examination covering first half of course', TRUE),
('Final Exam', 'summative', 'End-of-semester comprehensive examination', TRUE),
('Project', 'summative', 'Major project work demonstrating comprehensive learning', TRUE),
('Class Test', 'formative', 'In-class tests to evaluate understanding', TRUE),
('Report', 'formative', 'Written reports on research or experimental work', TRUE),
('Viva Voce', 'summative', 'Oral examination to assess knowledge and understanding', TRUE),
('Practical Exam', 'summative', 'Hands-on practical examination', TRUE),
('Case Study', 'formative', 'Analysis and solution of real-world problems', TRUE),
('Group Work', 'formative', 'Collaborative group assignments and projects', TRUE),
('Portfolio', 'summative', 'Collection of work demonstrating learning progress', TRUE)
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    is_active = VALUES(is_active),
    updated_at = CURRENT_TIMESTAMP;

-- Display inserted data
SELECT 'Assessment Types Seeded Successfully' AS Status;
SELECT * FROM assessment_types ORDER BY category, name;
