-- =====================================================
-- ADDITIONAL PERFORMANCE INDEXES FOR OBE SYSTEM
-- Migration: 089_add_performance_indexes.sql
-- Description: Adds missing indexes for query optimization
-- =====================================================

USE obe_system;

-- =====================================================
-- 1. USERS & AUTHENTICATION INDEXES
-- =====================================================

-- Users table - additional indexes
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);
CREATE INDEX idx_users_dob ON users(dob);
CREATE INDEX idx_users_blood_group ON users(blood_group);
CREATE INDEX idx_users_consent ON users(consent_given, consent_date);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Sessions - covering index for cleanup queries
CREATE INDEX idx_sessions_activity_user ON sessions(last_activity, user_id);

-- Password reset tokens - composite for validation
CREATE INDEX idx_reset_email_expires ON password_reset_tokens(email, expires_at);

-- =====================================================
-- 2. ACADEMIC STRUCTURE INDEXES
-- =====================================================

-- Faculties
CREATE INDEX idx_faculties_name ON faculties(name);
CREATE INDEX idx_faculties_short_name ON faculties(short_name);
CREATE INDEX idx_faculties_created_at ON faculties(created_at DESC);

-- Departments
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_established ON departments(established_year);
CREATE INDEX idx_departments_created_at ON departments(created_at DESC);

-- Degrees
CREATE INDEX idx_degrees_name ON degrees(name);
CREATE INDEX idx_degrees_faculty_type ON degrees(faculty_id, degree_type);
CREATE INDEX idx_degrees_credits ON degrees(total_credits);

-- Academic Sessions
CREATE INDEX idx_academic_sessions_name ON academic_sessions(session_name);

-- Semesters
CREATE INDEX idx_semesters_type_active ON semesters(semester_type, is_active);
CREATE INDEX idx_semesters_registration ON semesters(registration_start, registration_end);

-- =====================================================
-- 3. COURSES & CURRICULUM INDEXES
-- =====================================================

-- Courses - additional performance indexes
CREATE INDEX idx_courses_title ON courses(course_title(100));
CREATE INDEX idx_courses_level_semester ON courses(level, semester);
CREATE INDEX idx_courses_type_elective ON courses(course_type, elective_type);
CREATE INDEX idx_courses_credit ON courses(credit);
CREATE INDEX idx_courses_approved ON courses(approved_by, approved_at);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);

-- Course offerings
CREATE INDEX idx_offerings_semester_status ON course_offerings(semester_id, status);
CREATE INDEX idx_offerings_enrolled_count ON course_offerings(enrolled_count);
CREATE INDEX idx_offerings_created_at ON course_offerings(created_at DESC);

-- Course enrollments
CREATE INDEX idx_enrollments_date ON course_enrollments(enrollment_date DESC);
CREATE INDEX idx_enrollments_grade ON course_enrollments(grade_id);
CREATE INDEX idx_enrollments_drop_date ON course_enrollments(drop_date);

-- Course objectives
CREATE INDEX idx_objectives_co_id ON course_objectives(co_id);

-- Course learning outcomes
CREATE INDEX idx_clo_clo_id ON course_learning_outcomes(clo_id);
CREATE INDEX idx_clo_weight ON course_learning_outcomes(weight_percentage DESC);
CREATE INDEX idx_clo_target ON course_learning_outcomes(target_attainment);
CREATE INDEX idx_clo_version ON course_learning_outcomes(version);

-- Course contents
CREATE INDEX idx_contents_duration ON course_contents(duration_hours);

-- Weekly lesson plans
CREATE INDEX idx_lesson_plans_created_at ON weekly_lesson_plans(created_at DESC);

-- =====================================================
-- 4. OBE FRAMEWORK INDEXES
-- =====================================================

-- Program Educational Objectives
CREATE INDEX idx_peo_peo_no ON program_educational_objectives(peo_no);
CREATE INDEX idx_peo_active ON program_educational_objectives(is_active);

