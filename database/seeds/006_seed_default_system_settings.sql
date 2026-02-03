-- Seed: 006_seed_default_system_settings
-- Description: Seeds default system configuration settings

-- Application Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public, updated_by) VALUES
-- General Settings
('app_name', 'OBE System', 'string', 'general', 'Application name displayed throughout the system', TRUE, NULL),
('app_version', '1.0.0', 'string', 'general', 'Current application version', TRUE, NULL),
('app_environment', 'production', 'string', 'general', 'Application environment (development, staging, production)', FALSE, NULL),
('app_timezone', 'Asia/Dhaka', 'string', 'general', 'Default application timezone', TRUE, NULL),
('app_locale', 'en', 'string', 'general', 'Default application locale', TRUE, NULL),
('maintenance_mode', 'false', 'boolean', 'general', 'Enable maintenance mode', FALSE, NULL),

-- Security Settings
('session_lifetime', '120', 'number', 'security', 'Session lifetime in minutes', FALSE, NULL),
('password_min_length', '8', 'number', 'security', 'Minimum password length', FALSE, NULL),
('password_require_uppercase', 'true', 'boolean', 'security', 'Require uppercase letters in password', FALSE, NULL),
('password_require_lowercase', 'true', 'boolean', 'security', 'Require lowercase letters in password', FALSE, NULL),
('password_require_numbers', 'true', 'boolean', 'security', 'Require numbers in password', FALSE, NULL),
('password_require_special', 'true', 'boolean', 'security', 'Require special characters in password', FALSE, NULL),
('password_expiry_days', '90', 'number', 'security', 'Password expiration in days (0 = never)', FALSE, NULL),
('password_history_count', '5', 'number', 'security', 'Number of previous passwords to prevent reuse', FALSE, NULL),
('max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts before lockout', FALSE, NULL),
('lockout_duration', '30', 'number', 'security', 'Account lockout duration in minutes', FALSE, NULL),
('two_factor_enabled', 'false', 'boolean', 'security', 'Enable two-factor authentication', FALSE, NULL),

-- Email Settings
('email_from_name', 'OBE System', 'string', 'email', 'Default sender name for emails', FALSE, NULL),
('email_from_address', 'noreply@obesystem.edu', 'string', 'email', 'Default sender email address', FALSE, NULL),
('email_queue_enabled', 'true', 'boolean', 'email', 'Use queue for sending emails', FALSE, NULL),
('email_max_attempts', '3', 'number', 'email', 'Maximum email send retry attempts', FALSE, NULL),
('email_retention_days', '30', 'number', 'email', 'Days to retain sent/failed emails', FALSE, NULL),

-- Notification Settings
('notifications_enabled', 'true', 'boolean', 'notifications', 'Enable notification system', FALSE, NULL),
('notification_email_enabled', 'true', 'boolean', 'notifications', 'Enable email notifications', FALSE, NULL),
('notification_in_app_enabled', 'true', 'boolean', 'notifications', 'Enable in-app notifications', FALSE, NULL),
('notification_sms_enabled', 'false', 'boolean', 'notifications', 'Enable SMS notifications', FALSE, NULL),
('notification_retention_days', '90', 'number', 'notifications', 'Days to retain old notifications', FALSE, NULL),

-- Academic Settings
('academic_year_start_month', '1', 'number', 'academic', 'Academic year start month (1-12)', TRUE, NULL),
('semester_registration_buffer_days', '7', 'number', 'academic', 'Days before semester for registration', FALSE, NULL),
('course_drop_deadline_weeks', '2', 'number', 'academic', 'Weeks into semester for course drop deadline', FALSE, NULL),
('max_courses_per_semester', '8', 'number', 'academic', 'Maximum courses a student can take per semester', TRUE, NULL),
('min_courses_per_semester', '3', 'number', 'academic', 'Minimum courses a student must take per semester', TRUE, NULL),
('max_credit_hours_per_semester', '21', 'number', 'academic', 'Maximum credit hours per semester', TRUE, NULL),
('min_credit_hours_per_semester', '12', 'number', 'academic', 'Minimum credit hours per semester', TRUE, NULL),

