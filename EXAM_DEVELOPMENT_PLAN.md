# OBE System - University Exam Demo Development Plan

> **🎯 Goal:** Create a working OBE system demo for university examination
> **⏱️ Timeline:** 2-3 weeks intensive development
> **Focus:** Core OBE features that demonstrate the complete cycle

---

## 📋 What's Already Completed

✅ **Phase 1:** Project setup, folder structure, dependencies installed  
✅ **Phase 2:** All 89 database migrations created and tested  
✅ **Phase 3.1:** Configuration files (database, redis, auth, app, storage, email, queue)  
✅ **Phase 3.2.1:** BaseModel with CRUD operations  
✅ **Phase 3.2.2:** BaseRepository with data access patterns  
✅ **Phase 3.3:** BaseService with validation, error handling, transactions, and lifecycle hooks  

---

## 🚀 Remaining Development Steps

### Step 1: Complete Backend Architecture (Day 1-2)

#### ~~Step 1.1: Create BaseService~~ ✅ COMPLETED
**Location:** `obe-system/backend/services/BaseService.js`

**Status:** ✅ **Completed on February 3, 2026**

**What was created:**
- ✅ `BaseService.js` - Abstract base service class with all required features
- ✅ `AppError.js` - Custom error classes (ValidationError, NotFoundError, etc.)
- ✅ `FacultyService.example.js` - Complete example implementation
- ✅ `services/README.md` - Comprehensive documentation

**Features implemented:**
- Standard CRUD methods: getAll, getById, create, update, delete
- Joi validation integration
- Custom error handling (8 error types)
- Transaction management (auto & manual)
- Lifecycle hooks: beforeCreate, afterCreate, beforeUpdate, afterUpdate, beforeDelete, afterDelete
- Bulk operations: bulkCreate, bulkUpdate
- Utility methods: exists, count, findOne
- Pagination support

#### Step 1.2: Create BaseController
**Location:** `obe-system/backend/controllers/BaseController.js`

**Prompt for Copilot:**
```
Create a BaseController class for Express.js that:
1. Accepts a service in constructor
2. Provides standard REST methods: index, show, store, update, destroy
3. Uses asyncHandler wrapper to catch errors
4. Returns consistent JSON responses: { success: true, data: {}, message: '', meta: {} }
5. Handles pagination from query params (page, limit, sort)
6. Includes input sanitization
```

#### Step 1.3: Create Error Handling Middleware
**Location:** `obe-system/backend/middlewares/errorHandler.js`

**Prompt for Copilot:**
```
Create Express error handling middleware that:
1. Defines custom AppError class with statusCode, status, isOperational
2. Handles different error types: ValidationError, DatabaseError, AuthenticationError, NotFoundError
3. Returns JSON error response: { success: false, error: { message, code, details } }
4. Logs errors with Winston logger
5. Hides stack traces in production
6. Handles MySQL specific errors (duplicate entry, foreign key violation)
```

#### Step 1.4: Create Response Helper
**Location:** `obe-system/backend/utils/responseHelper.js`

**Prompt for Copilot:**
```
Create a response helper utility that provides:
1. success(res, data, message, statusCode) - for successful responses
2. error(res, message, statusCode, errors) - for error responses
3. paginated(res, data, pagination) - for paginated responses
4. created(res, data, message) - for 201 responses
5. noContent(res) - for 204 responses
All responses should follow format: { success, data, message, meta }
```

---

### Step 2: Authentication Module (Day 2-3)

#### Step 2.1: Create User Model
**Location:** `obe-system/backend/models/User.js`

**Prompt for Copilot:**
```
Create User model extending BaseModel for MySQL with mysql2:
1. Table: users (already exists in database)
2. Methods: findByEmail, findByUsername, verifyPassword, updatePassword
3. Password hashing with bcryptjs (12 rounds) on create/update
4. Hidden fields: password, remember_token (excluded from JSON)
5. Include role relationship (role field: admin, hod, teacher, student)
6. Soft delete support (deleted_at field)
```

#### Step 2.2: Create Auth Service
**Location:** `obe-system/backend/services/AuthService.js`

**Prompt for Copilot:**
```
Create AuthService class that handles:
1. login(email, password) - validate credentials, return JWT tokens
2. register(userData) - create user with hashed password
3. logout(userId, token) - invalidate token
4. refreshToken(refreshToken) - generate new access token
5. forgotPassword(email) - generate reset token, return it
6. resetPassword(token, newPassword) - validate token, update password
7. JWT access token expires in 1 hour, refresh token in 7 days
8. Use jsonwebtoken library
```

#### Step 2.3: Create Auth Controller
**Location:** `obe-system/backend/controllers/AuthController.js`

**Prompt for Copilot:**
```
Create AuthController with Express route handlers:
1. POST /login - login user, return tokens and user data
2. POST /register - register new user
3. POST /logout - logout user
4. POST /refresh-token - refresh access token
5. POST /forgot-password - send reset token
6. POST /reset-password - reset password with token
7. GET /me - get current authenticated user
8. Use express-validator for input validation
9. Return consistent JSON responses
```

#### Step 2.4: Create Auth Middleware
**Location:** `obe-system/backend/middlewares/auth.js`

**Prompt for Copilot:**
```
Create authentication middleware for Express:
1. authenticate - verify JWT token from Authorization header (Bearer token)
2. authorize(...roles) - check if user has required role
3. optionalAuth - attach user if token exists, continue if not
4. Extract user from token and attach to req.user
5. Handle token expiration and invalid token errors
6. Use jsonwebtoken library
```

#### Step 2.5: Create Auth Routes
**Location:** `obe-system/backend/routes/auth.js`

