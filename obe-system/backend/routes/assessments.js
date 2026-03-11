const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/AssessmentController');
const MarksController = require('../controllers/MarksController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');

// ============================================
// Public/Protected Routes (All authenticated users)
// ============================================

/**
 * @route   GET /api/v1/assessments
 * @desc    Get all assessments with pagination (or filter by course offering)
 * @query   ?course_offering_id=123 - Filter by course offering
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler(AssessmentController.index.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/course-offering/:courseOfferingId
 * @desc    Get all assessments for a specific course offering
 * @access  Protected
 */
router.get(
  '/course-offering/:courseOfferingId',
  authenticate,
  asyncHandler(AssessmentController.getByCourseOffering.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id
 * @desc    Get assessment by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(AssessmentController.show.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id/relations
 * @desc    Get assessment with all relationships (course offering, type, CLOs, questions)
 * @access  Protected
 */
router.get(
  '/:id/relations',
  authenticate,
  asyncHandler(AssessmentController.getWithRelations.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id/clo-mappings
 * @desc    Get CLO mappings for an assessment
 * @access  Protected
 */
router.get(
  '/:id/clo-mappings',
  authenticate,
  asyncHandler(AssessmentController.getCLOMappings.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id/questions
 * @desc    Get all questions for an assessment
 * @access  Protected
 */
router.get(
  '/:id/questions',
  authenticate,
  asyncHandler(AssessmentController.getQuestions.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id/marks
 * @desc    Get all student marks for an assessment
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/:id/marks',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(MarksController.getMarksByAssessment.bind(MarksController))
);

/**
 * @route   GET /api/v1/assessments/:id/marks/:studentId
 * @desc    Get detailed marks for a specific student
 * @access  Protected (Teacher, HOD, Admin, or the student themselves)
 */
router.get(
  '/:id/marks/:studentId',
  authenticate,
  asyncHandler(AssessmentController.getStudentDetailedMarks.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id/statistics
 * @desc    Get assessment statistics (average, highest, lowest marks, grade distribution)
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/:id/statistics',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(AssessmentController.getStatistics.bind(AssessmentController))
);

/**
 * @route   GET /api/v1/assessments/:id/clo-performance
 * @desc    Get CLO-wise performance analysis for an assessment
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/:id/clo-performance',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(AssessmentController.getCLOPerformance.bind(AssessmentController))
);

// ============================================
// Teacher, HOD, Admin Routes
// ============================================

/**
 * @route   POST /api/v1/assessments
 * @desc    Create a new assessment component
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  AssessmentController.validateCreate(),
  asyncHandler(AssessmentController.store.bind(AssessmentController))
);

/**
 * @route   PUT /api/v1/assessments/:id
 * @desc    Update an assessment component
 * @access  Protected (Teacher, HOD, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  AssessmentController.validateUpdate(),
  asyncHandler(AssessmentController.update.bind(AssessmentController))
);

/**
 * @route   DELETE /api/v1/assessments/:id
 * @desc    Delete an assessment component (soft delete)
 * @access  Protected (Teacher, HOD, Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(AssessmentController.destroy.bind(AssessmentController))
);

/**
 * @route   POST /api/v1/assessments/:id/map-clo
 * @desc    Map a CLO to an assessment
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/:id/map-clo',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  AssessmentController.validateCLOMapping(),
  asyncHandler(AssessmentController.mapCLO.bind(AssessmentController))
);

/**
 * @route   DELETE /api/v1/assessments/:id/unmap-clo/:cloId
 * @desc    Remove CLO mapping from an assessment
 * @access  Protected (Teacher, HOD, Admin)
 */
router.delete(
  '/:id/unmap-clo/:cloId',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(AssessmentController.unmapCLO.bind(AssessmentController))
);

/**
 * @route   POST /api/v1/assessments/:id/marks
 * @desc    Bulk entry of student marks for an assessment
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/:id/marks',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  AssessmentController.validateBulkMarks(),
  asyncHandler(AssessmentController.bulkEnterMarks.bind(AssessmentController))
);

/**
 * @route   POST /api/v1/assessments/:id/publish
 * @desc    Publish assessment results (make visible to students)
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/:id/publish',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(AssessmentController.publishResults.bind(AssessmentController))
);

/**
 * @route   POST /api/v1/assessments/:id/unpublish
 * @desc    Unpublish assessment results (hide from students)
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/:id/unpublish',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(AssessmentController.unpublishResults.bind(AssessmentController))
);

module.exports = router;
