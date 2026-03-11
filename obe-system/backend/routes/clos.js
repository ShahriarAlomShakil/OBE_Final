const express = require('express');
const router = express.Router();
const CLOController = require('../controllers/CLOController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');

// ============================================
// Public/Protected Routes (All authenticated users)
// ============================================

/**
 * @route   GET /api/v1/clos
 * @desc    Get all CLOs with pagination
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler(CLOController.index.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/search
 * @desc    Search CLOs by description or code
 * @access  Protected
 */
router.get(
  '/search',
  authenticate,
  asyncHandler(CLOController.search.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/by-bloom-level
 * @desc    Get CLOs by Bloom taxonomy level
 * @access  Protected
 */
router.get(
  '/by-bloom-level',
  authenticate,
  asyncHandler(CLOController.getByBloomLevel.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/next-code
 * @desc    Get next available CLO code for a course
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/next-code',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(CLOController.getNextCLOCode.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id
 * @desc    Get CLO by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(CLOController.show.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/relations
 * @desc    Get CLO with all relationships (course, bloom level)
 * @access  Protected
 */
router.get(
  '/:id/relations',
  authenticate,
  asyncHandler(CLOController.getWithRelations.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/course
 * @desc    Get CLO with course information
 * @access  Protected
 */
router.get(
  '/:id/course',
  authenticate,
  asyncHandler(CLOController.getWithCourse.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/bloom-level
 * @desc    Get CLO with Bloom level information
 * @access  Protected
 */
router.get(
  '/:id/bloom-level',
  authenticate,
  asyncHandler(CLOController.getWithBloomLevel.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/plo-mappings
 * @desc    Get PLO mappings for this CLO
 * @access  Protected
 */
router.get(
  '/:id/plo-mappings',
  authenticate,
  asyncHandler(CLOController.getPLOMappings.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/assessments
 * @desc    Get assessments that measure this CLO
 * @access  Protected
 */
router.get(
  '/:id/assessments',
  authenticate,
  asyncHandler(CLOController.getAssessments.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/attainment
 * @desc    Calculate CLO attainment for a course offering
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/:id/attainment',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(CLOController.calculateAttainment.bind(CLOController))
);

/**
 * @route   GET /api/v1/clos/:id/statistics
 * @desc    Get CLO statistics (mappings count, offerings count)
 * @access  Protected
 */
router.get(
  '/:id/statistics',
  authenticate,
  asyncHandler(CLOController.getStatistics.bind(CLOController))
);

// ============================================
// Restricted Routes (Teacher, HOD, Admin only)
// ============================================

/**
 * @route   POST /api/v1/clos
 * @desc    Create a new CLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  CLOController.validateCreate(),
  asyncHandler(CLOController.store.bind(CLOController))
);

/**
 * @route   POST /api/v1/clos/bulk
 * @desc    Bulk create CLOs for a course
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  CLOController.validateBulkCreate(),
  asyncHandler(CLOController.bulkCreate.bind(CLOController))
);

/**
 * @route   PUT /api/v1/clos/:id
 * @desc    Update a CLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  CLOController.validateUpdate(),
  asyncHandler(CLOController.update.bind(CLOController))
);

/**
 * @route   DELETE /api/v1/clos/:id
 * @desc    Delete a CLO (soft delete)
 * @access  Protected (HOD, Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('hod', 'admin'),
  asyncHandler(CLOController.destroy.bind(CLOController))
);

// ============================================
// Course-specific Routes
// ============================================

/**
 * @route   GET /api/v1/courses/:courseId/clos
 * @desc    Get all CLOs for a specific course
 * @access  Protected
 */
router.get(
  '/course/:courseId',
  authenticate,
  asyncHandler(CLOController.getByCourse.bind(CLOController))
);

module.exports = router;
