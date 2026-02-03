-- Migration: Create semesters table
-- Description: Stores semester information within academic sessions

CREATE TABLE IF NOT EXISTS semesters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    academic_session_id BIGINT UNSIGNED NOT NULL COMMENT 'Parent academic session',
    name VARCHAR(100) NOT NULL COMMENT 'Semester name e.g., Fall 2024',
    semester_type ENUM('fall','spring','summer') NOT NULL COMMENT 'Semester type',
    semester_number INT NOT NULL COMMENT 'Sequential semester number',
    start_date DATE NOT NULL COMMENT 'Semester start date',
    end_date DATE NOT NULL COMMENT 'Semester end date',
    registration_start DATE NULL COMMENT 'Registration opens',
    registration_end DATE NULL COMMENT 'Registration closes',
    is_active BOOLEAN DEFAULT FALSE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes
    INDEX idx_session_active (academic_session_id, is_active),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_semester_type (semester_type),
    INDEX idx_semester_number (semester_number),
    
    -- Foreign Keys
    CONSTRAINT fk_semesters_session FOREIGN KEY (academic_session_id) 
        REFERENCES academic_sessions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_semesters_dates CHECK (end_date > start_date),
    CONSTRAINT chk_semesters_registration_dates 
        CHECK (registration_end IS NULL OR registration_end >= registration_start)
        
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Semester management table';
