const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/EnrollmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { param, query } = require('express-validator');

// Apply authentication to all routes
router.use(authenticate);

/**
 * POST /api/v1/enrollments
 * Enroll a single student in a course offering
 * Access: Teachers, Admin, HOD
 */
router.post(
  '/',
  authorize('teacher', 'admin', 'hod'),
  EnrollmentController.createValidationRules(),
  EnrollmentController.enrollStudent
);

/**
 * POST /api/v1/enrollments/bulk
 * Enroll multiple students in a course offering (bulk enrollment)
 * Access: Teachers, Admin, HOD
 */
router.post(
  '/bulk',
  authorize('teacher', 'admin', 'hod'),
  EnrollmentController.bulkEnrollValidationRules(),
  EnrollmentController.bulkEnroll
);

/**
 * GET /api/v1/enrollments/check
 * Check if a student is enrolled in a course offering
 * Query params: course_offering_id, student_id
 * Access: All authenticated users
 */
router.get(
  '/check',
  [
    query('course_offering_id')
      .notEmpty().withMessage('Course offering ID is required')
      .isInt({ min: 1 }).withMessage('Course offering ID must be a positive integer'),
    query('student_id')
      .notEmpty().withMessage('Student ID is required')
      .isInt({ min: 1 }).withMessage('Student ID must be a positive integer')
  ],
  EnrollmentController.checkEnrollmentStatus
);

/**
 * GET /api/v1/enrollments/by-status
 * Get enrollments filtered by status
 * Query params: status, page, limit
 * Access: Teachers, Admin, HOD
 */
router.get(
  '/by-status',
  authorize('teacher', 'admin', 'hod'),
  [
    query('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['active', 'dropped', 'completed', 'withdrawn'])
      .withMessage('Status must be one of: active, dropped, completed, withdrawn'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  EnrollmentController.getByStatus
);

/**
 * GET /api/v1/enrollments/:id
 * Get enrollment details by ID
 * Access: All authenticated users
 */
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid enrollment ID')
  ],
  EnrollmentController.getEnrollmentDetails
);

/**
 * GET /api/v1/enrollments
 * Get all enrollments with pagination
 * Query params: page, limit, status
 * Access: Teachers, Admin, HOD
 */
router.get(
  '/',
  authorize('teacher', 'admin', 'hod'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['active', 'dropped', 'completed', 'withdrawn'])
      .withMessage('Status must be one of: active, dropped, completed, withdrawn')
  ],
  EnrollmentController.index
);

/**
 * PUT /api/v1/enrollments/:id
 * Update an enrollment
 * Access: Teachers, Admin, HOD
 */
router.put(
  '/:id',
  authorize('teacher', 'admin', 'hod'),
  EnrollmentController.updateValidationRules(),
  EnrollmentController.update
);

/**
 * PUT /api/v1/enrollments/:id/drop
 * Drop a student from a course (set status to 'dropped')
 * Access: Teachers, Admin, HOD
 */
router.put(
  '/:id/drop',
  authorize('teacher', 'admin', 'hod'),
  [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid enrollment ID')
  ],
  EnrollmentController.dropStudent
);

/**
 * DELETE /api/v1/enrollments/:id
 * Soft delete an enrollment
 * Access: Admin, HOD only
 */
router.delete(
  '/:id',
  authorize('admin', 'hod'),
  [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid enrollment ID')
  ],
  EnrollmentController.destroy
);

module.exports = router;
