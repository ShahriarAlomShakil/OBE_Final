-- Migration: Create advisory_board_members table
-- Description: Stores industry advisory board members for curriculum guidance

CREATE TABLE advisory_board_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    degree_id BIGINT UNSIGNED NOT NULL COMMENT 'Degree program reference',
    name VARCHAR(255) NOT NULL COMMENT 'Member name',
    designation VARCHAR(255) NULL COMMENT 'Professional designation',
    employer_id BIGINT UNSIGNED NULL COMMENT 'Employer/organization reference',
    expertise_area VARCHAR(255) NULL COMMENT 'Area of expertise',
    email VARCHAR(255) NULL COMMENT 'Contact email',
    phone VARCHAR(50) NULL COMMENT 'Contact phone',
    appointment_date DATE NULL COMMENT 'Appointment date',
    term_end_date DATE NULL COMMENT 'Term end date',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    bio TEXT NULL COMMENT 'Biography',
    photo_url VARCHAR(500) NULL COMMENT 'Photo URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',
    
    -- Foreign Keys
    CONSTRAINT fk_board_member_degree 
        FOREIGN KEY (degree_id) REFERENCES degrees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_board_member_employer 
        FOREIGN KEY (employer_id) REFERENCES employers(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_degree (degree_id),
    INDEX idx_degree_active (degree_id, is_active),
    INDEX idx_employer (employer_id),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores industry advisory board members for curriculum guidance';
