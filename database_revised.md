# Outcome Based Education (OBE) Database Schema - REVISED v2.0

> **📌 This is the corrected and enhanced version following OBE best practices**

---

## 📊 Database Overview

- **Total Tables**: 86 (20 new tables added)
- **Database Engine**: MySQL 8.0+
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Naming Convention**: snake_case (standardized)
- **Soft Deletes**: Enabled on all major tables
- **Audit Trail**: Complete tracking via audit_logs

---

## 🔐 1. Users & Authentication

### users
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| email_verified_at | TIMESTAMP | NULL | Email verification timestamp |
| phone | VARCHAR(20) | NULL | Contact number |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| role | ENUM('admin','dean','hod','teacher','student','staff') | NOT NULL | User role |
| profile_image | VARCHAR(500) | NULL | Profile image path |
| dob | DATE | NULL | Date of birth |
| nationality | VARCHAR(100) | NULL | Nationality |
| nid_no | VARCHAR(50) | NULL | National ID number |
| blood_group | VARCHAR(5) | NULL | Blood group |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| is_pii | BOOLEAN | DEFAULT TRUE | Contains PII flag |
| consent_given | BOOLEAN | DEFAULT FALSE | Data consent flag |
| consent_date | TIMESTAMP | NULL | Consent timestamp |
| remember_token | VARCHAR(100) | NULL | Remember me token |
| last_login_at | TIMESTAMP | NULL | Last login timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |
| deleted_by | BIGINT UNSIGNED | FK → users.id | Who deleted |

**Indexes:**
- `idx_email` (email)
- `idx_username` (username)
- `idx_role_active` (role, is_active)
- `idx_deleted_at` (deleted_at)

### sessions
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | VARCHAR(255) | PK | Session ID |
| user_id | BIGINT UNSIGNED | FK → users.id, NULL | User reference |
| ip_address | VARCHAR(45) | NULL | IPv4/IPv6 address |
| user_agent | TEXT | NULL | Browser user agent |
| payload | LONGTEXT | NOT NULL | Session data |
| last_activity | INT UNSIGNED | NOT NULL | Unix timestamp |

**Indexes:**
- `idx_user_id` (user_id)
- `idx_last_activity` (last_activity)

### password_reset_tokens
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| email | VARCHAR(255) | PK | Email address |
| token | VARCHAR(255) | NOT NULL | Reset token |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| expires_at | TIMESTAMP | NOT NULL | Token expiry |

**Indexes:**
- `idx_token` (token)
- `idx_expires_at` (expires_at)

### password_history
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id | |
| password_hash | VARCHAR(255) | NOT NULL | Previous password |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_user_id` (user_id)

---

## 🏠 2. Address & Personal Info

### addresses
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id, UNIQUE | One address per user |
| present_division | VARCHAR(100) | NULL | Current division |
| present_district | VARCHAR(100) | NULL | Current district |
| present_upazilla | VARCHAR(100) | NULL | Current upazilla |
| present_area | TEXT | NULL | Current area detail |
| permanent_division | VARCHAR(100) | NULL | Permanent division |
| permanent_district | VARCHAR(100) | NULL | Permanent district |
| permanent_upazilla | VARCHAR(100) | NULL | Permanent upazilla |
| permanent_area | TEXT | NULL | Permanent area detail |
| permanent_district_distance | DECIMAL(6,2) | NULL | Distance in KM |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_user_id` (user_id)

### genders
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id, UNIQUE | |
| name | ENUM('male','female','other') | NOT NULL | Gender |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

## 🎓 3. Academic Structure

### faculties
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Faculty name |
| short_name | VARCHAR(50) | NOT NULL, UNIQUE | Abbreviation |
| description | TEXT | NULL | Description |
| dean_id | BIGINT UNSIGNED | FK → teachers.id, NULL | Current dean |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |
| deleted_by | BIGINT UNSIGNED | FK → users.id | |

**Indexes:**
- `idx_is_active` (is_active)

### departments
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | Department name |
| dept_code | VARCHAR(20) | NOT NULL, UNIQUE | Department code |
| faculty_id | BIGINT UNSIGNED | FK → faculties.id | Parent faculty |
| hod_id | BIGINT UNSIGNED | FK → teachers.id, NULL | Head of department |
| description | TEXT | NULL | Description |
| established_year | YEAR | NULL | Year established |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |
| deleted_by | BIGINT UNSIGNED | FK → users.id | |

**Indexes:**
- `idx_faculty_active` (faculty_id, is_active)
- `idx_dept_code` (dept_code)

### degrees
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | Degree name |
| degree_type | ENUM('bachelor','master','diploma','phd') | NOT NULL | Degree type |
| faculty_id | BIGINT UNSIGNED | FK → faculties.id | Parent faculty |
| department_id | BIGINT UNSIGNED | FK → departments.id | Managing dept |
| total_credits | DECIMAL(5,2) | NOT NULL | Required credits |
| duration_years | INT | NOT NULL | Program duration |
| accreditation_status | VARCHAR(100) | NULL | Accreditation info |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |
| deleted_by | BIGINT UNSIGNED | FK → users.id | |

**Indexes:**
- `idx_dept_active` (department_id, is_active)
- `idx_degree_type` (degree_type)

