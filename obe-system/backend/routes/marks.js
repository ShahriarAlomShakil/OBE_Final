const express = require('express');
const router = express.Router();
const MarksController = require('../controllers/MarksController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');

// ============================================
// Marks Entry Routes (Teacher, HOD, Admin only)
// ============================================

/**
 * @route   POST /api/v1/marks
 * @desc    Enter marks for a single student
 * @access  Protected (Teacher, HOD, Admin)
 * @body    {
 *            assessment_component_id: number,
 *            student_id: number,
 *            marks_obtained: number,
 *            is_absent: boolean (optional),
 *            remarks: string (optional),
 *            entered_by: number
 *          }
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  MarksController.validateEnterMarks(),
  asyncHandler(MarksController.enterMarks.bind(MarksController))
);

/**
 * @route   POST /api/v1/marks/bulk
 * @desc    Bulk enter marks for multiple students
 * @access  Protected (Teacher, HOD, Admin)
 * @body    {
 *            assessment_component_id: number,
 *            entered_by: number,
 *            marks_data: [
 *              {
 *                student_id: number,
 *                marks_obtained: number,
 *                is_absent: boolean (optional),
 *                remarks: string (optional)
 *              },
 *              ...
 *            ]
 *          }
 */
router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  MarksController.validateBulkEnterMarks(),
  asyncHandler(MarksController.bulkEnterMarks.bind(MarksController))
);

/**
 * @route   GET /api/v1/marks/:id
 * @desc    Get mark entry by ID
 * @access  Protected (Teacher, HOD, Admin, or the student themselves)
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(MarksController.getMarkById.bind(MarksController))
);

/**
 * @route   PUT /api/v1/marks/:id
 * @desc    Update marks for a student
 * @access  Protected (Teacher, HOD, Admin)
 * @body    {
 *            marks_obtained: number (optional),
 *            is_absent: boolean (optional),
 *            remarks: string (optional)
 *          }
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  MarksController.validateUpdateMarks(),
  asyncHandler(MarksController.updateMarks.bind(MarksController))
);

/**
 * @route   DELETE /api/v1/marks/:id
 * @desc    Delete marks entry (soft delete)
 * @access  Protected (HOD, Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('hod', 'admin'),
  asyncHandler(MarksController.deleteMarks.bind(MarksController))
);

// ============================================
// Query Routes for Marks
// ============================================

/**
 * @route   GET /api/v1/assessments/:id/marks
 * @desc    Get all student marks for an assessment component
 * @query   ?include_absent=false - Exclude absent students
 *          ?order_by=student_id ASC - Order results
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/assessment/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(MarksController.getMarksByAssessment.bind(MarksController))
);

/**
 * @route   GET /api/v1/students/:studentId/marks
 * @desc    Get all marks for a student in a course offering
 * @query   course_offering_id=123 (required)
 * @access  Protected (Teacher, HOD, Admin, or the student themselves)
 */
router.get(
  '/student/:studentId',
  authenticate,
  asyncHandler(MarksController.getMarksByStudent.bind(MarksController))
);

module.exports = router;