-- Program Learning Outcomes
CREATE INDEX idx_plo_plo_no ON program_learning_outcomes(plo_no);
CREATE INDEX idx_plo_target ON program_learning_outcomes(target_attainment);
CREATE INDEX idx_plo_version ON program_learning_outcomes(version);
CREATE INDEX idx_plo_active ON program_learning_outcomes(is_active);

-- PEO-PLO Mapping
CREATE INDEX idx_peo_plo_correlation ON peo_plo_mapping(correlation_level);
CREATE INDEX idx_peo_plo_plo_id ON peo_plo_mapping(plo_id);

-- CLO-PLO Mapping
CREATE INDEX idx_clo_plo_level ON clo_plo_mapping(mapping_level);
CREATE INDEX idx_clo_plo_plo_id ON clo_plo_mapping(program_learning_outcome_id);

-- =====================================================
-- 5. ASSESSMENT INDEXES
-- =====================================================

-- Assessment types
CREATE INDEX idx_assessment_types_category ON assessment_types(category);

-- Assessment components
CREATE INDEX idx_components_scheduled ON assessment_components(scheduled_date);
CREATE INDEX idx_components_published ON assessment_components(is_published);
CREATE INDEX idx_components_weight ON assessment_components(weight_percentage DESC);
CREATE INDEX idx_components_created_at ON assessment_components(created_at DESC);

-- Assessment CLO mapping
CREATE INDEX idx_assessment_clo_marks ON assessment_clo_mapping(marks_allocated DESC);
CREATE INDEX idx_assessment_clo_clo_id ON assessment_clo_mapping(course_learning_outcome_id);

-- Questions
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX idx_questions_marks ON questions(marks DESC);
CREATE INDEX idx_questions_bloom ON questions(bloom_taxonomy_level_id);

-- Question CLO mapping
CREATE INDEX idx_question_clo_marks ON question_clo_mapping(marks_allocated DESC);

-- =====================================================
-- 6. RUBRICS INDEXES
-- =====================================================

-- Rubrics
CREATE INDEX idx_rubrics_created_by ON rubrics(created_by);
CREATE INDEX idx_rubrics_created_at ON rubrics(created_at DESC);
CREATE INDEX idx_rubrics_total_points ON rubrics(total_points);

-- Rubric criteria
CREATE INDEX idx_criteria_max_points ON rubric_criteria(max_points DESC);
CREATE INDEX idx_criteria_weight ON rubric_criteria(weight_percentage DESC);

-- Rubric levels
CREATE INDEX idx_rubric_levels_points ON rubric_levels(points DESC);

-- =====================================================
-- 7. STUDENTS INDEXES
-- =====================================================

-- Students
CREATE INDEX idx_students_batch ON students(batch_year);
CREATE INDEX idx_students_admission ON students(admission_date);
CREATE INDEX idx_students_level_semester ON students(current_level, current_semester);
CREATE INDEX idx_students_session ON students(session_year);
CREATE INDEX idx_students_residential ON students(residential_status);
CREATE INDEX idx_students_graduation ON students(graduation_date);
CREATE INDEX idx_students_created_at ON students(created_at DESC);

-- CGPAs
CREATE INDEX idx_cgpas_value ON cgpas(cgpa DESC);
CREATE INDEX idx_cgpas_credits_earned ON cgpas(total_credits_earned DESC);

-- =====================================================
-- 8. TEACHERS INDEXES
-- =====================================================

-- Teachers (assuming this table exists)
CREATE INDEX idx_teachers_designation ON teachers(designation_id) IF EXISTS;
CREATE INDEX idx_teachers_dept ON teachers(department_id) IF EXISTS;
CREATE INDEX idx_teachers_status ON teachers(employment_status) IF EXISTS;