### academic_sessions
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| session_name | VARCHAR(50) | NOT NULL, UNIQUE | e.g., "2024-2025" |
| start_date | DATE | NOT NULL | Session start |
| end_date | DATE | NOT NULL | Session end |
| is_active | BOOLEAN | DEFAULT FALSE | Active flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_is_active` (is_active)
- `idx_dates` (start_date, end_date)

### semesters
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| academic_session_id | BIGINT UNSIGNED | FK → academic_sessions.id | Parent session |
| name | VARCHAR(100) | NOT NULL | e.g., "Fall 2024" |
| semester_type | ENUM('fall','spring','summer') | NOT NULL | Semester type |
| semester_number | INT | NOT NULL | Sequential number |
| start_date | DATE | NOT NULL | Semester start |
| end_date | DATE | NOT NULL | Semester end |
| registration_start | DATE | NULL | Registration opens |
| registration_end | DATE | NULL | Registration closes |
| is_active | BOOLEAN | DEFAULT FALSE | Active flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_session_active` (academic_session_id, is_active)
- `idx_dates` (start_date, end_date)

---

## 📚 4. Courses & Curriculum

### courses
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_code | VARCHAR(20) | NOT NULL, UNIQUE | Course code |
| course_title | VARCHAR(500) | NOT NULL | Course title |
| department_id | BIGINT UNSIGNED | FK → departments.id | Offering dept |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | For degree |
| credit | DECIMAL(3,1) | NOT NULL | Credit hours |
| contact_hour_per_week | DECIMAL(4,1) | NOT NULL | Contact hours |
| theory_credit | DECIMAL(3,1) | DEFAULT 0 | Theory credits |
| lab_credit | DECIMAL(3,1) | DEFAULT 0 | Lab credits |
| level | VARCHAR(20) | NULL | Level (1, 2, 3, 4) |
| semester | VARCHAR(20) | NULL | Semester (1, 2) |
| course_type | ENUM('theory','lab','project','thesis') | NOT NULL | Course type |
| elective_type | ENUM('core','major_elective','general_elective','minor') | NOT NULL | Elective type |
| total_marks | DECIMAL(5,2) | NOT NULL | Total marks |
| prerequisites | TEXT | NULL | Prerequisite courses |
| summary | TEXT | NULL | Course summary |
| version | INT | DEFAULT 1 | Version number |
| status | ENUM('draft','pending_approval','approved','archived') | DEFAULT 'draft' | Approval status |
| approved_by | BIGINT UNSIGNED | FK → users.id, NULL | Approver |
| approved_at | TIMESTAMP | NULL | Approval time |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |
| deleted_by | BIGINT UNSIGNED | FK → users.id | |

**Indexes:**
- `idx_course_code` (course_code)
- `idx_dept_degree` (department_id, degree_id)
- `idx_status` (status, is_active)

### course_offerings
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_id | BIGINT UNSIGNED | FK → courses.id | Course reference |
| semester_id | BIGINT UNSIGNED | FK → semesters.id | Semester |
| section | VARCHAR(10) | NOT NULL | Section (A, B, C) |
| max_students | INT | DEFAULT 40 | Max enrollment |
| enrolled_count | INT | DEFAULT 0 | Current count |
| classroom | VARCHAR(100) | NULL | Room assignment |
| schedule | JSON | NULL | Class schedule |
| status | ENUM('planning','open','ongoing','closed','completed') | DEFAULT 'planning' | Offering status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_semester_course` (semester_id, course_id)
- `idx_status` (status)
- **UNIQUE:** (course_id, semester_id, section)

### course_enrollments
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| enrollment_date | DATE | NOT NULL | Enrollment date |
| drop_date | DATE | NULL | Drop date if dropped |
| status | ENUM('enrolled','dropped','completed','withdrawn') | DEFAULT 'enrolled' | Status |
| grade_id | BIGINT UNSIGNED | FK → grade_points.id, NULL | Final grade |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_student_status` (student_id, status)
- `idx_offering_status` (course_offering_id, status)
- **UNIQUE:** (student_id, course_offering_id)

### course_objectives
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_id | BIGINT UNSIGNED | FK → courses.id | Course |
| co_id | VARCHAR(20) | NOT NULL | CO identifier |
| co_description | TEXT | NOT NULL | CO description |
| display_order | INT | DEFAULT 1 | Display order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_course_order` (course_id, display_order)

### course_learning_outcomes
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_id | BIGINT UNSIGNED | FK → courses.id | Course |
| clo_id | VARCHAR(20) | NOT NULL | CLO identifier |
| clo_description | TEXT | NOT NULL | CLO description |
| bloom_taxonomy_level_id | BIGINT UNSIGNED | FK → bloom_taxonomy_levels.id | Bloom level |
| weight_percentage | DECIMAL(5,2) | DEFAULT 0 | CLO weight % |
| target_attainment | DECIMAL(5,2) | DEFAULT 60.00 | Target % |
| display_order | INT | DEFAULT 1 | Display order |
| version | INT | DEFAULT 1 | Version |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_course_order` (course_id, display_order)
- `idx_bloom` (bloom_taxonomy_level_id)

### course_contents
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_id | BIGINT UNSIGNED | FK → courses.id | Course |
| topic_number | INT | NOT NULL | Topic sequence |
| content | TEXT | NOT NULL | Content detail |
| teaching_strategy | VARCHAR(255) | NULL | Teaching methods |
| assessment_strategy | VARCHAR(255) | NULL | Assessment methods |
| duration_hours | DECIMAL(4,1) | NULL | Hours allocated |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_course_topic` (course_id, topic_number)

### course_content_clo_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_content_id | BIGINT UNSIGNED | FK → course_contents.id | Content |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (course_content_id, course_learning_outcome_id)

### weekly_lesson_plans
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_id | BIGINT UNSIGNED | FK → courses.id | Course |
| week_no | INT | NOT NULL | Week number |
| topics | TEXT | NOT NULL | Topics covered |
| specific_outcomes | TEXT | NULL | Expected outcomes |
| teaching_strategy | VARCHAR(255) | NULL | Teaching method |
| teaching_aid | VARCHAR(255) | NULL | Materials used |
| assessment_strategy | VARCHAR(255) | NULL | Assessment method |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_course_week` (course_id, week_no)