**Prompt for Copilot:**
```
Create Express router for auth endpoints:
POST /api/v1/auth/login
POST /api/v1/auth/register  
POST /api/v1/auth/logout (protected)
POST /api/v1/auth/refresh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET /api/v1/auth/me (protected)
Apply rate limiting: 5 requests per minute for login/register
```

---

### Step 3: Core Academic Models (Day 3-4)

#### Step 3.1: Create Faculty Model & API
**Prompt for Copilot:**
```
Create complete CRUD for faculties:
- Model: obe-system/backend/models/Faculty.js (table: faculties)
- Service: obe-system/backend/services/FacultyService.js
- Controller: obe-system/backend/controllers/FacultyController.js
- Routes: obe-system/backend/routes/faculties.js
Fields: id, name, short_name, description, established_date, is_active
Include: getDepartments() method to get related departments
Routes: GET/POST /api/v1/faculties, GET/PUT/DELETE /api/v1/faculties/:id
```

#### Step 3.2: Create Department Model & API
**Prompt for Copilot:**
```
Create complete CRUD for departments:
- Model: obe-system/backend/models/Department.js (table: departments)
- Service: obe-system/backend/services/DepartmentService.js  
- Controller: obe-system/backend/controllers/DepartmentController.js
- Routes: obe-system/backend/routes/departments.js
Fields: id, faculty_id, name, short_name, code, description, is_active
Include: getFaculty(), getCourses(), getTeachers() relationship methods
Routes: GET/POST /api/v1/departments, GET/PUT/DELETE /api/v1/departments/:id
```

#### Step 3.3: Create Degree Model & API
**Prompt for Copilot:**
```
Create complete CRUD for degrees:
- Model: obe-system/backend/models/Degree.js (table: degrees)
- Service: obe-system/backend/services/DegreeService.js
- Controller: obe-system/backend/controllers/DegreeController.js
- Routes: obe-system/backend/routes/degrees.js
Fields: id, department_id, name, short_name, degree_type, total_credits, duration_years
Include: getDepartment(), getPLOs(), getPEOs() methods
```

#### Step 3.4: Create Course Model & API
**Prompt for Copilot:**
```
Create complete CRUD for courses:
- Model: obe-system/backend/models/Course.js (table: courses)
- Service: obe-system/backend/services/CourseService.js
- Controller: obe-system/backend/controllers/CourseController.js
- Routes: obe-system/backend/routes/courses.js
Fields: id, department_id, code, title, credit_hours, theory_hours, lab_hours, description
Include: getCLOs(), getObjectives(), getOfferings() methods
Routes: Full CRUD + GET /api/v1/courses/:id/clos, GET /api/v1/courses/:id/offerings
```

#### Step 3.5: Create Student Model & API
**Prompt for Copilot:**
```
Create complete CRUD for students:
- Model: obe-system/backend/models/Student.js (table: students)
- Service: obe-system/backend/services/StudentService.js
- Controller: obe-system/backend/controllers/StudentController.js
- Routes: obe-system/backend/routes/students.js
Fields: id, user_id, student_id (roll number), department_id, degree_id, batch, section, admission_date
Include: getUser(), getEnrollments(), getResults(), getCLOAttainments() methods
Routes: Full CRUD + GET /api/v1/students/:id/enrollments, GET /api/v1/students/:id/results
```

#### Step 3.6: Create Teacher Model & API
**Prompt for Copilot:**
```
Create complete CRUD for teachers:
- Model: obe-system/backend/models/Teacher.js (table: teachers)
- Service: obe-system/backend/services/TeacherService.js
- Controller: obe-system/backend/controllers/TeacherController.js
- Routes: obe-system/backend/routes/teachers.js
Fields: id, user_id, department_id, designation_id, employee_id, joining_date, specialization
Include: getUser(), getCourseOfferings(), getDepartment() methods
```

---

### Step 4: OBE Core Models (Day 4-5) ⭐ CRITICAL

#### Step 4.1: Create CLO (Course Learning Outcome) Model & API
**Prompt for Copilot:**
```
Create complete CRUD for Course Learning Outcomes (CLO):
- Model: obe-system/backend/models/CourseLearningOutcome.js (table: course_learning_outcomes)
- Service: obe-system/backend/services/CLOService.js
- Controller: obe-system/backend/controllers/CLOController.js
- Routes: obe-system/backend/routes/clos.js
Fields: id, course_id, clo_code (CLO1, CLO2...), description, bloom_level_id
Include methods:
  - getPLOMappings() - get mapped PLOs with strength
  - getAssessments() - get assessments measuring this CLO
  - calculateAttainment(courseOfferingId) - calculate attainment percentage
Routes: Full CRUD + POST /api/v1/clos/:id/map-plo, GET /api/v1/clos/:id/attainment
```

#### Step 4.2: Create PLO (Program Learning Outcome) Model & API
**Prompt for Copilot:**
```
Create complete CRUD for Program Learning Outcomes (PLO):
- Model: obe-system/backend/models/ProgramLearningOutcome.js (table: program_learning_outcomes)
- Service: obe-system/backend/services/PLOService.js
- Controller: obe-system/backend/controllers/PLOController.js
- Routes: obe-system/backend/routes/plos.js
Fields: id, degree_id, plo_code (PLO1, PLO2...), description, plo_domain (cognitive, affective, psychomotor)
Include methods:
  - getCLOMappings() - get all CLOs mapped to this PLO
  - getPEOMappings() - get mapped PEOs
  - calculateAttainment(batchId) - calculate program-level attainment
Routes: Full CRUD + GET /api/v1/plos/:id/clo-mappings, GET /api/v1/plos/:id/attainment
```

