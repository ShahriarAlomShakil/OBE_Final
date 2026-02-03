-- Migration: Create seat_allocations table
-- Description: Tracks seat/room allocations for students

CREATE TABLE seat_allocations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL COMMENT 'Allocated room',
    student_id BIGINT UNSIGNED NOT NULL COMMENT 'Student assigned',
    allocation_date DATE NOT NULL COMMENT 'Date of allocation',
    vacate_date DATE NULL COMMENT 'Date vacated (if applicable)',
    status ENUM('active', 'vacated', 'transferred') DEFAULT 'active' COMMENT 'Allocation status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_seat_allocations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_seat_allocations_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_room_status (room_id, status),
    INDEX idx_student_status (student_id, status),
    INDEX idx_allocation_date (allocation_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks seat/room allocations for students';