### weekly_lesson_plan_clo_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| weekly_lesson_plan_id | BIGINT UNSIGNED | FK → weekly_lesson_plans.id | Lesson plan |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (weekly_lesson_plan_id, course_learning_outcome_id)

---

## 🎯 5. Outcome Mapping & OBE Framework

### bloom_taxonomy_levels
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| level_number | INT | NOT NULL, UNIQUE | 1-6 |
| name | VARCHAR(50) | NOT NULL | Level name |
| description | TEXT | NULL | Description |
| keywords | TEXT | NULL | Action verbs |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Default Data:**
1. Remember - Recall facts and basic concepts
2. Understand - Explain ideas or concepts
3. Apply - Use information in new situations
4. Analyze - Draw connections among ideas
5. Evaluate - Justify a decision or course of action
6. Create - Produce new or original work

### program_educational_objectives
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree program |
| peo_no | VARCHAR(20) | NOT NULL | PEO identifier |
| peo_description | TEXT | NOT NULL | PEO description |
| display_order | INT | DEFAULT 1 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_degree_order` (degree_id, display_order)

### program_learning_outcomes
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree program |
| plo_no | VARCHAR(20) | NOT NULL | PLO identifier |
| plo_description | TEXT | NOT NULL | PLO description |
| bloom_taxonomy_level_id | BIGINT UNSIGNED | FK → bloom_taxonomy_levels.id | Bloom level |
| target_attainment | DECIMAL(5,2) | DEFAULT 60.00 | Target % |
| display_order | INT | DEFAULT 1 | Display order |
| version | INT | DEFAULT 1 | Version |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_degree_order` (degree_id, display_order)
- `idx_bloom` (bloom_taxonomy_level_id)

### peo_plo_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| peo_id | BIGINT UNSIGNED | FK → program_educational_objectives.id | PEO |
| plo_id | BIGINT UNSIGNED | FK → program_learning_outcomes.id | PLO |
| correlation_level | ENUM('high','medium','low') | NOT NULL | Correlation |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (peo_id, plo_id)

### clo_plo_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| program_learning_outcome_id | BIGINT UNSIGNED | FK → program_learning_outcomes.id | PLO |
| mapping_level | ENUM('1','2','3') | NOT NULL | 1=Low, 2=Medium, 3=High |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (course_learning_outcome_id, program_learning_outcome_id)

### clo_co_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| course_objective_id | BIGINT UNSIGNED | FK → course_objectives.id | CO |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (course_learning_outcome_id, course_objective_id)

---

## 📝 6. Assessment Structure

### assessment_types
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Type name |
| category | ENUM('formative','summative') | NOT NULL | Category |
| description | TEXT | NULL | Description |
| is_active | BOOLEAN | DEFAULT TRUE | Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Default Data:**
- Quiz (formative)
- Assignment (formative)
- Class Participation (formative)
- Lab Work (formative)
- Midterm Exam (summative)
- Final Exam (summative)
- Project (summative)
- Presentation (formative)

### assessment_components
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| assessment_type_id | BIGINT UNSIGNED | FK → assessment_types.id | Type |
| name | VARCHAR(255) | NOT NULL | Component name |
| total_marks | DECIMAL(6,2) | NOT NULL | Total marks |
| weight_percentage | DECIMAL(5,2) | NOT NULL | Weight in course |
| scheduled_date | DATE | NULL | Scheduled date |
| duration_minutes | INT | NULL | Duration |
| instructions | TEXT | NULL | Instructions |
| is_published | BOOLEAN | DEFAULT FALSE | Published status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_offering_date` (course_offering_id, scheduled_date)
- `idx_type` (assessment_type_id)

### assessment_clo_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| assessment_component_id | BIGINT UNSIGNED | FK → assessment_components.id | Assessment |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| marks_allocated | DECIMAL(6,2) | NOT NULL | Marks for CLO |
| weight_percentage | DECIMAL(5,2) | NOT NULL | % of assessment |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_assessment_clo` (assessment_component_id, course_learning_outcome_id)
- **UNIQUE:** (assessment_component_id, course_learning_outcome_id)

### questions
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| assessment_component_id | BIGINT UNSIGNED | FK → assessment_components.id | Assessment |
| question_number | VARCHAR(20) | NOT NULL | Q number |
| question_text | TEXT | NOT NULL | Question |
| question_type | ENUM('mcq','short_answer','essay','practical','coding') | NOT NULL | Type |
| marks | DECIMAL(6,2) | NOT NULL | Marks |
| bloom_taxonomy_level_id | BIGINT UNSIGNED | FK → bloom_taxonomy_levels.id, NULL | Bloom level |
| difficulty_level | ENUM('easy','medium','hard') | NULL | Difficulty |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_assessment_number` (assessment_component_id, question_number)

### question_clo_mapping
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| question_id | BIGINT UNSIGNED | FK → questions.id | Question |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| marks_allocated | DECIMAL(6,2) | NOT NULL | Marks for CLO |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (question_id, course_learning_outcome_id)

---

## 📋 7. Rubric-Based Assessment

### rubrics
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id, NULL | CLO |
| assessment_component_id | BIGINT UNSIGNED | FK → assessment_components.id, NULL | Assessment |
| name | VARCHAR(255) | NOT NULL | Rubric name |
| description | TEXT | NULL | Description |
| total_points | DECIMAL(5,2) | NOT NULL | Total points |
| created_by | BIGINT UNSIGNED | FK → users.id | Creator |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_clo` (course_learning_outcome_id)
- `idx_assessment` (assessment_component_id)