-- Teacher course mapping
CREATE INDEX idx_teacher_course_semester ON teacher_course_table(semester_id) IF EXISTS;
CREATE INDEX idx_teacher_course_created_at ON teacher_course_table(created_at DESC) IF EXISTS;

-- =====================================================
-- 9. MARKS & RESULTS INDEXES
-- =====================================================

-- Student assessment marks
CREATE INDEX idx_student_marks_obtained ON student_assessment_marks(obtained_marks DESC) IF EXISTS;
CREATE INDEX idx_student_marks_submitted ON student_assessment_marks(submitted_at) IF EXISTS;
CREATE INDEX idx_student_marks_graded ON student_assessment_marks(graded_at) IF EXISTS;

-- Student question marks
CREATE INDEX idx_question_marks_obtained ON student_question_marks(obtained_marks DESC) IF EXISTS;

-- Student rubric scores
CREATE INDEX idx_rubric_scores_points ON student_rubric_scores(points_earned DESC) IF EXISTS;

-- Course results
CREATE INDEX idx_course_results_grade ON course_results(grade_id) IF EXISTS;
CREATE INDEX idx_course_results_gpa ON course_results(gpa DESC) IF EXISTS;
CREATE INDEX idx_course_results_created_at ON course_results(created_at DESC) IF EXISTS;

-- Semester results
CREATE INDEX idx_semester_results_sgpa ON semester_results(sgpa DESC) IF EXISTS;
CREATE INDEX idx_semester_results_cgpa ON semester_results(cgpa DESC) IF EXISTS;
CREATE INDEX idx_semester_results_created_at ON semester_results(created_at DESC) IF EXISTS;

-- =====================================================
-- 10. ATTAINMENT INDEXES
-- =====================================================

-- Student CLO attainment
CREATE INDEX idx_student_clo_score ON student_clo_attainment(attainment_score DESC) IF EXISTS;
CREATE INDEX idx_student_clo_attained ON student_clo_attainment(is_attained) IF EXISTS;
CREATE INDEX idx_student_clo_calculated ON student_clo_attainment(calculated_at) IF EXISTS;

-- Course CLO attainment summary
CREATE INDEX idx_course_clo_avg ON course_clo_attainment_summary(average_attainment DESC) IF EXISTS;
CREATE INDEX idx_course_clo_rate ON course_clo_attainment_summary(attainment_rate DESC) IF EXISTS;

-- Student PLO attainment
CREATE INDEX idx_student_plo_score ON student_plo_attainment(attainment_score DESC) IF EXISTS;
CREATE INDEX idx_student_plo_attained ON student_plo_attainment(is_attained) IF EXISTS;

-- Program PLO attainment summary
CREATE INDEX idx_program_plo_avg ON program_plo_attainment_summary(average_attainment DESC) IF EXISTS;
CREATE INDEX idx_program_plo_rate ON program_plo_attainment_summary(attainment_rate DESC) IF EXISTS;

-- =====================================================
-- 11. SURVEYS & INDIRECT ASSESSMENT INDEXES
-- =====================================================

-- Surveys
CREATE INDEX idx_surveys_type ON surveys(survey_type) IF EXISTS;
CREATE INDEX idx_surveys_status ON surveys(status) IF EXISTS;
CREATE INDEX idx_surveys_dates ON surveys(start_date, end_date) IF EXISTS;
CREATE INDEX idx_surveys_created_at ON surveys(created_at DESC) IF EXISTS;

-- Survey responses
CREATE INDEX idx_survey_responses_submitted ON survey_responses(submitted_at) IF EXISTS;
CREATE INDEX idx_survey_responses_completed ON survey_responses(is_completed) IF EXISTS;

-- Indirect attainment results
CREATE INDEX idx_indirect_attainment_score ON indirect_attainment_results(attainment_score DESC) IF EXISTS;

-- =====================================================
-- 12. ACTION PLANS & REVIEW CYCLES INDEXES
-- =====================================================

