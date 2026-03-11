/**
 * Semester Routes
 * API endpoints for semester management
 */

const express = require('express');
const router = express.Router();
const SemesterController = require('../controllers/SemesterController');
const { authenticate, authorize } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const rateLimit = require('express-rate-limit');

const controller = new SemesterController();

// Rate limiter for semester operations (100 requests per 15 minutes)
const semesterRateLimiter = rateLimit({
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
router.use(semesterRateLimiter);

/**
 * @route   GET /api/v1/semesters/active
 * @desc    Get all active semesters
 * @access  Protected
 */
router.get(
  '/active',
  asyncHandler((req, res) => controller.getActive(req, res))
);

/**
 * @route   GET /api/v1/semesters/current
 * @desc    Get current active semester
 * @access  Protected
 */
router.get(
  '/current',
  asyncHandler((req, res) => controller.getCurrentSemester(req, res))
);

/**
 * @route   GET /api/v1/semesters/search
 * @desc    Search semesters by name or session
 * @access  Protected
 */
router.get(
  '/search',
  controller.searchValidationRules(),
  asyncHandler((req, res) => controller.search(req, res))
);

/**
 * @route   GET /api/v1/semesters/by-type
 * @desc    Get semesters by type (fall, spring, summer)
 * @access  Protected
 */
router.get(
  '/by-type',
  controller.getByTypeValidationRules(),
  asyncHandler((req, res) => controller.getByType(req, res))
);

/**
 * @route   GET /api/v1/semesters/by-session
 * @desc    Get semesters by academic session ID
 * @access  Protected
 */
router.get(
  '/by-session',
  controller.getBySessionValidationRules(),
  asyncHandler((req, res) => controller.getBySession(req, res))
);

/**
 * @route   GET /api/v1/semesters
 * @desc    Get all semesters with pagination
 * @access  Protected
 */
router.get(
  '/',
  asyncHandler((req, res) => controller.index(req, res))
);

/**
 * @route   POST /api/v1/semesters
 * @desc    Create a new semester
 * @access  Admin only
 */
router.post(
  '/',
  authorize('admin'),
  controller.createValidationRules(),
  asyncHandler((req, res) => controller.store(req, res))
);

/**
 * @route   GET /api/v1/semesters/:id
 * @desc    Get a semester by ID
 * @access  Protected
 */
router.get(
  '/:id',
  controller.getByIdValidationRules(),
  asyncHandler((req, res) => controller.show(req, res))
);

/**
 * @route   PUT /api/v1/semesters/:id
 * @desc    Update a semester
 * @access  Admin only
 */
router.put(
  '/:id',
  authorize('admin'),
  controller.updateValidationRules(),
  asyncHandler((req, res) => controller.update(req, res))
);

/**
 * @route   PUT /api/v1/semesters/:id/set-active
 * @desc    Set a semester as active
 * @access  Admin only
 */
router.put(
  '/:id/set-active',
  authorize('admin'),
  controller.getByIdValidationRules(),
  asyncHandler((req, res) => controller.setActive(req, res))
);

/**
 * @route   DELETE /api/v1/semesters/:id
 * @desc    Delete a semester (soft delete)
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize('admin'),
  controller.deleteValidationRules(),
  asyncHandler((req, res) => controller.destroy(req, res))
);

module.exports = router;