### rubric_criteria
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| rubric_id | BIGINT UNSIGNED | FK → rubrics.id | Rubric |
| criterion_name | VARCHAR(255) | NOT NULL | Criterion name |
| description | TEXT | NULL | Description |
| max_points | DECIMAL(5,2) | NOT NULL | Max points |
| weight_percentage | DECIMAL(5,2) | DEFAULT 0 | Weight % |
| display_order | INT | DEFAULT 1 | Display order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_rubric_order` (rubric_id, display_order)

### rubric_levels
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| rubric_criteria_id | BIGINT UNSIGNED | FK → rubric_criteria.id | Criterion |
| level_name | VARCHAR(100) | NOT NULL | Level name |
| description | TEXT | NULL | Description |
| points | DECIMAL(5,2) | NOT NULL | Points |
| display_order | INT | DEFAULT 1 | Display order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_criteria_order` (rubric_criteria_id, display_order)

---

## 👨‍🎓 8. Students & Enrollment

### students
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id, UNIQUE | User account |
| faculty_id | BIGINT UNSIGNED | FK → faculties.id | Faculty |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree program |
| department_id | BIGINT UNSIGNED | FK → departments.id | Department |
| hall_id | BIGINT UNSIGNED | FK → buildings.id, NULL | Hall |
| student_id | VARCHAR(50) | NOT NULL, UNIQUE | Student ID |
| batch_year | INT | NOT NULL | Batch year |
| admission_date | DATE | NOT NULL | Admission date |
| current_level | VARCHAR(20) | NULL | Current level |
| current_semester | VARCHAR(20) | NULL | Current semester |
| session_year | INT | NULL | Session year |
| residential_status | ENUM('resident','non_resident') | NULL | Residential |
| academic_status | ENUM('active','graduated','suspended','withdrawn','on_leave') | DEFAULT 'active' | Status |
| graduation_date | DATE | NULL | Graduation date |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |
| deleted_by | BIGINT UNSIGNED | FK → users.id | |

**Indexes:**
- `idx_student_id` (student_id)
- `idx_dept_batch` (department_id, batch_year)
- `idx_status` (academic_status)

### cgpas
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id, UNIQUE | Student |
| cgpa | DECIMAL(3,2) | NOT NULL | CGPA value |
| total_credits_earned | DECIMAL(5,2) | NOT NULL | Credits earned |
| total_credits_attempted | DECIMAL(5,2) | NOT NULL | Credits attempted |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_cgpa` (cgpa)

### guardians
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id, UNIQUE | Student |
| father_name | VARCHAR(255) | NULL | Father's name |
| father_phone | VARCHAR(20) | NULL | Father's phone |
| mother_name | VARCHAR(255) | NULL | Mother's name |
| mother_phone | VARCHAR(20) | NULL | Mother's phone |
| father_nid | VARCHAR(50) | NULL | Father's NID |
| mother_nid | VARCHAR(50) | NULL | Mother's NID |
| guardian_occupation | VARCHAR(255) | NULL | Occupation |
| annual_income | DECIMAL(12,2) | NULL | Annual income |
| emergency_contact_name | VARCHAR(255) | NULL | Emergency contact |
| emergency_contact_phone | VARCHAR(20) | NULL | Emergency phone |
| emergency_contact_relation | VARCHAR(100) | NULL | Relation |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

## 👨‍🏫 9. Teachers & Roles

### teachers
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id, UNIQUE | User account |
| faculty_id | BIGINT UNSIGNED | FK → faculties.id | Faculty |
| department_id | BIGINT UNSIGNED | FK → departments.id | Department |
| designation_id | BIGINT UNSIGNED | FK → designations.id | Designation |
| employee_id | VARCHAR(50) | NOT NULL, UNIQUE | Employee ID |
| joining_date | DATE | NOT NULL | Joining date |
| specialization | VARCHAR(255) | NULL | Specialization |
| qualification | VARCHAR(255) | NULL | Highest degree |
| research_interests | TEXT | NULL | Research areas |
| career_obj | TEXT | NULL | Career objectives |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |
| deleted_by | BIGINT UNSIGNED | FK → users.id | |

**Indexes:**
- `idx_employee_id` (employee_id)
- `idx_dept_active` (department_id, is_active)

### designations
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Designation name |
| rank | INT | NOT NULL | Hierarchy rank |
| description | TEXT | NULL | Description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Default Data:**
- Professor (rank 1)
- Associate Professor (rank 2)
- Assistant Professor (rank 3)
- Lecturer (rank 4)
- Lab Instructor (rank 5)

### teacher_course
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| teacher_id | BIGINT UNSIGNED | FK → teachers.id | Teacher |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| role | ENUM('instructor','co_instructor','lab_instructor','teaching_assistant') | DEFAULT 'instructor' | Role |
| lessons | TEXT | NULL | Lesson notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_teacher_offering` (teacher_id, course_offering_id)
- **UNIQUE:** (teacher_id, course_offering_id, role)

---

## 📊 10. Results & Marks

