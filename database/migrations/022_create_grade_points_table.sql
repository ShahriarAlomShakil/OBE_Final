-- Migration: Create grade_points table (prerequisite for course_enrollments)
-- Description: Stores grade scale and grade points (4.00 GPA system)

CREATE TABLE grade_scales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Scale name (e.g., 4.00 GPA Scale)',
    description TEXT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores grade scale definitions';

CREATE TABLE grade_points (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    grade_scale_id BIGINT UNSIGNED NOT NULL,
    letter_grade VARCHAR(5) NOT NULL COMMENT 'A+, A, A-, B+, etc.',
    grade_point DECIMAL(3,2) NOT NULL COMMENT 'Grade point value',
    min_marks DECIMAL(5,2) NOT NULL COMMENT 'Minimum marks percentage',
    max_marks DECIMAL(5,2) NOT NULL COMMENT 'Maximum marks percentage',
    remarks VARCHAR(50) NULL COMMENT 'Excellent, Good, Average, etc.',
    display_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_grade_points_scale FOREIGN KEY (grade_scale_id) REFERENCES grade_scales(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_scale_order (grade_scale_id, display_order),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores grade points for grading system';

-- Insert default 4.00 GPA scale
INSERT INTO grade_scales (name, description, is_default, is_active) VALUES
('4.00 GPA Scale', 'Standard 4.00 GPA grading system', TRUE, TRUE);

-- Insert default grade points
INSERT INTO grade_points (grade_scale_id, letter_grade, grade_point, min_marks, max_marks, remarks, display_order) VALUES
(1, 'A+', 4.00, 80.00, 100.00, 'Excellent', 1),
(1, 'A', 3.75, 75.00, 79.99, 'Excellent', 2),
(1, 'A-', 3.50, 70.00, 74.99, 'Very Good', 3),
(1, 'B+', 3.25, 65.00, 69.99, 'Good', 4),
(1, 'B', 3.00, 60.00, 64.99, 'Good', 5),
(1, 'B-', 2.75, 55.00, 59.99, 'Above Average', 6),
(1, 'C+', 2.50, 50.00, 54.99, 'Average', 7),
(1, 'C', 2.25, 45.00, 49.99, 'Average', 8),
(1, 'D', 2.00, 40.00, 44.99, 'Pass', 9),
(1, 'F', 0.00, 0.00, 39.99, 'Fail', 10);
