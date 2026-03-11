const express = require('express');
const router = express.Router();
const PEOController = require('../controllers/PEOController');
const { authenticate, authorize } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const responseHelper = require('../utils/responseHelper');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseHelper.validationError(res, 'Validation failed', errors.array());
  }
  next();
};

// ============================================================================
// PUBLIC ROUTES (Protected - require authentication)
// ============================================================================

/**
 * @route   GET /api/v1/peos
 * @desc    Get all PEOs with pagination
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    await PEOController.index(req, res);
  })
);

/**
 * @route   GET /api/v1/peos/search
 * @desc    Search PEOs by code or description
 * @access  Protected
 */
router.get(
  '/search',
  authenticate,
  asyncHandler(async (req, res) => {
    await PEOController.search(req, res);
  })
);

/**
 * @route   GET /api/v1/peos/by-degree
 * @desc    Get PEOs by degree
 * @access  Protected
 */
router.get(
  '/by-degree',
  authenticate,
  PEOController.getDegreeQueryValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PEOController.getByDegree(req, res);
  })
);

/**
 * @route   GET /api/v1/peos/next-code
 * @desc    Get next available PEO code for a degree
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/next-code',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PEOController.getDegreeQueryValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PEOController.getNextPEOCode(req, res);
  })
);

/**
 * @route   POST /api/v1/peos
 * @desc    Create new PEO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PEOController.getCreateValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PEOController.store(req, res);
  })
);

/**
 * @route   POST /api/v1/peos/bulk
 * @desc    Bulk create PEOs for a degree
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PEOController.getBulkCreateValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PEOController.bulkCreate(req, res);
  })
);

/**
 * @route   GET /api/v1/peos/:id
 * @desc    Get PEO by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await PEOController.show(req, res);
  })
);

/**
 * @route   PUT /api/v1/peos/:id
 * @desc    Update PEO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PEOController.getUpdateValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PEOController.update(req, res);
  })
);

/**
 * @route   DELETE /api/v1/peos/:id
 * @desc    Soft delete PEO
 * @access  Protected (HOD, Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('hod', 'admin'),
  asyncHandler(async (req, res) => {
    await PEOController.destroy(req, res);
  })
);

// ============================================================================
// RELATIONSHIP ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/peos/:id/degree
 * @desc    Get PEO with degree information
 * @access  Protected
 */
router.get(
  '/:id/degree',
  authenticate,
  asyncHandler(async (req, res) => {
    await PEOController.getWithDegree(req, res);
  })
);

/**
 * @route   GET /api/v1/peos/:id/relations
 * @desc    Get PEO with all relationships
 * @access  Protected
 */
router.get(
  '/:id/relations',
  authenticate,
  asyncHandler(async (req, res) => {
    await PEOController.getWithRelations(req, res);
  })
);

/**
 * @route   GET /api/v1/peos/:id/plo-mappings
 * @desc    Get PLO mappings for a PEO
 * @access  Protected
 */
router.get(
  '/:id/plo-mappings',
  authenticate,
  asyncHandler(async (req, res) => {
    await PEOController.getPLOMappings(req, res);
  })
);

/**
 * @route   POST /api/v1/peos/:id/map-plo
 * @desc    Map PEO to PLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/:id/map-plo',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PEOController.getMapPLOValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PEOController.mapToPLO(req, res);
  })
);

/**
 * @route   DELETE /api/v1/peos/:id/unmap-plo/:ploId
 * @desc    Unmap PEO from PLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.delete(
  '/:id/unmap-plo/:ploId',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  asyncHandler(async (req, res) => {
    await PEOController.unmapFromPLO(req, res);
  })
);

module.exports = router;