### grade_scales
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL | Scale name |
| description | TEXT | NULL | Description |
| is_active | BOOLEAN | DEFAULT TRUE | Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### grade_points
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| grade_scale_id | BIGINT UNSIGNED | FK → grade_scales.id | Scale |
| letter_grade | VARCHAR(5) | NOT NULL | Letter grade |
| grade_point | DECIMAL(3,2) | NOT NULL | GP value |
| min_percentage | DECIMAL(5,2) | NOT NULL | Min % |
| max_percentage | DECIMAL(5,2) | NOT NULL | Max % |
| remarks | VARCHAR(100) | NULL | Remarks |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_scale_grade` (grade_scale_id, letter_grade)

**Default Data (4.00 Scale):**
| Letter | GP | Min% | Max% | Remarks |
|--------|-----|------|------|---------|
| A+ | 4.00 | 80 | 100 | Outstanding |
| A | 3.75 | 75 | 79 | Excellent |
| A- | 3.50 | 70 | 74 | Very Good |
| B+ | 3.25 | 65 | 69 | Good |
| B | 3.00 | 60 | 64 | Above Average |
| B- | 2.75 | 55 | 59 | Average |
| C+ | 2.50 | 50 | 54 | Below Average |
| C | 2.25 | 45 | 49 | Poor |
| D | 2.00 | 40 | 44 | Very Poor |
| F | 0.00 | 0 | 39 | Fail |

### student_assessment_marks
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| assessment_component_id | BIGINT UNSIGNED | FK → assessment_components.id | Assessment |
| marks_obtained | DECIMAL(6,2) | NOT NULL | Obtained marks |
| marks_total | DECIMAL(6,2) | NOT NULL | Total marks |
| percentage | DECIMAL(5,2) | NULL | Percentage |
| is_absent | BOOLEAN | DEFAULT FALSE | Absent flag |
| remarks | TEXT | NULL | Remarks |
| entered_by | BIGINT UNSIGNED | FK → users.id | Who entered |
| entered_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Entry time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_student_assessment` (student_id, assessment_component_id)
- `idx_assessment` (assessment_component_id)
- **UNIQUE:** (student_id, assessment_component_id)

### student_question_marks
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| question_id | BIGINT UNSIGNED | FK → questions.id | Question |
| marks_obtained | DECIMAL(6,2) | NOT NULL | Obtained marks |
| marks_total | DECIMAL(6,2) | NOT NULL | Total marks |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- **UNIQUE:** (student_id, question_id)

### course_results
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| total_marks_obtained | DECIMAL(6,2) | NOT NULL | Total obtained |
| total_marks | DECIMAL(6,2) | NOT NULL | Total marks |
| percentage | DECIMAL(5,2) | NOT NULL | Percentage |
| grade_id | BIGINT UNSIGNED | FK → grade_points.id | Grade |
| grade_point | DECIMAL(3,2) | NOT NULL | GP |
| letter_grade | VARCHAR(5) | NOT NULL | Letter grade |
| credit_earned | DECIMAL(3,1) | DEFAULT 0 | Credits earned |
| is_pass | BOOLEAN | DEFAULT TRUE | Pass status |
| result_type | ENUM('regular','improvement','retake') | DEFAULT 'regular' | Result type |
| published_at | TIMESTAMP | NULL | Publish time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- **UNIQUE:** (student_id, course_offering_id, result_type)
- `idx_offering_published` (course_offering_id, published_at)

### semester_results
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| semester_id | BIGINT UNSIGNED | FK → semesters.id | Semester |
| total_credits_attempted | DECIMAL(5,2) | NOT NULL | Credits attempted |
| total_credits_earned | DECIMAL(5,2) | NOT NULL | Credits earned |
| semester_gpa | DECIMAL(3,2) | NOT NULL | GPA |
| cgpa | DECIMAL(3,2) | NOT NULL | CGPA |
| published_at | TIMESTAMP | NULL | Publish time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (student_id, semester_id)
- `idx_semester_published` (semester_id, published_at)

### student_rubric_scores
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| assessment_component_id | BIGINT UNSIGNED | FK → assessment_components.id | Assessment |
| rubric_criteria_id | BIGINT UNSIGNED | FK → rubric_criteria.id | Criterion |
| rubric_level_id | BIGINT UNSIGNED | FK → rubric_levels.id | Level achieved |
| points_earned | DECIMAL(5,2) | NOT NULL | Points earned |
| comments | TEXT | NULL | Comments |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_student_assessment_criteria` (student_id, assessment_component_id, rubric_criteria_id)

### improvement_retake_records
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| original_result_id | BIGINT UNSIGNED | FK → course_results.id | Original result |
| attempt_number | INT | NOT NULL | Attempt number |
| attempt_type | ENUM('improvement','retake') | NOT NULL | Type |
| attempt_semester_id | BIGINT UNSIGNED | FK → semesters.id | Semester |
| new_result_id | BIGINT UNSIGNED | FK → course_results.id, NULL | New result |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_student_course_attempt` (student_id, course_offering_id, attempt_number)

---

## 🎯 11. CLO & PLO Attainment

### student_clo_attainment
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| total_marks_obtained | DECIMAL(6,2) | NOT NULL | Obtained marks |
| total_marks_possible | DECIMAL(6,2) | NOT NULL | Possible marks |
| attainment_percentage | DECIMAL(5,2) | NOT NULL | Attainment % |
| is_attained | BOOLEAN | DEFAULT FALSE | Attained flag |
| calculated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Calculation time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (student_id, course_offering_id, course_learning_outcome_id)
- `idx_offering_clo` (course_offering_id, course_learning_outcome_id)

### course_clo_attainment_summary
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id | CLO |
| total_students | INT | NOT NULL | Total students |
| students_attained | INT | NOT NULL | Students attained |
| attainment_percentage | DECIMAL(5,2) | NOT NULL | Attainment % |
| average_score | DECIMAL(5,2) | NOT NULL | Average score |
| is_target_met | BOOLEAN | DEFAULT FALSE | Target met |
| calculated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Calculation time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- **UNIQUE:** (course_offering_id, course_learning_outcome_id)

