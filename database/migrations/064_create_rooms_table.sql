-- Migration: Create rooms table
-- Description: Stores room information within floors

CREATE TABLE rooms (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    floor_id BIGINT UNSIGNED NOT NULL COMMENT 'Parent floor',
    room_number VARCHAR(20) NOT NULL COMMENT 'Room number/identifier',
    room_type ENUM('single', 'double', 'triple', 'dormitory', 'suite') NOT NULL COMMENT 'Room type/category',
    room_size DECIMAL(6,2) NULL COMMENT 'Room size in square feet',
    capacity INT NOT NULL COMMENT 'Maximum occupancy',
    available_seats INT DEFAULT 0 COMMENT 'Currently available seats',
    amenities JSON NULL COMMENT 'Room amenities in JSON format',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_rooms_floor FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_floor_room (floor_id, room_number),
    INDEX idx_room_type (room_type),
    INDEX idx_available_seats (available_seats),
    INDEX idx_deleted_at (deleted_at),
    
    -- Unique constraint
    UNIQUE KEY uk_floor_room (floor_id, room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores room information within floors';
