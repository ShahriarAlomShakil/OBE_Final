const express = require('express');
const router = express.Router();
const FacultyController = require('../controllers/FacultyController');
const { authenticate, authorize } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

// Create controller instance
const facultyController = new FacultyController();

/**
 * @route   GET /api/v1/faculties/active
 * @desc    Get all active faculties
 * @access  Public (or Protected - depends on requirements)
 */
router.get(
  '/active',
  authenticate,
  asyncHandler((req, res) => facultyController.getActive(req, res))
);

/**
 * @route   GET /api/v1/faculties/search
 * @desc    Search faculties by name or short name
 * @access  Protected
 */
router.get(
  '/search',
  authenticate,
  FacultyController.searchValidation,
  asyncHandler((req, res) => facultyController.search(req, res))
);

/**
 * @route   GET /api/v1/faculties
 * @desc    Get all faculties with pagination
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler((req, res) => facultyController.index(req, res))
);

/**
 * @route   POST /api/v1/faculties
 * @desc    Create a new faculty
 * @access  Protected - Admin/HOD only
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'hod'),
  FacultyController.createValidation,
  asyncHandler((req, res) => facultyController.store(req, res))
);

/**
 * @route   GET /api/v1/faculties/:id
 * @desc    Get faculty by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  FacultyController.idValidation,
  asyncHandler((req, res) => facultyController.show(req, res))
);

/**
 * @route   GET /api/v1/faculties/:id/departments
 * @desc    Get faculty with its departments
 * @access  Protected
 */
router.get(
  '/:id/departments',
  authenticate,
  FacultyController.idValidation,
  asyncHandler((req, res) => facultyController.getWithDepartments(req, res))
);

/**
 * @route   GET /api/v1/faculties/:id/statistics
 * @desc    Get faculty statistics
 * @access  Protected
 */
router.get(
  '/:id/statistics',
  authenticate,
  FacultyController.idValidation,
  asyncHandler((req, res) => facultyController.getStatistics(req, res))
);

/**
 * @route   PUT /api/v1/faculties/:id
 * @desc    Update faculty by ID
 * @access  Protected - Admin/HOD only
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'hod'),
  FacultyController.updateValidation,
  asyncHandler((req, res) => facultyController.update(req, res))
);

/**
 * @route   PATCH /api/v1/faculties/:id/toggle-status
 * @desc    Toggle faculty active status
 * @access  Protected - Admin only
 */
router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize('admin'),
  FacultyController.idValidation,
  asyncHandler((req, res) => facultyController.toggleStatus(req, res))
);

/**
 * @route   DELETE /api/v1/faculties/:id
 * @desc    Delete faculty by ID (soft delete)
 * @access  Protected - Admin only
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  FacultyController.idValidation,
  asyncHandler((req, res) => facultyController.destroy(req, res))
);

module.exports = router;