-- OBE Settings
('clo_attainment_threshold', '60.00', 'number', 'obe', 'CLO attainment threshold percentage', FALSE, NULL),
('plo_attainment_threshold', '60.00', 'number', 'obe', 'PLO attainment threshold percentage', FALSE, NULL),
('direct_assessment_weight', '70.00', 'number', 'obe', 'Weight percentage for direct assessment in OBE', FALSE, NULL),
('indirect_assessment_weight', '30.00', 'number', 'obe', 'Weight percentage for indirect assessment in OBE', FALSE, NULL),
('attainment_calculation_method', 'weighted_average', 'string', 'obe', 'Method for calculating attainment (weighted_average, average, highest)', FALSE, NULL),
('obe_report_auto_generation', 'true', 'boolean', 'obe', 'Automatically generate OBE reports at semester end', FALSE, NULL),

-- Grading Settings
('gpa_scale', '4.00', 'number', 'grading', 'GPA scale (e.g., 4.00 or 5.00)', TRUE, NULL),
('passing_grade', 'D', 'string', 'grading', 'Minimum passing grade', TRUE, NULL),
('grade_approval_required', 'true', 'boolean', 'grading', 'Require approval before publishing grades', FALSE, NULL),
('improvement_allowed', 'true', 'boolean', 'grading', 'Allow students to improve grades', TRUE, NULL),
('max_improvement_attempts', '2', 'number', 'grading', 'Maximum improvement attempts per course', TRUE, NULL),

-- File Upload Settings
('max_file_size_mb', '10', 'number', 'uploads', 'Maximum file upload size in MB', FALSE, NULL),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","jpg","jpeg","png"]', 'json', 'uploads', 'Allowed file extensions', FALSE, NULL),
('upload_path', '/uploads', 'string', 'uploads', 'Base upload directory path', FALSE, NULL),

-- Pagination Settings
('default_page_size', '20', 'number', 'pagination', 'Default number of items per page', FALSE, NULL),
('max_page_size', '100', 'number', 'pagination', 'Maximum items per page', FALSE, NULL),

-- Backup Settings
('auto_backup_enabled', 'true', 'boolean', 'backup', 'Enable automatic database backups', FALSE, NULL),
('backup_frequency_hours', '24', 'number', 'backup', 'Backup frequency in hours', FALSE, NULL),
('backup_retention_days', '30', 'number', 'backup', 'Days to retain backup files', FALSE, NULL),

-- API Settings
('api_rate_limit_per_minute', '60', 'number', 'api', 'API rate limit requests per minute', FALSE, NULL),
('api_rate_limit_per_hour', '1000', 'number', 'api', 'API rate limit requests per hour', FALSE, NULL),
('api_timeout_seconds', '30', 'number', 'api', 'API request timeout in seconds', FALSE, NULL),

-- Cache Settings
('cache_enabled', 'true', 'boolean', 'cache', 'Enable application caching', FALSE, NULL),
('cache_ttl_seconds', '3600', 'number', 'cache', 'Default cache TTL in seconds', FALSE, NULL),

-- Audit Settings
('audit_log_enabled', 'true', 'boolean', 'audit', 'Enable audit logging', FALSE, NULL),
('audit_log_retention_days', '365', 'number', 'audit', 'Days to retain audit logs', FALSE, NULL),
('sensitive_data_masking', 'true', 'boolean', 'audit', 'Mask sensitive data in audit logs', FALSE, NULL),

-- GDPR/Privacy Settings
('gdpr_compliance_enabled', 'true', 'boolean', 'privacy', 'Enable GDPR compliance features', FALSE, NULL),
('data_retention_years', '7', 'number', 'privacy', 'Default data retention period in years', FALSE, NULL),
('consent_required', 'true', 'boolean', 'privacy', 'Require user consent for data collection', FALSE, NULL),
('cookie_consent_required', 'true', 'boolean', 'privacy', 'Require cookie consent', TRUE, NULL);

-- Display success message
SELECT CONCAT('✓ Inserted ', ROW_COUNT(), ' default system settings') AS status;
