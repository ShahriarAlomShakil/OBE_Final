-- Seed: Create default admin user
-- Created: 2026-02-03
-- Description: Creates a default administrator account for initial system access
-- ⚠️ IMPORTANT: Change the password immediately after first login!

-- Default credentials:
-- Username: admin
-- Password: Admin@123456 (bcrypt hash provided below)
-- Email: admin@obe-system.local

-- Insert admin user
-- Note: Password is 'Admin@123456' hashed with bcrypt (10 rounds)
-- Generate new hash: bcrypt.hash('Admin@123456', 10)
INSERT INTO users (
    name,
    email,
    email_verified_at,
    phone,
    username,
    password,
    role,
    profile_image,
    dob,
    nationality,
    nid_no,
    blood_group,
    is_active,
    is_pii,
    consent_given,
    consent_date,
    remember_token,
    last_login_at,
    created_at,
    updated_at
) VALUES (
    'System Administrator',
    'admin@obe-system.local',
    CURRENT_TIMESTAMP,
    NULL,
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: Admin@123456
    'admin',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    TRUE,
    FALSE, -- Admin account doesn't contain PII by default
    TRUE,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify insertion
SELECT 
    id, 
    name, 
    email, 
    username, 
    role, 
    is_active,
    created_at
FROM users 
WHERE username = 'admin';

-- ⚠️ SECURITY NOTICE:
-- 1. This creates a default admin account with a known password
-- 2. After first login, immediately change the password via the UI
-- 3. Consider enabling 2FA for the admin account
-- 4. Update the email address to a real admin email
-- 5. For production, generate a unique strong password before deployment

-- To generate a new bcrypt hash in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('YourStrongPassword', 10);
-- console.log(hash);