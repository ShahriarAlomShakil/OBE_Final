const express = require('express');
const router = express.Router();
const AttainmentThresholdController = require('../controllers/AttainmentThresholdController');
const { authenticate, authorize } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const thresholdController = new AttainmentThresholdController();

// Rate limiter for settings operations (100 requests per 15 minutes)
const settingsRateLimiter = rateLimit({
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
router.use(settingsRateLimiter);

/**
 * @route   GET /api/v1/settings/thresholds
 * @desc    Get all thresholds with pagination
 * @access  Protected
 */
router.get(
  '/thresholds',
  thresholdController.index.bind(thresholdController)
);

/**
 * @route   POST /api/v1/settings/thresholds
 * @desc    Create a new threshold
 * @access  Admin, HOD only
 */
router.post(
  '/thresholds',
  authorize('admin', 'hod'),
  thresholdController.createValidationRules(),
  thresholdController.createThreshold.bind(thresholdController)
);

/**
 * @route   GET /api/v1/settings/thresholds/degree/:degreeId
 * @desc    Get all thresholds for a specific degree
 * @access  Protected
 */
router.get(
  '/thresholds/degree/:degreeId',
  thresholdController.getThresholdsByDegreeValidationRules(),
  thresholdController.getThresholdsByDegree.bind(thresholdController)
);

/**
 * @route   GET /api/v1/settings/thresholds/degree/:degreeId/current
 * @desc    Get current active thresholds for a degree
 * @access  Protected
 */
router.get(
  '/thresholds/degree/:degreeId/current',
  thresholdController.getThresholdsByDegreeValidationRules(),
  thresholdController.getCurrentThresholds.bind(thresholdController)
);

/**
 * @route   GET /api/v1/settings/thresholds/degree/:degreeId/type/:type
 * @desc    Get threshold by type (CLO or PLO) for a degree
 * @access  Protected
 */
router.get(
  '/thresholds/degree/:degreeId/type/:type',
  thresholdController.getThresholdsByDegreeValidationRules(),
  thresholdController.getThresholdByType.bind(thresholdController)
);

/**
 * @route   GET /api/v1/settings/thresholds/degree/:degreeId/history
 * @desc    Get historical thresholds for a degree
 * @access  Protected
 */
router.get(
  '/thresholds/degree/:degreeId/history',
  thresholdController.getThresholdsByDegreeValidationRules(),
  thresholdController.getHistoricalThresholds.bind(thresholdController)
);

/**
 * @route   POST /api/v1/settings/thresholds/check-attainment
 * @desc    Check if achievement meets threshold
 * @access  Protected
 */
router.post(
  '/thresholds/check-attainment',
  thresholdController.checkAttainmentValidationRules(),
  thresholdController.checkAttainment.bind(thresholdController)
);

/**
 * @route   GET /api/v1/settings/thresholds/:id
 * @desc    Get threshold by ID
 * @access  Protected
 */
router.get(
  '/thresholds/:id',
  thresholdController.show.bind(thresholdController)
);

/**
 * @route   PUT /api/v1/settings/thresholds/:id
 * @desc    Update threshold
 * @access  Admin, HOD only
 */
router.put(
  '/thresholds/:id',
  authorize('admin', 'hod'),
  thresholdController.updateValidationRules(),
  thresholdController.updateThreshold.bind(thresholdController)
);

/**
 * @route   DELETE /api/v1/settings/thresholds/:id
 * @desc    Delete threshold (soft delete)
 * @access  Admin only
 */
router.delete(
  '/thresholds/:id',
  authorize('admin'),
  thresholdController.deleteThreshold.bind(thresholdController)
);

module.exports = router;
