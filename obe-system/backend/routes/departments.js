const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/DepartmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/departments
 * @desc    Get all departments with pagination
 * @access  Protected (All authenticated users)
 */
router.get(
  '/',
  asyncHandler((req, res) => DepartmentController.index(req, res))
);

/**
 * @route   GET /api/v1/departments/active
 * @desc    Get all active departments
 * @access  Protected (All authenticated users)
 */
router.get(
  '/active',
  asyncHandler((req, res) => DepartmentController.getActive(req, res))
);

/**
 * @route   GET /api/v1/departments/search
 * @desc    Search departments by name, short name, or code
 * @access  Protected (All authenticated users)
 */
router.get(
  '/search',
  DepartmentController.searchValidationRules(),
  asyncHandler((req, res) => DepartmentController.search(req, res))
);

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new department
 * @access  Protected (Admin, HOD only)
 */
router.post(
  '/',
  authorize('admin', 'hod'),
  DepartmentController.createValidationRules(),
  asyncHandler((req, res) => DepartmentController.store(req, res))
);

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get department by ID
 * @access  Protected (All authenticated users)
 */
router.get(
  '/:id',
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.show(req, res))
);

/**
 * @route   GET /api/v1/departments/:id/faculty
 * @desc    Get department with faculty relationship
 * @access  Protected (All authenticated users)
 */
router.get(
  '/:id/faculty',
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.getWithFaculty(req, res))
);

/**
 * @route   GET /api/v1/departments/:id/relations
 * @desc    Get department with all relationships (faculty, courses, teachers)
 * @access  Protected (All authenticated users)
 */
router.get(
  '/:id/relations',
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.getWithRelations(req, res))
);

/**
 * @route   GET /api/v1/departments/:id/statistics
 * @desc    Get department statistics (courses, teachers, students count)
 * @access  Protected (All authenticated users)
 */
router.get(
  '/:id/statistics',
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.getStatistics(req, res))
);

/**
 * @route   GET /api/v1/departments/:id/courses
 * @desc    Get all courses in department
 * @access  Protected (All authenticated users)
 */
router.get(
  '/:id/courses',
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.getCourses(req, res))
);

/**
 * @route   GET /api/v1/departments/:id/teachers
 * @desc    Get all teachers in department
 * @access  Protected (All authenticated users)
 */
router.get(
  '/:id/teachers',
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.getTeachers(req, res))
);

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department by ID
 * @access  Protected (Admin, HOD only)
 */
router.put(
  '/:id',
  authorize('admin', 'hod'),
  DepartmentController.updateValidationRules(),
  asyncHandler((req, res) => DepartmentController.update(req, res))
);

/**
 * @route   PATCH /api/v1/departments/:id/toggle-status
 * @desc    Toggle department active status
 * @access  Protected (Admin only)
 */
router.patch(
  '/:id/toggle-status',
  authorize('admin'),
  DepartmentController.getByIdValidationRules(),
  asyncHandler((req, res) => DepartmentController.toggleStatus(req, res))
);

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete department by ID (soft delete if supported)
 * @access  Protected (Admin only)
 */
router.delete(
  '/:id',
  authorize('admin'),
  DepartmentController.deleteValidationRules(),
  asyncHandler((req, res) => DepartmentController.destroy(req, res))
);

/**
 * @route   GET /api/v1/faculties/:facultyId/departments
 * @desc    Get departments by faculty ID
 * @access  Protected (All authenticated users)
 */
router.get(
  '/faculty/:facultyId',
  DepartmentController.getByFacultyValidationRules(),
  asyncHandler((req, res) => DepartmentController.getByFaculty(req, res))
);

module.exports = router;
