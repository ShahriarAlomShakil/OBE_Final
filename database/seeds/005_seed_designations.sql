-- Seed: Default teacher designations
-- Description: Inserts default teacher designation hierarchy

INSERT INTO designations (name, `rank`, description) VALUES
('Professor', 1, 'Highest academic rank, typically requires PhD and extensive research/teaching experience'),
('Associate Professor', 2, 'Senior academic rank, requires significant research and teaching experience'),
('Assistant Professor', 3, 'Entry-level academic rank for tenure-track faculty'),
('Lecturer', 4, 'Teaching-focused position, may or may not require PhD'),
('Lab Instructor', 5, 'Specialized position for laboratory instruction and management');