-- Action plans
CREATE INDEX idx_action_plans_priority ON action_plans(priority) IF EXISTS;
CREATE INDEX idx_action_plans_status ON action_plans(status) IF EXISTS;
CREATE INDEX idx_action_plans_dates ON action_plans(planned_start_date, planned_end_date) IF EXISTS;

-- OBE review cycles
CREATE INDEX idx_review_cycles_dates ON obe_review_cycles(start_date, end_date) IF EXISTS;
CREATE INDEX idx_review_cycles_status ON obe_review_cycles(status) IF EXISTS;

-- =====================================================
-- 13. NOTIFICATIONS & SYSTEM INDEXES
-- =====================================================

-- Notifications
CREATE INDEX idx_notifications_read ON notifications(is_read, created_at DESC) IF EXISTS;
CREATE INDEX idx_notifications_type ON notifications(notification_type) IF EXISTS;
CREATE INDEX idx_notifications_priority ON notifications(priority) IF EXISTS;

-- Email queue
CREATE INDEX idx_email_queue_status ON email_queue(status) IF EXISTS;
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at) IF EXISTS;
CREATE INDEX idx_email_queue_priority ON email_queue(priority DESC) IF EXISTS;

-- Audit logs
CREATE INDEX idx_audit_logs_action ON audit_logs(action) IF EXISTS;
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name) IF EXISTS;
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action) IF EXISTS;
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address) IF EXISTS;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC) IF EXISTS;

-- =====================================================
-- 14. ACCREDITATION INDEXES
-- =====================================================

-- PLO accreditation mapping
CREATE INDEX idx_plo_accreditation_level ON plo_accreditation_mapping(mapping_level) IF EXISTS;

-- =====================================================
-- 15. ALUMNI & EMPLOYERS INDEXES
-- =====================================================

-- Alumni
CREATE INDEX idx_alumni_graduation ON alumni(graduation_year DESC) IF EXISTS;
CREATE INDEX idx_alumni_employment ON alumni(current_employment_status) IF EXISTS;

-- Alumni surveys
CREATE INDEX idx_alumni_surveys_completed ON alumni_surveys(completion_date) IF EXISTS;

-- Employers
CREATE INDEX idx_employers_industry ON employers(industry_type) IF EXISTS;

-- =====================================================
-- 16. COURSE PORTFOLIOS INDEXES
-- =====================================================

-- Course portfolios
CREATE INDEX idx_portfolios_status ON course_portfolios(status) IF EXISTS;
CREATE INDEX idx_portfolios_created_at ON course_portfolios(created_at DESC) IF EXISTS;

-- Course portfolio documents
CREATE INDEX idx_portfolio_docs_type ON course_portfolio_documents(document_type) IF EXISTS;

-- =====================================================
-- 17. COVERING INDEXES FOR COMMON QUERIES
-- =====================================================

-- User role and status check (covering index)
CREATE INDEX idx_users_role_active_email ON users(role, is_active, email);

-- Student enrollment status check (covering index)
CREATE INDEX idx_enrollments_student_status_grade ON course_enrollments(student_id, status, grade_id);

-- Course offering availability (covering index)
CREATE INDEX idx_offerings_semester_status_enrolled ON course_offerings(semester_id, status, enrolled_count, max_students);

-- Assessment component details (covering index)
CREATE INDEX idx_components_offering_type_date ON assessment_components(course_offering_id, assessment_type_id, scheduled_date);

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Indexes with "IF EXISTS" are conditional and will only be created if the table exists
-- 2. Covering indexes include multiple columns to allow index-only scans
-- 3. Descending indexes (DESC) are used for ordering operations
-- 4. Composite indexes follow the principle: equality > range > ordering
-- 5. VARCHAR indexes on long fields use prefix length (e.g., course_title(100))
-- =====================================================

SELECT 'Performance indexes created successfully!' AS status;