#### Step 4.3: Create PEO (Program Educational Objective) Model & API
**Prompt for Copilot:**
```
Create complete CRUD for Program Educational Objectives (PEO):
- Model: obe-system/backend/models/ProgramEducationalObjective.js (table: program_educational_objectives)
- Service: obe-system/backend/services/PEOService.js
- Controller: obe-system/backend/controllers/PEOController.js
- Routes: obe-system/backend/routes/peos.js
Fields: id, degree_id, peo_code (PEO1, PEO2...), description
Include methods:
  - getPLOMappings() - get all PLOs mapped to this PEO
Routes: Full CRUD + POST /api/v1/peos/:id/map-plo
```

#### Step 4.4: Create CLO-PLO Mapping API
**Prompt for Copilot:**
```
Create API for CLO-PLO mapping (table: clo_plo_mapping):
- Service: obe-system/backend/services/CLOPLOMappingService.js
- Controller: obe-system/backend/controllers/CLOPLOMappingController.js
- Routes: obe-system/backend/routes/clo-plo-mappings.js
Fields: id, clo_id, plo_id, mapping_strength (1=Low, 2=Medium, 3=High)
Methods:
  - createMapping(cloId, ploId, strength)
  - updateMapping(id, strength)
  - deleteMapping(id)
  - getMappingMatrix(courseId) - returns matrix of CLO vs PLO mappings
  - getByCourse(courseId) - all mappings for a course's CLOs
Routes: GET/POST /api/v1/clo-plo-mappings, PUT/DELETE /api/v1/clo-plo-mappings/:id
GET /api/v1/clo-plo-mappings/matrix/:courseId
```

#### Step 4.5: Create Bloom's Taxonomy API
**Prompt for Copilot:**
```
Create API for Bloom's Taxonomy levels (table: bloom_taxonomy_levels):
- Model: obe-system/backend/models/BloomTaxonomyLevel.js
- Routes: obe-system/backend/routes/bloom-taxonomy.js
Fields: id, level_number (1-6), name, description, action_verbs
Seed data already exists with 6 levels: Remember, Understand, Apply, Analyze, Evaluate, Create
Routes: GET /api/v1/bloom-taxonomy (list all levels)
This is mostly read-only for the frontend to populate dropdowns
```

---

### Step 5: Assessment Module (Day 5-6) ⭐ CRITICAL

#### Step 5.1: Create Course Offering Model & API
**Prompt for Copilot:**
```
Create complete CRUD for course offerings (table: course_offerings):
- Model: obe-system/backend/models/CourseOffering.js
- Service: obe-system/backend/services/CourseOfferingService.js
- Controller: obe-system/backend/controllers/CourseOfferingController.js
- Routes: obe-system/backend/routes/course-offerings.js
Fields: id, course_id, semester_id, teacher_id, section, max_students, is_active
Include methods:
  - getCourse(), getSemester(), getTeacher()
  - getEnrollments() - students enrolled
  - getAssessments() - assessment components
  - getCLOAttainmentSummary() - CLO attainment for this offering
Routes: Full CRUD + GET /api/v1/course-offerings/:id/students
GET /api/v1/course-offerings/:id/assessments, GET /api/v1/course-offerings/:id/clo-attainment
```

#### Step 5.2: Create Assessment Component Model & API
**Prompt for Copilot:**
```
Create complete CRUD for assessment components (table: assessment_components):
- Model: obe-system/backend/models/AssessmentComponent.js
- Service: obe-system/backend/services/AssessmentService.js
- Controller: obe-system/backend/controllers/AssessmentController.js
- Routes: obe-system/backend/routes/assessments.js
Fields: id, course_offering_id, assessment_type_id, name, total_marks, weightage, date
Include methods:
  - getCLOMappings() - which CLOs this assessment measures
  - getQuestions() - questions in this assessment
  - getStudentMarks() - all student marks
Routes: Full CRUD + POST /api/v1/assessments/:id/map-clo
GET /api/v1/assessments/:id/marks, POST /api/v1/assessments/:id/marks (bulk entry)
```

#### Step 5.3: Create Assessment-CLO Mapping API
**Prompt for Copilot:**
```
Create API for Assessment-CLO mapping (table: assessment_clo_mapping):
- Service: obe-system/backend/services/AssessmentCLOMappingService.js
- Controller: obe-system/backend/controllers/AssessmentCLOMappingController.js
Fields: id, assessment_component_id, clo_id, marks_allocated
Methods:
  - mapCLOsToAssessment(assessmentId, mappings[]) - bulk map CLOs with marks
  - getAssessmentCLOs(assessmentId) - get all CLOs for an assessment
  - updateMapping(id, marksAllocated)
This determines how many marks from each assessment contribute to each CLO
```

#### Step 5.4: Create Question Model & API (Optional but helpful)
**Prompt for Copilot:**
```
Create CRUD for questions (table: questions):
- Model: obe-system/backend/models/Question.js
- Service: obe-system/backend/services/QuestionService.js
- Controller: obe-system/backend/controllers/QuestionController.js
- Routes: obe-system/backend/routes/questions.js
Fields: id, assessment_component_id, question_number, question_text, marks, clo_id
This allows question-level CLO mapping for detailed attainment calculation
Routes: Full CRUD + bulk create POST /api/v1/questions/bulk
```

---

### Step 6: Marks Entry & Results (Day 6-7) ⭐ CRITICAL