### student_plo_attainment
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| program_learning_outcome_id | BIGINT UNSIGNED | FK → program_learning_outcomes.id | PLO |
| semester_id | BIGINT UNSIGNED | FK → semesters.id | Semester |
| attainment_score | DECIMAL(5,2) | NOT NULL | Score |
| attainment_percentage | DECIMAL(5,2) | NOT NULL | Percentage |
| is_attained | BOOLEAN | DEFAULT FALSE | Attained flag |
| calculated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Calculation time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_student_plo_semester` (student_id, program_learning_outcome_id, semester_id)

### program_plo_attainment_summary
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree |
| program_learning_outcome_id | BIGINT UNSIGNED | FK → program_learning_outcomes.id | PLO |
| academic_session_id | BIGINT UNSIGNED | FK → academic_sessions.id | Session |
| total_students | INT | NOT NULL | Total students |
| students_attained | INT | NOT NULL | Students attained |
| attainment_percentage | DECIMAL(5,2) | NOT NULL | Attainment % |
| direct_attainment | DECIMAL(5,2) | NULL | Direct % |
| indirect_attainment | DECIMAL(5,2) | NULL | Indirect % |
| is_target_met | BOOLEAN | DEFAULT FALSE | Target met |
| calculated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Calculation time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_degree_plo_session` (degree_id, program_learning_outcome_id, academic_session_id)

### attainment_thresholds
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree |
| threshold_type | ENUM('clo','plo') | NOT NULL | Type |
| minimum_percentage | DECIMAL(5,2) | DEFAULT 60.00 | Minimum % |
| target_percentage | DECIMAL(5,2) | DEFAULT 75.00 | Target % |
| excellence_percentage | DECIMAL(5,2) | DEFAULT 85.00 | Excellence % |
| effective_from_session_id | BIGINT UNSIGNED | FK → academic_sessions.id | Effective from |
| effective_to_session_id | BIGINT UNSIGNED | FK → academic_sessions.id, NULL | Effective to |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_degree_type` (degree_id, threshold_type)

### direct_attainment_methods
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id | Offering |
| method_name | VARCHAR(255) | NOT NULL | Method name |
| description | TEXT | NULL | Description |
| weight_percentage | DECIMAL(5,2) | DEFAULT 100.00 | Weight % |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### indirect_attainment_methods
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree |
| method_name | VARCHAR(255) | NOT NULL | Method name |
| description | TEXT | NULL | Description |
| weight_percentage | DECIMAL(5,2) | DEFAULT 20.00 | Weight % |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

## 📋 12. Surveys & Feedback

### surveys
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| title | VARCHAR(500) | NOT NULL | Survey title |
| description | TEXT | NULL | Description |
| survey_type | ENUM('course_exit','alumni','employer','student_satisfaction','faculty_feedback') | NOT NULL | Type |
| degree_id | BIGINT UNSIGNED | FK → degrees.id, NULL | For degree |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id, NULL | For offering |
| target_audience | ENUM('students','alumni','employers','faculty') | NOT NULL | Audience |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymous |
| start_date | DATE | NOT NULL | Start date |
| end_date | DATE | NOT NULL | End date |
| status | ENUM('draft','active','closed','archived') | DEFAULT 'draft' | Status |
| created_by | BIGINT UNSIGNED | FK → users.id | Creator |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_type_status` (survey_type, status)
- `idx_dates` (start_date, end_date)

### survey_questions
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| survey_id | BIGINT UNSIGNED | FK → surveys.id | Survey |
| question_text | TEXT | NOT NULL | Question |
| question_type | ENUM('rating_scale','multiple_choice','text','yes_no','likert_scale') | NOT NULL | Type |
| options | JSON | NULL | Options (for MCQ) |
| is_required | BOOLEAN | DEFAULT TRUE | Required |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id, NULL | CLO |
| program_learning_outcome_id | BIGINT UNSIGNED | FK → program_learning_outcomes.id, NULL | PLO |
| display_order | INT | DEFAULT 1 | Display order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_survey_order` (survey_id, display_order)

### survey_responses
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| survey_id | BIGINT UNSIGNED | FK → surveys.id | Survey |
| user_id | BIGINT UNSIGNED | FK → users.id, NULL | User (if not anonymous) |
| response_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Response time |
| is_complete | BOOLEAN | DEFAULT FALSE | Complete flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_survey_user` (survey_id, user_id)
- `idx_response_date` (response_date)

### survey_answers
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| survey_response_id | BIGINT UNSIGNED | FK → survey_responses.id | Response |
| survey_question_id | BIGINT UNSIGNED | FK → survey_questions.id | Question |
| answer_text | TEXT | NULL | Text answer |
| answer_value | DECIMAL(5,2) | NULL | Numeric answer |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_response_question` (survey_response_id, survey_question_id)

### indirect_attainment_results
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| survey_id | BIGINT UNSIGNED | FK → surveys.id | Survey |
| program_learning_outcome_id | BIGINT UNSIGNED | FK → program_learning_outcomes.id, NULL | PLO |
| course_learning_outcome_id | BIGINT UNSIGNED | FK → course_learning_outcomes.id, NULL | CLO |
| average_rating | DECIMAL(5,2) | NOT NULL | Average rating |
| attainment_percentage | DECIMAL(5,2) | NOT NULL | Attainment % |
| total_responses | INT | NOT NULL | Response count |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_survey_plo` (survey_id, program_learning_outcome_id)
- `idx_survey_clo` (survey_id, course_learning_outcome_id)

---

## 📈 13. Continuous Improvement

