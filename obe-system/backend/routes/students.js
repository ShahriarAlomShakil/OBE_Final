const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/StudentController');
const EnrollmentController = require('../controllers/EnrollmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { param } = require('express-validator');

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/v1/students/stats
 * Get student statistics (total count, active, by status)
 * Access: All authenticated users
 */
router.get('/stats', StudentController.getStats);

/**
 * GET /api/v1/students/active
 * Get all active students
 * Access: All authenticated users
 */
router.get('/active', StudentController.getActive);

/**
 * GET /api/v1/students/search?q=term
 * Search students by name, student_id, or email
 * Access: All authenticated users
 */
router.get('/search', StudentController.search);

/**
 * GET /api/v1/students/by-department?departmentId=X
 * Get students by department
 * Access: All authenticated users
 */
router.get('/by-department', StudentController.getByDepartment);

/**
 * GET /api/v1/students/by-degree?degreeId=X
 * Get students by degree
 * Access: All authenticated users
 */
router.get('/by-degree', StudentController.getByDegree);

/**
 * GET /api/v1/students/by-batch?batch=2023&departmentId=X
 * Get students by batch
 * Access: All authenticated users
 */
router.get('/by-batch', StudentController.getByBatch);

/**
 * GET /api/v1/students/by-section?section=A&batch=2023&departmentId=X
 * Get students by section
 * Access: All authenticated users
 */
router.get('/by-section', StudentController.getBySection);

/**
 * GET /api/v1/students/by-user?userId=X
 * Get student by user ID
 * Access: All authenticated users
 */
router.get('/by-user', StudentController.getByUser);

/**
 * GET /api/v1/students/by-student-id?studentId=XXX
 * Get student by student ID (roll number)
 * Access: All authenticated users
 */
router.get('/by-student-id', StudentController.getByStudentId);

/**
 * GET /api/v1/students
 * Get all students with pagination
 * Access: All authenticated users
 */
router.get('/', StudentController.index);

/**
 * POST /api/v1/students
 * Create a new student
 * Access: Admin and HOD only
 */
router.post(
  '/',
  authorize('admin', 'hod'),
  StudentController.createValidationRules(),
  StudentController.store
);

/**
 * GET /api/v1/students/:id
 * Get student by ID
 * Access: All authenticated users
 */
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.show
);

/**
 * GET /api/v1/students/:id/relations
 * Get student with all relations (user, department, degree)
 * Access: All authenticated users
 */
router.get(
  '/:id/relations',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getWithRelations
);

/**
 * GET /api/v1/students/:id/user
 * Get student with user info
 * Access: All authenticated users
 */
router.get(
  '/:id/user',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getWithUser
);

/**
 * GET /api/v1/students/:id/department
 * Get student with department info
 * Access: All authenticated users
 */
router.get(
  '/:id/department',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getWithDepartment
);

/**
 * GET /api/v1/students/:id/degree
 * Get student with degree info
 * Access: All authenticated users
 */
router.get(
  '/:id/degree',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getWithDegree
);

/**
 * GET /api/v1/students/:id/enrollments
 * Get all course enrollments for a student
 * Access: All authenticated users
 */
router.get(
  '/:id/enrollments',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getEnrollments
);

/**
 * GET /api/v1/students/:id/results?courseOfferingId=X
 * Get all results/marks for a student
 * Access: All authenticated users
 */
router.get(
  '/:id/results',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getResults
);

/**
 * GET /api/v1/students/:id/clo-attainments?courseOfferingId=X
 * Get CLO attainments for a student
 * Access: All authenticated users
 */
router.get(
  '/:id/clo-attainments',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getCLOAttainments
);

/**
 * GET /api/v1/students/:id/plo-attainments
 * Get PLO attainments for a student
 * Access: All authenticated users
 */
router.get(
  '/:id/plo-attainments',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getPLOAttainments
);

/**
 * GET /api/v1/students/:id/statistics
 * Get statistics for a student (enrollments, attainments, etc.)
 * Access: All authenticated users
 */
router.get(
  '/:id/statistics',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.getStatistics
);

/**
 * GET /api/v1/students/:id/enrollments
 * Get all enrollments for a student
 * Access: All authenticated users
 */
router.get(
  '/:id/enrollments',
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  EnrollmentController.getEnrollmentsByStudent
);

/**
 * PUT /api/v1/students/:id
 * Update a student
 * Access: Admin and HOD only
 */
router.put(
  '/:id',
  authorize('admin', 'hod'),
  StudentController.updateValidationRules(),
  StudentController.update
);

/**
 * PATCH /api/v1/students/:id/cgpa
 * Update student CGPA
 * Access: Admin and HOD only
 */
router.patch(
  '/:id/cgpa',
  authorize('admin', 'hod'),
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.updateCGPA
);

/**
 * PATCH /api/v1/students/:id/credits
 * Update student credits completed
 * Access: Admin and HOD only
 */
router.patch(
  '/:id/credits',
  authorize('admin', 'hod'),
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.updateCredits
);

/**
 * DELETE /api/v1/students/:id
 * Delete a student (soft delete)
 * Access: Admin only
 */
router.delete(
  '/:id',
  authorize('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Invalid student ID')],
  StudentController.destroy
);

module.exports = router;