#### Step 6.1: Create Course Enrollment API
**Prompt for Copilot:**
```
Create API for course enrollments (table: course_enrollments):
- Model: obe-system/backend/models/CourseEnrollment.js
- Service: obe-system/backend/services/EnrollmentService.js
- Controller: obe-system/backend/controllers/EnrollmentController.js
- Routes: obe-system/backend/routes/enrollments.js
Fields: id, course_offering_id, student_id, enrollment_date, status
Methods:
  - enrollStudent(courseOfferingId, studentId)
  - bulkEnroll(courseOfferingId, studentIds[])
  - getStudentsByCourseOffering(courseOfferingId)
  - dropStudent(enrollmentId)
Routes: POST /api/v1/enrollments, POST /api/v1/enrollments/bulk
GET /api/v1/course-offerings/:id/enrollments
```

#### Step 6.2: Create Student Marks Entry API
**Prompt for Copilot:**
```
Create API for student marks (table: student_assessment_marks):
- Model: obe-system/backend/models/StudentMark.js
- Service: obe-system/backend/services/MarksService.js
- Controller: obe-system/backend/controllers/MarksController.js
- Routes: obe-system/backend/routes/marks.js
Fields: id, assessment_component_id, student_id, marks_obtained, remarks
Methods:
  - enterMarks(assessmentId, studentId, marks)
  - bulkEnterMarks(assessmentId, marksData[]) - [{studentId, marks}, ...]
  - getMarksByAssessment(assessmentId) - all students' marks
  - getMarksByStudent(studentId, courseOfferingId) - student's all assessment marks
  - updateMarks(id, marks)
Routes: POST /api/v1/marks, POST /api/v1/marks/bulk
GET /api/v1/assessments/:id/marks, GET /api/v1/students/:id/marks
```

#### Step 6.3: Create Question-Level Marks API (Optional)
**Prompt for Copilot:**
```
Create API for question-level marks (table: student_question_marks):
- Model: obe-system/backend/models/StudentQuestionMark.js
- Service: Add to MarksService.js
Fields: id, student_assessment_mark_id, question_id, marks_obtained
This enables more granular CLO attainment calculation at question level
Methods: bulkEnterQuestionMarks(studentAssessmentMarkId, questionMarks[])
```

---

### Step 7: CLO Attainment Calculation (Day 7-8) ⭐ MOST CRITICAL

#### Step 7.1: Create Attainment Calculation Service
**Prompt for Copilot:**
```
Create AttainmentCalculationService in obe-system/backend/services/AttainmentCalculationService.js:

This is the CORE of OBE system. Implement these methods:

1. calculateStudentCLOAttainment(studentId, courseOfferingId)
   - Get all assessments for the course offering
   - Get CLO mappings for each assessment
   - Get student's marks for each assessment
   - For each CLO:
     * Sum (marks_obtained * clo_marks_ratio) across all assessments
     * Sum (total_possible * clo_marks_ratio) across all assessments
     * CLO Attainment % = (obtained / possible) * 100
   - Save to student_clo_attainment table
   - Return: [{cloId, cloCode, attainmentPercentage, isAttained}]

2. calculateCourseCLOAttainment(courseOfferingId)
   - Calculate for all enrolled students
   - For each CLO:
     * Count students with attainment >= threshold (default 60%)
     * Course CLO Attainment % = (attained_students / total_students) * 100
   - Save to course_clo_attainment_summary table
   - Return: [{cloId, cloCode, averageAttainment, attainmentRate, studentsAttained, totalStudents}]

3. calculateStudentPLOAttainment(studentId, degreeId)
   - Get all CLO attainments for the student across courses
   - For each PLO:
     * Get all CLOs mapped to this PLO with mapping_strength
     * PLO Score = Σ(CLO_Attainment * mapping_strength * course_credits) / Σ(mapping_strength * credits)
   - Save to student_plo_attainment table
   - Return: [{ploId, ploCode, attainmentPercentage}]

4. calculateProgramPLOAttainment(degreeId, batchYear)
   - Calculate for all students in the batch
   - For each PLO:
     * Average all students' PLO attainments
     * Count students with PLO >= threshold
   - Save to program_plo_attainment_summary table
   - Return: [{ploId, ploCode, averageAttainment, attainmentRate}]
```

#### Step 7.2: Create Attainment Controller & Routes
**Prompt for Copilot:**
```
Create AttainmentController in obe-system/backend/controllers/AttainmentController.js:
- Routes: obe-system/backend/routes/attainment.js

Endpoints:
POST /api/v1/attainment/calculate/student-clo
  Body: { studentId, courseOfferingId }
  Calculates and returns student's CLO attainment

POST /api/v1/attainment/calculate/course-clo
  Body: { courseOfferingId }
  Calculates all students' CLO attainment and course summary

POST /api/v1/attainment/calculate/student-plo
  Body: { studentId, degreeId }
  Calculates student's PLO attainment

POST /api/v1/attainment/calculate/program-plo
  Body: { degreeId, batchYear }
  Calculates program-level PLO attainment

GET /api/v1/attainment/student/:studentId/clo?courseOfferingId=X
  Returns student's CLO attainment for a course

GET /api/v1/attainment/course/:courseOfferingId/clo
  Returns course CLO attainment summary

GET /api/v1/attainment/student/:studentId/plo
  Returns student's PLO attainment

GET /api/v1/attainment/program/:degreeId/plo?batch=2023
  Returns program PLO attainment summary
```

#### Step 7.3: Create Attainment Threshold Settings
**Prompt for Copilot:**
```
Create API for attainment thresholds (table: attainment_thresholds):
- Model: obe-system/backend/models/AttainmentThreshold.js
- Routes: Add to settings routes

Default thresholds (seeded):
- CLO minimum: 60%
- CLO target: 75%  
- PLO minimum: 60%
- PLO target: 70%

Methods:
- getThresholds(degreeId) - get thresholds for a degree
- updateThreshold(id, value)
```

