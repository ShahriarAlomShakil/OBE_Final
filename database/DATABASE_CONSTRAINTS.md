# Database Constraints Documentation - OBE System

## Overview
This document provides comprehensive documentation of all database constraints in the OBE (Outcome Based Education) system, including primary keys, foreign keys, unique constraints, check constraints, and indexes.

---

## Table of Contents
1. [Primary Key Constraints](#primary-key-constraints)
2. [Foreign Key Constraints](#foreign-key-constraints)
3. [Unique Constraints](#unique-constraints)
4. [Check Constraints](#check-constraints)
5. [Default Constraints](#default-constraints)
6. [Index Constraints](#index-constraints)
7. [Constraint Naming Conventions](#constraint-naming-conventions)

---

## Primary Key Constraints

All primary keys use `BIGINT UNSIGNED` with `AUTO_INCREMENT` for scalability.

| Table | Primary Key | Description |
|-------|-------------|-------------|
| users | id | User identifier |
| sessions | id | Session identifier (VARCHAR) |
| password_reset_tokens | email | Email address (natural key) |
| password_history | id | Password history record |
| addresses | id | Address identifier |
| genders | id | Gender record identifier |
| faculties | id | Faculty identifier |
| departments | id | Department identifier |
| degrees | id | Degree program identifier |
| academic_sessions | id | Academic session identifier |
| semesters | id | Semester identifier |
| courses | id | Course identifier |
| course_offerings | id | Course offering identifier |
| course_enrollments | id | Enrollment identifier |
| course_objectives | id | Course objective identifier |
| course_learning_outcomes | id | CLO identifier |
| course_contents | id | Course content identifier |
| weekly_lesson_plans | id | Lesson plan identifier |
| bloom_taxonomy_levels | id | Bloom level identifier |
| students | id | Student identifier |
| teachers | id | Teacher identifier |
| cgpas | id | CGPA record identifier |
| guardians | id | Guardian record identifier |
| assessment_types | id | Assessment type identifier |
| assessment_components | id | Assessment component identifier |
| assessment_clo_mapping | id | Assessment-CLO mapping identifier |
| rubrics | id | Rubric identifier |
| rubric_criteria | id | Rubric criterion identifier |
| rubric_levels | id | Rubric level identifier |
| questions | id | Question identifier |
| question_clo_mapping | id | Question-CLO mapping identifier |
| student_assessment_marks | id | Student mark record |
| student_question_marks | id | Question mark record |
| student_rubric_scores | id | Rubric score record |
| course_results | id | Course result identifier |
| semester_results | id | Semester result identifier |
| improvement_retake_records | id | Improvement record identifier |
| student_clo_attainment | id | Student CLO attainment record |
| course_clo_attainment_summary | id | Course CLO summary |
| student_plo_attainment | id | Student PLO attainment record |
| program_plo_attainment_summary | id | Program PLO summary |
| program_educational_objectives | id | PEO identifier |
| program_learning_outcomes | id | PLO identifier |
| peo_plo_mapping | id | PEO-PLO mapping identifier |
| clo_plo_mapping | id | CLO-PLO mapping identifier |
| clo_co_mapping | id | CLO-CO mapping identifier |
| audit_logs | id | Audit log identifier |
| notifications | id | Notification identifier |
| email_queue | id | Email queue identifier |

---

## Foreign Key Constraints

### 1. User & Authentication Module

#### users table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| deleted_by | users.id | SET NULL | CASCADE | User who performed soft delete |

#### sessions table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| user_id | users.id | CASCADE | CASCADE | Session owner |

#### password_history table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| user_id | users.id | CASCADE | CASCADE | Password owner |

#### addresses table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| user_id | users.id | CASCADE | CASCADE | Address owner (one-to-one) |

#### genders table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| user_id | users.id | CASCADE | CASCADE | Gender record owner (one-to-one) |

---

### 2. Academic Structure Module

#### faculties table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| dean_id | teachers.id | SET NULL | CASCADE | Current dean of faculty |
| deleted_by | users.id | SET NULL | CASCADE | User who deleted |

#### departments table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| faculty_id | faculties.id | CASCADE | CASCADE | Parent faculty |
| hod_id | teachers.id | SET NULL | CASCADE | Head of department |
| deleted_by | users.id | SET NULL | CASCADE | User who deleted |

#### degrees table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| faculty_id | faculties.id | CASCADE | CASCADE | Parent faculty |
| department_id | departments.id | CASCADE | CASCADE | Managing department |
| deleted_by | users.id | SET NULL | CASCADE | User who deleted |

#### semesters table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| academic_session_id | academic_sessions.id | CASCADE | CASCADE | Parent academic session |

---

### 3. Courses & Curriculum Module

#### courses table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| department_id | departments.id | CASCADE | CASCADE | Offering department |
| degree_id | degrees.id | CASCADE | CASCADE | Degree program |
| approved_by | users.id | SET NULL | CASCADE | Course approver |
| deleted_by | users.id | SET NULL | CASCADE | User who deleted |

#### course_offerings table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_id | courses.id | CASCADE | CASCADE | Course reference |
| semester_id | semesters.id | CASCADE | CASCADE | Semester reference |

#### course_enrollments table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Enrolled student |
| course_offering_id | course_offerings.id | CASCADE | CASCADE | Course offering |
| grade_id | grade_points.id | SET NULL | CASCADE | Final grade |

#### course_objectives table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_id | courses.id | CASCADE | CASCADE | Parent course |

#### course_learning_outcomes table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_id | courses.id | CASCADE | CASCADE | Parent course |
| bloom_taxonomy_level_id | bloom_taxonomy_levels.id | RESTRICT | CASCADE | Bloom level |

#### course_contents table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_id | courses.id | CASCADE | CASCADE | Parent course |

#### course_content_clo_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_content_id | course_contents.id | CASCADE | CASCADE | Course content |
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |

#### weekly_lesson_plans table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_id | courses.id | CASCADE | CASCADE | Parent course |

#### weekly_lesson_plan_clo_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| weekly_lesson_plan_id | weekly_lesson_plans.id | CASCADE | CASCADE | Lesson plan |
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |

---

### 4. OBE Framework Module

#### program_educational_objectives table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| degree_id | degrees.id | CASCADE | CASCADE | Degree program |

#### program_learning_outcomes table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| degree_id | degrees.id | CASCADE | CASCADE | Degree program |
| bloom_taxonomy_level_id | bloom_taxonomy_levels.id | RESTRICT | CASCADE | Bloom level |

#### peo_plo_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| peo_id | program_educational_objectives.id | CASCADE | CASCADE | PEO |
| plo_id | program_learning_outcomes.id | CASCADE | CASCADE | PLO |

#### clo_plo_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |
| program_learning_outcome_id | program_learning_outcomes.id | CASCADE | CASCADE | PLO |

#### clo_co_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |
| course_objective_id | course_objectives.id | CASCADE | CASCADE | CO |

---

### 5. Assessment Module

#### assessment_components table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_offering_id | course_offerings.id | CASCADE | CASCADE | Course offering |
| assessment_type_id | assessment_types.id | RESTRICT | CASCADE | Assessment type |

#### assessment_clo_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| assessment_component_id | assessment_components.id | CASCADE | CASCADE | Assessment component |
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |

#### questions table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| assessment_component_id | assessment_components.id | CASCADE | CASCADE | Parent assessment |
| bloom_taxonomy_level_id | bloom_taxonomy_levels.id | SET NULL | CASCADE | Bloom level |

#### question_clo_mapping table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| question_id | questions.id | CASCADE | CASCADE | Question |
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |

---

### 6. Rubrics Module

#### rubrics table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_learning_outcome_id | course_learning_outcomes.id | SET NULL | CASCADE | Associated CLO |
| assessment_component_id | assessment_components.id | SET NULL | CASCADE | Associated assessment |
| created_by | users.id | SET NULL | CASCADE | Rubric creator |

#### rubric_criteria table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| rubric_id | rubrics.id | CASCADE | CASCADE | Parent rubric |

#### rubric_levels table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| rubric_criteria_id | rubric_criteria.id | CASCADE | CASCADE | Parent criterion |

---

### 7. Students Module

#### students table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| user_id | users.id | CASCADE | CASCADE | User account (one-to-one) |
| faculty_id | faculties.id | RESTRICT | CASCADE | Faculty |
| degree_id | degrees.id | RESTRICT | CASCADE | Degree program |
| department_id | departments.id | RESTRICT | CASCADE | Department |
| hall_id | buildings.id | SET NULL | CASCADE | Residential hall |
| deleted_by | users.id | SET NULL | CASCADE | User who deleted |

#### cgpas table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student (one-to-one) |

#### guardians table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student (one-to-one) |

---

### 8. Teachers Module

#### teachers table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| user_id | users.id | CASCADE | CASCADE | User account (one-to-one) |
| department_id | departments.id | RESTRICT | CASCADE | Department |
| designation_id | designations.id | RESTRICT | CASCADE | Designation |
| deleted_by | users.id | SET NULL | CASCADE | User who deleted |

#### teacher_course_table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| teacher_id | teachers.id | CASCADE | CASCADE | Teacher |
| course_offering_id | course_offerings.id | CASCADE | CASCADE | Course offering |

---

### 9. Marks & Results Module

#### student_assessment_marks table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student |
| assessment_component_id | assessment_components.id | CASCADE | CASCADE | Assessment |
| graded_by | users.id | SET NULL | CASCADE | Grader |

#### student_question_marks table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_assessment_mark_id | student_assessment_marks.id | CASCADE | CASCADE | Parent mark record |
| question_id | questions.id | CASCADE | CASCADE | Question |

#### student_rubric_scores table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_assessment_mark_id | student_assessment_marks.id | CASCADE | CASCADE | Parent mark record |
| rubric_level_id | rubric_levels.id | CASCADE | CASCADE | Rubric level |

#### course_results table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_enrollment_id | course_enrollments.id | CASCADE | CASCADE | Enrollment |
| grade_id | grade_points.id | RESTRICT | CASCADE | Grade |

#### semester_results table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student |
| semester_id | semesters.id | CASCADE | CASCADE | Semester |

#### improvement_retake_records table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student |
| course_id | courses.id | CASCADE | CASCADE | Course |
| original_enrollment_id | course_enrollments.id | SET NULL | CASCADE | Original enrollment |
| retake_enrollment_id | course_enrollments.id | SET NULL | CASCADE | Retake enrollment |

---

### 10. Attainment Module

#### student_clo_attainment table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student |
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |
| course_offering_id | course_offerings.id | CASCADE | CASCADE | Course offering |

#### course_clo_attainment_summary table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| course_offering_id | course_offerings.id | CASCADE | CASCADE | Course offering |
| course_learning_outcome_id | course_learning_outcomes.id | CASCADE | CASCADE | CLO |

#### student_plo_attainment table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| student_id | students.id | CASCADE | CASCADE | Student |
| program_learning_outcome_id | program_learning_outcomes.id | CASCADE | CASCADE | PLO |
| semester_id | semesters.id | CASCADE | CASCADE | Semester |

#### program_plo_attainment_summary table
| Column | References | On Delete | On Update | Description |
|--------|-----------|-----------|-----------|-------------|
| degree_id | degrees.id | CASCADE | CASCADE | Degree program |
| program_learning_outcome_id | program_learning_outcomes.id | CASCADE | CASCADE | PLO |
| academic_session_id | academic_sessions.id | CASCADE | CASCADE | Academic session |

---

## Unique Constraints

### Single Column Unique Constraints

| Table | Column(s) | Description |
|-------|-----------|-------------|
| users | email | Email must be unique |
| users | username | Username must be unique |
| faculties | name | Faculty name must be unique |
| faculties | short_name | Faculty abbreviation must be unique |
| departments | dept_code | Department code must be unique |
| academic_sessions | session_name | Session name must be unique |
| courses | course_code | Course code must be unique |
| students | student_id | Student ID must be unique |
| students | user_id | One student per user |
| teachers | user_id | One teacher per user |
| addresses | user_id | One address per user |
| genders | user_id | One gender record per user |
| cgpas | student_id | One CGPA record per student |
| guardians | student_id | One guardian record per student |
| assessment_types | name | Assessment type name must be unique |

### Composite Unique Constraints

| Table | Columns | Description |
|-------|---------|-------------|
| course_offerings | (course_id, semester_id, section) | Unique offering per course, semester, section |
| course_enrollments | (student_id, course_offering_id) | Student can enroll once per offering |
| course_content_clo_mapping | (course_content_id, course_learning_outcome_id) | Unique content-CLO mapping |
| weekly_lesson_plan_clo_mapping | (weekly_lesson_plan_id, course_learning_outcome_id) | Unique lesson-CLO mapping |
| peo_plo_mapping | (peo_id, plo_id) | Unique PEO-PLO mapping |
| clo_plo_mapping | (course_learning_outcome_id, program_learning_outcome_id) | Unique CLO-PLO mapping |
| clo_co_mapping | (course_learning_outcome_id, course_objective_id) | Unique CLO-CO mapping |
| assessment_clo_mapping | (assessment_component_id, course_learning_outcome_id) | Unique assessment-CLO mapping |
| question_clo_mapping | (question_id, course_learning_outcome_id) | Unique question-CLO mapping |

---

## Check Constraints

### ENUM Constraints

#### users table
```sql
role ENUM('admin','dean','hod','teacher','student','staff')
blood_group VARCHAR(5) -- Should contain values like: A+, A-, B+, B-, AB+, AB-, O+, O-
```

#### genders table
```sql
name ENUM('male','female','other')
```

#### degrees table
```sql
degree_type ENUM('bachelor','master','diploma','phd')
```

#### semesters table
```sql
semester_type ENUM('fall','spring','summer')
```

#### courses table
```sql
course_type ENUM('theory','lab','project','thesis')
elective_type ENUM('core','major_elective','general_elective','minor')
status ENUM('draft','pending_approval','approved','archived')
```

#### course_offerings table
```sql
status ENUM('planning','open','ongoing','closed','completed')
```

#### course_enrollments table
```sql
status ENUM('enrolled','dropped','completed','withdrawn')
```

#### students table
```sql
residential_status ENUM('resident','non_resident')
academic_status ENUM('active','graduated','suspended','withdrawn','on_leave')
```

#### assessment_types table
```sql
category ENUM('formative','summative')
```

#### questions table
```sql
question_type ENUM('mcq','short_answer','essay','practical','coding')
difficulty_level ENUM('easy','medium','hard')
```

#### peo_plo_mapping table
```sql
correlation_level ENUM('high','medium','low')
```

#### clo_plo_mapping table
```sql
mapping_level ENUM('1','2','3') -- 1=Low, 2=Medium, 3=High
```

### Numeric Range Constraints

```sql
-- Bloom taxonomy levels
bloom_taxonomy_levels.level_number: 1-6

-- Credits and marks
courses.credit: >= 0
courses.total_marks: >= 0
assessment_components.total_marks: >= 0
assessment_components.weight_percentage: 0-100

-- Attainment scores
course_learning_outcomes.target_attainment: 0-100
program_learning_outcomes.target_attainment: 0-100
student_clo_attainment.attainment_score: 0-100
student_plo_attainment.attainment_score: 0-100

-- CGPA
cgpas.cgpa: 0.00-4.00 (or 0.00-5.00 depending on system)
course_results.gpa: 0.00-4.00
semester_results.sgpa: 0.00-4.00
semester_results.cgpa: 0.00-4.00
```

---

## Default Constraints

| Table | Column | Default Value | Description |
|-------|--------|---------------|-------------|
| users | is_active | TRUE | Users active by default |
| users | is_pii | TRUE | Contains PII by default |
| users | consent_given | FALSE | Consent not given by default |
| users | created_at | CURRENT_TIMESTAMP | Auto timestamp |
| users | updated_at | CURRENT_TIMESTAMP ON UPDATE | Auto update timestamp |
| faculties | is_active | TRUE | Active by default |
| departments | is_active | TRUE | Active by default |
| degrees | is_active | TRUE | Active by default |
| academic_sessions | is_active | FALSE | Inactive until activated |
| semesters | is_active | FALSE | Inactive until activated |
| courses | version | 1 | Initial version |
| courses | status | 'draft' | Draft status by default |
| courses | is_active | TRUE | Active by default |
| course_offerings | enrolled_count | 0 | No enrollments initially |
| course_offerings | max_students | 40 | Default class size |
| course_offerings | status | 'planning' | Planning status initially |
| course_enrollments | status | 'enrolled' | Enrolled status by default |
| course_learning_outcomes | weight_percentage | 0 | No weight initially |
| course_learning_outcomes | target_attainment | 60.00 | 60% target by default |
| course_learning_outcomes | version | 1 | Initial version |
| program_learning_outcomes | target_attainment | 60.00 | 60% target by default |
| program_learning_outcomes | version | 1 | Initial version |
| students | academic_status | 'active' | Active by default |
| assessment_components | is_published | FALSE | Not published initially |
| assessment_types | is_active | TRUE | Active by default |

---

## Index Constraints

### Primary Indexes (Automatically created with PRIMARY KEY)
- All id columns have primary key indexes

### Unique Indexes (Automatically created with UNIQUE constraint)
- See [Unique Constraints](#unique-constraints) section

### Performance Indexes

See [089_add_performance_indexes.sql](../migrations/089_add_performance_indexes.sql) for complete list of performance indexes including:

- **Lookup Indexes**: For frequently queried columns (email, username, codes)
- **Foreign Key Indexes**: For join operations
- **Composite Indexes**: For multi-column queries
- **Covering Indexes**: Including multiple columns to avoid table lookups
- **Ordering Indexes**: DESC indexes for ORDER BY queries
- **Date Range Indexes**: For time-based queries

---

## Constraint Naming Conventions

### Primary Keys
```
pk_[table_name]
Example: pk_users, pk_courses
```

### Foreign Keys
```
fk_[table_name]_[column_name]
Example: fk_students_user_id, fk_courses_department_id
```

### Unique Constraints
```
uq_[table_name]_[column_name(s)]
Example: uq_users_email, uq_course_offerings_course_semester_section
```

### Indexes
```
idx_[table_name]_[column_name(s)]
Example: idx_users_email, idx_courses_dept_degree
```

### Check Constraints
```
chk_[table_name]_[column_name]_[condition]
Example: chk_cgpas_value_range, chk_courses_credit_positive
```

---

## Constraint Best Practices

### 1. **Referential Integrity**
- All foreign keys properly defined with appropriate CASCADE rules
- Use `CASCADE` for child records that should be deleted with parent
- Use `SET NULL` for optional relationships
- Use `RESTRICT` to prevent deletion of referenced records

### 2. **Data Integrity**
- ENUM types for controlled vocabularies
- NOT NULL constraints on required fields
- Appropriate default values
- Check constraints for value ranges

### 3. **Performance**
- Indexes on all foreign key columns
- Composite indexes for frequently joined columns
- Covering indexes for common query patterns
- Regular index maintenance and analysis

### 4. **Soft Deletes**
- `deleted_at` column with index for soft delete support
- `deleted_by` foreign key to track who deleted
- Queries must filter `deleted_at IS NULL` for active records

### 5. **Audit Trail**
- `created_at` and `updated_at` timestamps on all tables
- Audit logs table for tracking all changes
- IP address and user agent tracking in audit logs

---

## Verification Queries

### Check All Foreign Keys
```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'obe_system'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;
```

### Check All Unique Constraints
```sql
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'obe_system'
AND NON_UNIQUE = 0
AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Check All Indexes
```sql
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    NON_UNIQUE,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns,
    INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'obe_system'
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE, INDEX_TYPE
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Check Missing Indexes on Foreign Keys
```sql
SELECT 
    kcu.TABLE_NAME,
    kcu.COLUMN_NAME,
    kcu.REFERENCED_TABLE_NAME,
    kcu.REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE kcu
LEFT JOIN information_schema.STATISTICS s 
    ON kcu.TABLE_SCHEMA = s.TABLE_SCHEMA
    AND kcu.TABLE_NAME = s.TABLE_NAME
    AND kcu.COLUMN_NAME = s.COLUMN_NAME
WHERE kcu.TABLE_SCHEMA = 'obe_system'
    AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    AND s.INDEX_NAME IS NULL;
```

---

## Related Documentation

- [Database Schema](database_revised.md) - Complete schema documentation
- [Migration Files](../migrations/) - SQL migration files
- [Performance Indexes](../migrations/089_add_performance_indexes.sql) - Additional indexes
- [Table Partitioning](table_partitioning.sql) - Partitioning configuration
- [Database Maintenance](database_maintenance.sql) - Maintenance procedures

---

**Last Updated**: February 3, 2026  
**Version**: 2.0  
**Maintained By**: Database Administration Team