### action_plans
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id, NULL | Offering |
| academic_session_id | BIGINT UNSIGNED | FK → academic_sessions.id | Session |
| plan_title | VARCHAR(500) | NOT NULL | Plan title |
| identified_gap | TEXT | NOT NULL | Gap identified |
| root_cause_analysis | TEXT | NULL | Root cause |
| proposed_action | TEXT | NOT NULL | Proposed action |
| success_criteria | TEXT | NULL | Success criteria |
| responsible_person | BIGINT UNSIGNED | FK → users.id | Responsible |
| target_completion_date | DATE | NULL | Target date |
| status | ENUM('proposed','approved','in_progress','completed','deferred') | DEFAULT 'proposed' | Status |
| priority | ENUM('high','medium','low') | DEFAULT 'medium' | Priority |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_degree_session` (degree_id, academic_session_id)
- `idx_status_priority` (status, priority)
- `idx_responsible` (responsible_person)

### action_plan_outcomes
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| action_plan_id | BIGINT UNSIGNED | FK → action_plans.id | Action plan |
| outcome_description | TEXT | NOT NULL | Outcome |
| improvement_achieved | TEXT | NULL | Improvement |
| new_attainment_percentage | DECIMAL(5,2) | NULL | New % |
| evidence_document_path | VARCHAR(500) | NULL | Evidence file |
| verified_by | BIGINT UNSIGNED | FK → users.id | Verifier |
| verified_at | TIMESTAMP | NULL | Verification time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_action_plan` (action_plan_id)

### obe_review_cycles
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| degree_id | BIGINT UNSIGNED | FK → degrees.id | Degree |
| cycle_name | VARCHAR(255) | NOT NULL | Cycle name |
| start_date | DATE | NOT NULL | Start date |
| end_date | DATE | NOT NULL | End date |
| review_type | ENUM('annual','biennial','accreditation','special') | NOT NULL | Review type |
| status | ENUM('planned','ongoing','completed','archived') | DEFAULT 'planned' | Status |
| summary_report | TEXT | NULL | Summary |
| recommendations | TEXT | NULL | Recommendations |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_degree_dates` (degree_id, start_date, end_date)
- `idx_type_status` (review_type, status)

---

## 🏢 14. Halls & Accommodation

### buildings
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| name | VARCHAR(255) | NOT NULL, UNIQUE | Building name |
| building_code | VARCHAR(20) | NOT NULL, UNIQUE | Building code |
| purpose | ENUM('hall','academic','administrative','lab','library','other') | NOT NULL | Purpose |
| total_floors | INT | DEFAULT 0 | Total floors |
| is_active | BOOLEAN | DEFAULT TRUE | Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_purpose_active` (purpose, is_active)

### floors
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| building_id | BIGINT UNSIGNED | FK → buildings.id | Building |
| floor_number | INT | NOT NULL | Floor number |
| total_rooms | INT | DEFAULT 0 | Total rooms |
| usage | VARCHAR(255) | NULL | Usage description |
| is_active | BOOLEAN | DEFAULT TRUE | Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_building_floor` (building_id, floor_number)
- **UNIQUE:** (building_id, floor_number)

### rooms
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| floor_id | BIGINT UNSIGNED | FK → floors.id | Floor |
| room_number | VARCHAR(20) | NOT NULL | Room number |
| room_type | ENUM('single','double','triple','dormitory','suite') | NOT NULL | Room type |
| room_size | DECIMAL(6,2) | NULL | Size in sq ft |
| capacity | INT | NOT NULL | Max occupants |
| available_seats | INT | DEFAULT 0 | Available seats |
| amenities | JSON | NULL | Amenities |
| is_active | BOOLEAN | DEFAULT TRUE | Active |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |
| deleted_at | TIMESTAMP | NULL | |

**Indexes:**
- `idx_floor_room` (floor_id, room_number)
- **UNIQUE:** (floor_id, room_number)

### seat_allocations
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| room_id | BIGINT UNSIGNED | FK → rooms.id | Room |
| student_id | BIGINT UNSIGNED | FK → students.id | Student |
| allocation_date | DATE | NOT NULL | Allocation date |
| vacate_date | DATE | NULL | Vacate date |
| status | ENUM('active','vacated','transferred') | DEFAULT 'active' | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_room_status` (room_id, status)
- `idx_student_status` (student_id, status)

---

## 📄 15. Reports & Audit

### obe_reports
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| report_type | ENUM('clo_attainment','plo_attainment','course_report','program_report','gap_analysis','improvement_report') | NOT NULL | Report type |
| degree_id | BIGINT UNSIGNED | FK → degrees.id, NULL | For degree |
| course_offering_id | BIGINT UNSIGNED | FK → course_offerings.id, NULL | For offering |
| academic_session_id | BIGINT UNSIGNED | FK → academic_sessions.id | Session |
| report_title | VARCHAR(500) | NOT NULL | Title |
| report_data | JSON | NULL | Report data |
| file_path | VARCHAR(500) | NULL | File path |
| generated_by | BIGINT UNSIGNED | FK → users.id | Generator |
| generated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Generation time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_type_session` (report_type, academic_session_id)
- `idx_generated_at` (generated_at)

### audit_logs
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id, NULL | User |
| action | ENUM('CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT') | NOT NULL | Action type |
| table_name | VARCHAR(100) | NULL | Table affected |
| record_id | BIGINT UNSIGNED | NULL | Record ID |
| old_values | JSON | NULL | Old values |
| new_values | JSON | NULL | New values |
| ip_address | VARCHAR(45) | NULL | IP address |
| user_agent | VARCHAR(500) | NULL | User agent |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Action time |

**Indexes:**
- `idx_user_action` (user_id, action)
- `idx_table_record` (table_name, record_id)
- `idx_created_at` (created_at)

**Partition by:** created_at (yearly partitions for performance)

### result_publications
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| semester_id | BIGINT UNSIGNED | FK → semesters.id | Semester |
| publication_type | ENUM('provisional','final') | NOT NULL | Type |
| published_by | BIGINT UNSIGNED | FK → users.id | Publisher |
| published_at | TIMESTAMP | NULL | Publish time |
| remarks | TEXT | NULL | Remarks |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_semester_type` (semester_id, publication_type)