---

### Step 8: Reports API (Day 8-9)

#### Step 8.1: Create Report Generation Service
**Prompt for Copilot:**
```
Create ReportService in obe-system/backend/services/ReportService.js:

1. generateCLOAttainmentReport(courseOfferingId)
   - Fetch course details, CLOs, all student CLO attainments
   - Format data for table display
   - Return: { course, clos[], students[], attainmentMatrix[][], summary }

2. generatePLOAttainmentReport(degreeId, batchYear)
   - Fetch degree details, PLOs, all student PLO attainments
   - Return: { degree, plos[], students[], attainmentMatrix[][], summary }

3. generateCLOPLOMappingReport(courseId)
   - Fetch course CLOs and their PLO mappings
   - Return matrix showing CLO vs PLO with mapping strengths

4. generateStudentTranscript(studentId)
   - Fetch all courses, marks, CLO attainments, PLO attainments
   - Return comprehensive student OBE transcript

5. generateGapAnalysisReport(courseOfferingId)
   - Identify CLOs below threshold
   - Suggest which assessments contributed to low attainment
   - Return: { underperformingCLOs[], recommendations[] }
```

#### Step 8.2: Create Report Controller & Routes
**Prompt for Copilot:**
```
Create ReportController in obe-system/backend/controllers/ReportController.js:
- Routes: obe-system/backend/routes/reports.js

Endpoints:
GET /api/v1/reports/clo-attainment/:courseOfferingId
GET /api/v1/reports/plo-attainment/:degreeId?batch=2023
GET /api/v1/reports/clo-plo-mapping/:courseId
GET /api/v1/reports/student-transcript/:studentId
GET /api/v1/reports/gap-analysis/:courseOfferingId

Optional: Add PDF export using pdfkit
GET /api/v1/reports/clo-attainment/:courseOfferingId/pdf
```

---

### Step 9: API Router Setup (Day 9)

#### Step 9.1: Create Main Router
**Prompt for Copilot:**
```
Create main API router in obe-system/backend/routes/index.js:

Combine all routes with /api/v1 prefix:
- /api/v1/auth - auth routes
- /api/v1/users - user management
- /api/v1/faculties - faculty CRUD
- /api/v1/departments - department CRUD
- /api/v1/degrees - degree CRUD
- /api/v1/courses - course CRUD
- /api/v1/students - student CRUD
- /api/v1/teachers - teacher CRUD
- /api/v1/clos - CLO CRUD
- /api/v1/plos - PLO CRUD
- /api/v1/peos - PEO CRUD
- /api/v1/clo-plo-mappings - CLO-PLO mapping
- /api/v1/bloom-taxonomy - Bloom's levels
- /api/v1/course-offerings - course offerings
- /api/v1/assessments - assessment components
- /api/v1/enrollments - course enrollments
- /api/v1/marks - marks entry
- /api/v1/attainment - attainment calculations
- /api/v1/reports - report generation

Apply authentication middleware to protected routes
```

#### Step 9.2: Update App.js Entry Point
**Prompt for Copilot:**
```
Update obe-system/backend/app.js to:
1. Import and use all middlewares (cors, helmet, morgan, compression)
2. Apply rate limiting
3. Parse JSON body
4. Mount API router at /api/v1
5. Add 404 handler for unknown routes
6. Add global error handler middleware
7. Setup Swagger documentation at /api-docs
8. Add health check endpoint GET /health
```

---

### Step 10: Frontend Setup (Day 9-10)

#### Step 10.1: Setup Tailwind & Base Styling
**Prompt for Copilot:**
```
Configure Tailwind CSS in obe-system/frontend with a professional theme:

tailwind.config.js:
- Primary color: Blue (#3B82F6)
- Secondary color: Indigo (#6366F1)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Danger: Red (#EF4444)
- Gray scale for backgrounds and text
- Custom font: Inter or system font stack
- Add container center, padding

Create src/styles/index.css with:
- Base styles for body, headings
- Form input styles
- Table styles
- Button variants
- Card styles
```

#### Step 10.2: Create Layout Components
**Prompt for Copilot:**
```
Create layout components in obe-system/frontend/src/layouts/:

1. MainLayout.jsx - For authenticated users
   - Sidebar navigation (collapsible)
   - Top header with user menu, notifications
   - Main content area
   - Modern, clean design with shadows and rounded corners

2. AuthLayout.jsx - For login/register pages
   - Centered card layout
   - Background gradient or pattern
   - Logo at top

3. Sidebar.jsx - Navigation sidebar
   - Logo at top
   - Navigation links with icons
   - Collapsible with hamburger
   - Active state highlighting
   - Role-based menu items

4. Header.jsx - Top header
   - Page title/breadcrumb
   - Search bar (optional)
   - User avatar dropdown
   - Notification bell
```

#### Step 10.3: Create Reusable UI Components
**Prompt for Copilot:**
```
Create reusable components in obe-system/frontend/src/components/ui/:

1. Button.jsx - Primary, secondary, outline, danger, sizes (sm, md, lg), loading state
2. Input.jsx - Text input with label, error message, icon support
3. Select.jsx - Dropdown select with label, error, searchable option
4. Card.jsx - Container with header, body, footer sections
5. Modal.jsx - Dialog with overlay, close button, sizes
6. Table.jsx - Sortable columns, pagination, loading skeleton
7. Badge.jsx - Status badges (success, warning, danger, info)
8. Alert.jsx - Success, error, warning, info alerts
9. Spinner.jsx - Loading spinner component
10. EmptyState.jsx - No data illustration with message
11. Pagination.jsx - Page navigation component
12. Breadcrumb.jsx - Navigation breadcrumb

All components should use Tailwind CSS and follow consistent design
```

