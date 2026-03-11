const express = require('express');
const router = express.Router();
const DegreeController = require('../controllers/DegreeController');
const { authenticate, authorize } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const controller = new DegreeController();

// Rate limiter for degree operations (100 requests per 15 minutes)
const degreeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all routes
router.use(authenticate);

// Apply rate limiting to all routes
router.use(degreeRateLimiter);

/**
 * @route   GET /api/v1/degrees
 * @desc    Get all degrees with pagination
 * @access  Protected
 */
router.get(
  '/',
  controller.index.bind(controller)
);

/**
 * @route   POST /api/v1/degrees
 * @desc    Create a new degree
 * @access  Admin, HOD only
 */
router.post(
  '/',
  authorize('admin', 'hod'),
  controller.createValidationRules(),
  controller.store.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/active
 * @desc    Get all active degrees
 * @access  Protected
 */
router.get(
  '/active',
  controller.getActive.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/search
 * @desc    Search degrees by name, short name, or type
 * @access  Protected
 */
router.get(
  '/search',
  controller.searchValidationRules(),
  controller.search.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/by-type
 * @desc    Get degrees by type (bachelors, masters, phd, diploma, associate)
 * @access  Protected
 */
router.get(
  '/by-type',
  controller.getByTypeValidationRules(),
  controller.getByType.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id
 * @desc    Get degree by ID
 * @access  Protected
 */
router.get(
  '/:id',
  controller.getByIdValidationRules(),
  controller.show.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id/department
 * @desc    Get degree with department relationship
 * @access  Protected
 */
router.get(
  '/:id/department',
  controller.getByIdValidationRules(),
  controller.getWithDepartment.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id/relations
 * @desc    Get degree with all relationships (department, PLOs, PEOs, students)
 * @access  Protected
 */
router.get(
  '/:id/relations',
  controller.getByIdValidationRules(),
  controller.getWithRelations.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id/statistics
 * @desc    Get degree statistics (PLO count, PEO count, student count)
 * @access  Protected
 */
router.get(
  '/:id/statistics',
  controller.getByIdValidationRules(),
  controller.getStatistics.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id/plos
 * @desc    Get all PLOs for a degree
 * @access  Protected
 */
router.get(
  '/:id/plos',
  controller.getByIdValidationRules(),
  controller.getPLOs.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id/peos
 * @desc    Get all PEOs for a degree
 * @access  Protected
 */
router.get(
  '/:id/peos',
  controller.getByIdValidationRules(),
  controller.getPEOs.bind(controller)
);

/**
 * @route   GET /api/v1/degrees/:id/students
 * @desc    Get all students enrolled in a degree
 * @access  Protected
 */
router.get(
  '/:id/students',
  controller.getByIdValidationRules(),
  controller.getStudents.bind(controller)
);

/**
 * @route   PUT /api/v1/degrees/:id
 * @desc    Update degree
 * @access  Admin, HOD only
 */
router.put(
  '/:id',
  authorize('admin', 'hod'),
  controller.updateValidationRules(),
  controller.update.bind(controller)
);

/**
 * @route   PATCH /api/v1/degrees/:id/toggle-status
 * @desc    Toggle degree active status
 * @access  Admin only
 */
router.patch(
  '/:id/toggle-status',
  authorize('admin'),
  controller.toggleStatusValidationRules(),
  controller.toggleStatus.bind(controller)
);

/**
 * @route   DELETE /api/v1/degrees/:id
 * @desc    Delete degree (soft delete)
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize('admin'),
  controller.deleteValidationRules(),
  controller.destroy.bind(controller)
);

/**
 * @route   GET /api/v1/departments/:departmentId/degrees
 * @desc    Get all degrees in a department
 * @access  Protected
 */
router.get(
  '/departments/:departmentId',
  controller.getByDepartmentValidationRules(),
  controller.getByDepartment.bind(controller)
);

module.exports = router;