---

## 🆕 16. System Tables

### system_settings
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| setting_key | VARCHAR(100) | UNIQUE, NOT NULL | Setting key |
| setting_value | TEXT | NULL | Setting value |
| setting_type | ENUM('string','number','boolean','json') | DEFAULT 'string' | Value type |
| category | VARCHAR(100) | NULL | Category |
| description | TEXT | NULL | Description |
| is_public | BOOLEAN | DEFAULT FALSE | Public flag |
| updated_by | BIGINT UNSIGNED | FK → users.id | Who updated |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

### notifications
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| user_id | BIGINT UNSIGNED | FK → users.id | Recipient |
| type | ENUM('email','in_app','sms') | NOT NULL | Type |
| title | VARCHAR(255) | NOT NULL | Title |
| message | TEXT | NULL | Message |
| action_url | VARCHAR(500) | NULL | Action URL |
| is_read | BOOLEAN | DEFAULT FALSE | Read flag |
| read_at | TIMESTAMP | NULL | Read time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_user_unread` (user_id, is_read)
- `idx_created_at` (created_at)

### email_queue
| Column | Type | Constraint | Description |
|--------|------|------------|-------------|
| id | BIGINT UNSIGNED | PK AUTO_INCREMENT | |
| to_email | VARCHAR(255) | NOT NULL | Recipient |
| cc_email | TEXT | NULL | CC |
| bcc_email | TEXT | NULL | BCC |
| subject | VARCHAR(500) | NOT NULL | Subject |
| body | TEXT | NOT NULL | Body |
| template_name | VARCHAR(100) | NULL | Template |
| template_data | JSON | NULL | Template data |
| priority | INT | DEFAULT 5 | Priority (1-10) |
| status | ENUM('pending','sending','sent','failed') | DEFAULT 'pending' | Status |
| attempts | INT | DEFAULT 0 | Attempts |
| max_attempts | INT | DEFAULT 3 | Max attempts |
| error_message | TEXT | NULL | Error |
| scheduled_at | TIMESTAMP | NULL | Schedule time |
| sent_at | TIMESTAMP | NULL | Sent time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `idx_status_priority` (status, priority)
- `idx_scheduled_at` (scheduled_at)

---

## 🆕 17. OBE-Specific Extended Tables

### accreditation_bodies
_[See REVISION_NOTES.md for full schema]_

### accreditation_criteria
_[See REVISION_NOTES.md for full schema]_

### plo_accreditation_mapping
_[See REVISION_NOTES.md for full schema]_

### alumni
_[See REVISION_NOTES.md for full schema]_

### alumni_surveys
_[See REVISION_NOTES.md for full schema]_

### employers
_[See REVISION_NOTES.md for full schema]_

### employer_surveys
_[See REVISION_NOTES.md for full schema]_

### advisory_board_members
_[See REVISION_NOTES.md for full schema]_

### advisory_board_meetings
_[See REVISION_NOTES.md for full schema]_

### external_examiners
_[See REVISION_NOTES.md for full schema]_

### external_examiner_assignments
_[See REVISION_NOTES.md for full schema]_

### course_portfolios
_[See REVISION_NOTES.md for full schema]_

### course_portfolio_documents
_[See REVISION_NOTES.md for full schema]_

### attainment_calculation_methods
_[See REVISION_NOTES.md for full schema]_

### degree_attainment_methods
_[See REVISION_NOTES.md for full schema]_

### curriculum_revisions
_[See REVISION_NOTES.md for full schema]_

### course_modifications
_[See REVISION_NOTES.md for full schema]_

---

## 🔗 Key Improvements Summary

### 1. Database Design
✅ Consistent snake_case naming  
✅ Proper data types  
✅ Soft deletes on all major tables  
✅ Comprehensive indexes  
✅ Foreign key constraints with proper ON DELETE actions  
✅ Unique constraints where needed  
✅ Default values properly set  

### 2. OBE Completeness
✅ Alumni tracking for long-term PEO assessment  
✅ Employer feedback system  
✅ Industry advisory board management  
✅ External examiner integration  
✅ Course portfolio documentation  
✅ Attainment calculation method tracking  
✅ Curriculum revision history  
✅ Accreditation body mapping  

### 3. System Features
✅ Notifications system  
✅ Email queue for async sending  
✅ System settings management  
✅ Comprehensive audit logging  
✅ Password history tracking  
✅ Session management  

### 4. Security & Compliance
✅ PII flags for data protection  
✅ Consent tracking  
✅ Audit logs with IP tracking  
✅ Soft deletes for data retention  
✅ Password history for policy enforcement  

---

## 📊 Final Table Count

| Category | Tables | New |
|----------|--------|-----|
| Core System | 3 | 3 |
| Users & Auth | 5 | 1 |
| Academic Structure | 5 | 0 |
| Courses | 10 | 2 |
| OBE Framework | 7 | 0 |
| Assessment | 7 | 0 |
| Students | 5 | 0 |
| Teachers | 3 | 0 |
| Results | 7 | 0 |
| OBE Attainment | 9 | 1 |
| Surveys | 5 | 0 |
| Improvement | 3 | 0 |
| Accommodation | 4 | 0 |
| Reports & Audit | 3 | 0 |
| **OBE Extended** | **10** | **10** |
| **TOTAL** | **86** | **17** |

---

**Version**: 2.0  
**Last Updated**: 2026-02-03  
**Status**: Ready for Implementation