#### Step 10.4: Setup State Management & API
**Prompt for Copilot:**
```
Setup state management in obe-system/frontend/src/:

1. store/authStore.js - Zustand store for auth
   - user, token, isAuthenticated
   - login, logout, setUser actions

2. services/api.js - Axios instance
   - Base URL from env
   - Request interceptor to add token
   - Response interceptor for errors
   - Handle 401 by logging out

3. hooks/useAuth.js - Auth hook
   - Wraps authStore
   - Provides login, logout, isAuthenticated

4. hooks/useApi.js - Generic API hook with React Query
   - useQuery wrapper for GET requests
   - useMutation wrapper for POST/PUT/DELETE
```

---

### Step 11: Frontend Authentication (Day 10-11)

#### Step 11.1: Create Login Page
**Prompt for Copilot:**
```
Create Login page in obe-system/frontend/src/pages/auth/Login.jsx:

Design:
- Centered card on gradient background
- University/App logo at top
- "Welcome Back" heading
- Email input with icon
- Password input with show/hide toggle
- "Remember me" checkbox
- Login button (primary, full width)
- "Forgot password?" link
- Form validation with react-hook-form
- Loading state on submit
- Error message display
- Redirect to dashboard on success

Use AuthLayout, modern and professional look
```

#### Step 11.2: Create Register Page
**Prompt for Copilot:**
```
Create Register page in obe-system/frontend/src/pages/auth/Register.jsx:

Fields:
- Full name
- Email
- Username
- Password (with strength indicator)
- Confirm password
- Role selection (student/teacher)
- Terms checkbox

Validation, loading state, success redirect
Similar design to Login page
```

#### Step 11.3: Create Protected Route Component
**Prompt for Copilot:**
```
Create ProtectedRoute in obe-system/frontend/src/components/ProtectedRoute.jsx:

- Check if user is authenticated
- If not, redirect to /login
- Optionally check for required roles
- Show loading while checking auth state
- Render children if authorized
```

---

### Step 12: Frontend Dashboard (Day 11-12)

#### Step 12.1: Create Dashboard Page
**Prompt for Copilot:**
```
Create Dashboard in obe-system/frontend/src/pages/Dashboard.jsx:

For Admin/HOD:
- Stats cards: Total Courses, Students, Teachers, Departments
- Recent CLO attainment summary chart (bar chart)
- PLO attainment overview (radar chart)
- Quick actions: Add Course, View Reports
- Recent activity feed

For Teacher:
- My courses list with quick CLO attainment status
- Pending marks entry alerts
- Recent assessment submissions
- Quick links: Enter Marks, View Attainment

For Student:
- Enrolled courses with CLO progress
- Overall PLO attainment progress bars
- Upcoming assessments
- Recent results

Use Chart.js/Recharts for visualizations
Clean card-based layout with proper spacing
```

---

### Step 13: Frontend Course Management (Day 12-13)

#### Step 13.1: Create Course List Page
**Prompt for Copilot:**
```
Create Courses list in obe-system/frontend/src/pages/courses/CourseList.jsx:

Features:
- Table with columns: Code, Title, Credits, Department, Status
- Search by code or title
- Filter by department
- Pagination
- "Add Course" button (for authorized users)
- Click row to view course details
- Actions column: Edit, Delete, View CLOs

Use Table component, clean design with hover states
```

#### Step 13.2: Create Course Form Page
**Prompt for Copilot:**
```
Create Course form in obe-system/frontend/src/pages/courses/CourseForm.jsx:

Used for both create and edit (check for courseId param)

Fields:
- Course Code (input)
- Title (input)
- Department (select)
- Credit Hours (number)
- Theory Hours (number)
- Lab Hours (number)
- Description (textarea)
- Prerequisites (multi-select courses)

Form validation, loading state on submit
Cancel and Save buttons
Breadcrumb navigation
```

#### Step 13.3: Create Course Detail Page
**Prompt for Copilot:**
```
Create Course detail in obe-system/frontend/src/pages/courses/CourseDetail.jsx:

Tabs:
1. Overview - Course info, description, credits
2. CLOs - List of Course Learning Outcomes with Bloom level
   - Add/Edit/Delete CLO buttons
   - Show which PLOs each CLO is mapped to
3. Offerings - Course offerings by semester
   - Teacher, section, enrollment count
4. PLO Mapping - CLO-PLO mapping matrix view
   - Interactive matrix to set mapping strengths (1/2/3)

Clean tabbed interface, edit buttons for authorized users
```

---

### Step 14: Frontend CLO Management (Day 13-14) ⭐ CRITICAL

#### Step 14.1: Create CLO Management Interface
**Prompt for Copilot:**
```
Create CLO management in obe-system/frontend/src/pages/courses/CLOManagement.jsx:

Features:
- List of CLOs for a course in cards or table
- Each CLO shows: Code (CLO1, CLO2...), Description, Bloom Level
- Add CLO modal/form:
  * CLO Code (auto-increment suggestion)
  * Description (textarea)
  * Bloom Level (select from 6 levels with descriptions)
- Edit CLO inline or modal
- Delete CLO with confirmation
- Drag to reorder CLOs (optional)

Clean card-based design showing Bloom level badge
```

