-- Migration: Create course_modifications table
-- Description: Tracks individual course modifications within curriculum revisions

CREATE TABLE course_modifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL COMMENT 'Course reference',
    curriculum_revision_id BIGINT UNSIGNED NULL COMMENT 'Curriculum revision reference',
    modification_type ENUM('new','updated','deleted','credit_changed','prerequisite_changed') NOT NULL COMMENT 'Modification type',
    old_data JSON NULL COMMENT 'Old course data (JSON)',
    new_data JSON NULL COMMENT 'New course data (JSON)',
    modified_by BIGINT UNSIGNED NULL COMMENT 'User who made the modification',
    effective_from DATE NULL COMMENT 'Effective from date',
    justification TEXT NULL COMMENT 'Justification for modification',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_course_mod_course 
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_course_mod_revision 
        FOREIGN KEY (curriculum_revision_id) REFERENCES curriculum_revisions(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_course_mod_user 
        FOREIGN KEY (modified_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_course (course_id),
    INDEX idx_revision (curriculum_revision_id),
    INDEX idx_course_date (course_id, effective_from),
    INDEX idx_modification_type (modification_type),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks individual course modifications within curriculum revisions';