#### Step 14.2: Create CLO-PLO Mapping Matrix
**Prompt for Copilot:**
```
Create CLO-PLO Mapping Matrix in obe-system/frontend/src/pages/courses/CLOPLOMatrix.jsx:

Display:
- Matrix/table with CLOs as rows, PLOs as columns
- Each cell shows mapping strength: Empty, 1 (Low), 2 (Medium), 3 (High)
- Click cell to cycle through: Empty → 1 → 2 → 3 → Empty
- Or dropdown in each cell to select strength

Color coding:
- Empty: Light gray
- 1 (Low): Light yellow
- 2 (Medium): Light orange  
- 3 (High): Light green

Save button to persist all changes
Show PLO descriptions on hover
Visual, intuitive interface
```

---

### Step 15: Frontend Assessment & Marks (Day 14-15) ⭐ CRITICAL

#### Step 15.1: Create Assessment Management
**Prompt for Copilot:**
```
Create Assessment management in obe-system/frontend/src/pages/assessments/AssessmentList.jsx:

For a course offering:
- List assessments: Quiz 1, Assignment 1, Midterm, Final, etc.
- Each shows: Name, Type, Total Marks, Weightage, Date, CLOs mapped
- Add Assessment form:
  * Name (input)
  * Type (select: Quiz, Assignment, Midterm, Final, Project, Lab)
  * Total Marks (number)
  * Weightage % (number, validate total = 100)
  * Date (date picker)
- Map CLOs to assessment:
  * Show all course CLOs
  * For each CLO, input marks allocated from this assessment
  * Total marks allocated must equal Total Marks

Clean table with action buttons
```

#### Step 15.2: Create Marks Entry Interface
**Prompt for Copilot:**
```
Create Marks Entry in obe-system/frontend/src/pages/marks/MarksEntry.jsx:

Features:
- Select course offering (dropdown)
- Select assessment (dropdown)
- Show student list with marks input:
  * Student ID, Name, Marks (input), Remarks
- Spreadsheet-like grid entry
- Tab/Enter to move between cells
- Validate marks <= total marks
- Show total entered vs total students
- Auto-save or explicit Save button
- Bulk import from Excel (optional)
- Show CLOs this assessment covers for reference

Clean grid interface, easy data entry
Show success/error feedback
```

#### Step 15.3: Create Student Marks View
**Prompt for Copilot:**
```
Create Student Marks View in obe-system/frontend/src/pages/students/StudentMarks.jsx:

For a student in a course:
- Show all assessments with marks obtained
- Calculate total marks and percentage
- Show CLO-wise breakdown:
  * Each CLO with attainment percentage
  * Progress bar visualization
  * Status badge (Attained/Not Attained based on threshold)

For student across all courses:
- Course-wise marks summary
- Overall CLO attainment
- PLO attainment progress

Clean dashboard view with progress indicators
```

---

### Step 16: Frontend Attainment Dashboard (Day 15-16) ⭐ CRITICAL

#### Step 16.1: Create CLO Attainment Dashboard
**Prompt for Copilot:**
```
Create CLO Attainment page in obe-system/frontend/src/pages/attainment/CLOAttainment.jsx:

For a course offering:
- Summary cards: Average Attainment, Students Attained, Target vs Actual
- Bar chart: CLO attainment percentages (CLO1, CLO2, etc.)
- Horizontal line showing threshold (60%)
- Table: Each CLO with attainment %, students above threshold, status
- Color coding: Red (<60%), Yellow (60-74%), Green (>=75%)
- Button to recalculate attainment
- Export to PDF/Excel buttons

Filters: Semester, Section
Clear visualizations with Chart.js/Recharts
```

#### Step 16.2: Create PLO Attainment Dashboard
**Prompt for Copilot:**
```
Create PLO Attainment page in obe-system/frontend/src/pages/attainment/PLOAttainment.jsx:

For a degree/program:
- Radar chart showing all PLO attainments
- Bar chart comparison across batches
- Table: Each PLO with attainment %, trend (up/down from last batch)
- Drill-down: Click PLO to see contributing CLOs and courses
- Student-wise PLO attainment table

Filters: Batch year, Department
Show both average attainment and attainment rate
```

#### Step 16.3: Create Student OBE Transcript
**Prompt for Copilot:**
```
Create Student OBE Transcript in obe-system/frontend/src/pages/students/OBETranscript.jsx:

Display:
- Student info header: Name, ID, Department, Batch
- Course-wise section:
  * Each course with CLO attainments
  * Mini bar chart for each course's CLOs
- PLO Progress section:
  * All PLOs with progress bars
  * Radar chart of PLO attainment
- Summary:
  * Total CLOs attained vs total
  * Total PLOs attained vs total
  * Overall OBE status

Print-friendly layout
Export to PDF button
```

---

### Step 17: Frontend PLO/PEO Management (Day 16-17)

#### Step 17.1: Create PLO Management Page
**Prompt for Copilot:**
```
Create PLO Management in obe-system/frontend/src/pages/plo/PLOManagement.jsx:

For a degree:
- List of PLOs with Code, Description, Domain
- Add/Edit/Delete PLOs
- Form fields: PLO Code, Description, Domain (Cognitive/Affective/Psychomotor)
- Show which CLOs map to each PLO (expandable)
- Show PEO mappings

Similar card-based design to CLO management
```

#### Step 17.2: Create PEO Management Page
**Prompt for Copilot:**
```
Create PEO Management in obe-system/frontend/src/pages/peo/PEOManagement.jsx:

For a degree:
- List of PEOs with Code, Description
- Add/Edit/Delete PEOs
- Show PLO mappings for each PEO
- PEO-PLO mapping matrix (similar to CLO-PLO)

Simpler than CLO since PEOs are high-level objectives
```

---

### Step 18: Frontend Reports (Day 17-18)

#### Step 18.1: Create Reports Page
**Prompt for Copilot:**
```
Create Reports page in obe-system/frontend/src/pages/reports/Reports.jsx:

Report types (cards):
1. CLO Attainment Report - Select course offering, generate
2. PLO Attainment Report - Select degree, batch, generate
3. CLO-PLO Mapping Report - Select course, generate matrix
4. Student OBE Transcript - Select student, generate
5. Gap Analysis Report - Select course, identify weak areas

Each report:
- Selection form/filters
- Generate button
- Preview in page
- Export buttons (PDF, Excel)

Clean card-based navigation to report types
```

---

### Step 19: Frontend Routing & Navigation (Day 18-19)

#### Step 19.1: Setup React Router
**Prompt for Copilot:**
```
Create routing in obe-system/frontend/src/App.jsx and src/routes.jsx:

Routes:
/ → Dashboard (protected)
/login → Login page
/register → Register page
/courses → Course list
/courses/new → Create course
/courses/:id → Course detail (with tabs for CLOs, offerings, mappings)
/courses/:id/edit → Edit course
/course-offerings/:id → Course offering detail
/course-offerings/:id/assessments → Assessment management
/course-offerings/:id/marks → Marks entry
/students → Student list
/students/:id → Student detail with OBE transcript
/teachers → Teacher list
/plos → PLO management
/peos → PEO management
/attainment/clo → CLO attainment dashboard
/attainment/plo → PLO attainment dashboard
/reports → Reports page
/settings → Settings (admin only)

Apply ProtectedRoute where needed
Apply MainLayout to authenticated routes
Apply AuthLayout to login/register
```

---

### Step 20: Integration & Testing (Day 19-21)

#### Step 20.1: Connect Frontend to Backend
**Prompt for Copilot:**
```
Create API service modules in obe-system/frontend/src/services/:

- authService.js - login, register, logout, getMe
- courseService.js - CRUD for courses
- cloService.js - CRUD for CLOs, CLO-PLO mappings
- ploService.js - CRUD for PLOs
- assessmentService.js - CRUD for assessments, CLO mappings
- marksService.js - marks entry, retrieval
- attainmentService.js - calculate and get attainment
- reportService.js - generate reports

Each service uses the api.js axios instance
Uses React Query hooks for data fetching
```

#### Step 20.2: Add Loading States & Error Handling
**Prompt for Copilot:**
```
Enhance all pages with:
1. Loading skeletons while fetching data
2. Error messages when API fails
3. Empty states when no data
4. Toast notifications for success/error actions
5. Confirmation dialogs for delete actions
6. Form validation error messages

Use react-hot-toast for notifications
Consistent UX across all pages
```

#### Step 20.3: Seed Demo Data
**Prompt for Copilot:**
```
Create seed script to populate demo data for exam presentation:

1. Admin user (admin@obe.edu / password123)
2. HOD user (hod@obe.edu / password123)  
3. Teacher user (teacher@obe.edu / password123)
4. Student users (student1@obe.edu, etc.)

5. Faculty: Engineering
6. Department: Computer Science
7. Degree: BSc in Computer Science

8. PLOs (6-8): Problem Solving, Technical Knowledge, Communication, etc.
9. PEOs (3-4): Career success, Lifelong learning, etc.

10. Course: CS101 - Introduction to Programming
    - 4 CLOs mapped to PLOs
    - 1 Course Offering (current semester)
    - 20 enrolled students
    - Assessments: Quiz 1, Assignment 1, Midterm, Final
    - Assessment-CLO mappings
    - Student marks for all assessments
    - Calculated CLO attainment

This provides realistic demo data for presentation
```

---

## 📋 Summary Checklist

### Backend (Steps 1-9)
- [ ] BaseService, BaseController, Error handling
- [ ] Authentication (login, register, JWT)
- [ ] Faculty, Department, Degree APIs
- [ ] Course, Student, Teacher APIs
- [ ] CLO, PLO, PEO APIs
- [ ] CLO-PLO Mapping API
- [ ] Assessment & Marks Entry APIs
- [ ] **Attainment Calculation Engine** ⭐
- [ ] Reports API
- [ ] Main router & app entry

### Frontend (Steps 10-19)
- [ ] Tailwind config & base styling
- [ ] Layout components (Sidebar, Header)
- [ ] Reusable UI components
- [ ] Auth pages (Login, Register)
- [ ] Dashboard
- [ ] Course management pages
- [ ] **CLO-PLO Mapping Matrix** ⭐
- [ ] Assessment management
- [ ] **Marks Entry Interface** ⭐
- [ ] **CLO Attainment Dashboard** ⭐
- [ ] **PLO Attainment Dashboard** ⭐
- [ ] Reports page
- [ ] Routing setup

### Final (Step 20)
- [ ] API integration
- [ ] Error handling & loading states
- [ ] Demo data seeding
- [ ] End-to-end testing

---

## 🎯 Demo Flow for Exam

1. **Login** as Admin → Show dashboard with stats
2. **Manage Course** → Create/view course with CLOs
3. **Setup CLO-PLO Mapping** → Show matrix interface
4. **Create Assessments** → Add quiz, assignment, exams with CLO mapping
5. **Enter Marks** → Show marks entry grid
6. **Calculate Attainment** → Trigger CLO calculation
7. **View CLO Attainment** → Show bar chart, percentage, threshold
8. **View PLO Attainment** → Show radar chart, program level
9. **Generate Report** → Export CLO attainment report
10. **Student View** → Show student's OBE transcript

---

**Total Estimated Time:** 3 weeks (21 days)  
**Focus:** Working OBE cycle from course setup to attainment calculation  
**Skip:** Advanced security, 2FA, complex workflows, surveys, alumni tracking
