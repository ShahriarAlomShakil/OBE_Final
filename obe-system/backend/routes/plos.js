const express = require('express');
const router = express.Router();
const PLOController = require('../controllers/PLOController');
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
 * @route   GET /api/v1/plos
 * @desc    Get all PLOs with pagination
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.index(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/search
 * @desc    Search PLOs by description or code
 * @access  Protected
 */
router.get(
  '/search',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.search(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/by-domain
 * @desc    Get PLOs by domain type
 * @access  Protected
 */
router.get(
  '/by-domain',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.getByDomain(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/next-code
 * @desc    Get next available PLO code for a degree
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/next-code',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PLOController.getDegreeQueryValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PLOController.getNextPLOCode(req, res);
  })
);

/**
 * @route   POST /api/v1/plos
 * @desc    Create new PLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PLOController.getCreateValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PLOController.store(req, res);
  })
);

/**
 * @route   POST /api/v1/plos/bulk
 * @desc    Bulk create PLOs for a degree
 * @access  Protected (Teacher, HOD, Admin)
 */
router.post(
  '/bulk',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PLOController.getBulkCreateValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PLOController.bulkCreate(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id
 * @desc    Get PLO by ID
 * @access  Protected
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.show(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id/degree
 * @desc    Get PLO with degree information
 * @access  Protected
 */
router.get(
  '/:id/degree',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.getWithDegree(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id/relations
 * @desc    Get PLO with all relationships
 * @access  Protected
 */
router.get(
  '/:id/relations',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.getWithRelations(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id/clo-mappings
 * @desc    Get CLO mappings for a PLO
 * @access  Protected
 */
router.get(
  '/:id/clo-mappings',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.getCLOMappings(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id/peo-mappings
 * @desc    Get PEO mappings for a PLO
 * @access  Protected
 */
router.get(
  '/:id/peo-mappings',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.getPEOMappings(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id/attainment
 * @desc    Calculate attainment for a PLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.get(
  '/:id/attainment',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PLOController.getBatchQueryValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PLOController.calculateAttainment(req, res);
  })
);

/**
 * @route   GET /api/v1/plos/:id/statistics
 * @desc    Get statistics for a PLO
 * @access  Protected
 */
router.get(
  '/:id/statistics',
  authenticate,
  asyncHandler(async (req, res) => {
    await PLOController.getStatistics(req, res);
  })
);

/**
 * @route   PUT /api/v1/plos/:id
 * @desc    Update PLO
 * @access  Protected (Teacher, HOD, Admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'hod', 'admin'),
  PLOController.getUpdateValidationRules(),
  validate,
  asyncHandler(async (req, res) => {
    await PLOController.update(req, res);
  })
);

/**
 * @route   DELETE /api/v1/plos/:id
 * @desc    Delete PLO (soft delete)
 * @access  Protected (HOD, Admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('hod', 'admin'),
  asyncHandler(async (req, res) => {
    await PLOController.destroy(req, res);
  })
);

// ============================================================================
// NESTED ROUTES - Get PLOs by degree
// ============================================================================

/**
 * @route   GET /api/v1/degrees/:degreeId/plos
 * @desc    Get all PLOs for a degree
 * @access  Protected
 */
router.get(
  '/degree/:degreeId',
  authenticate,
  asyncHandler(async (req, res) => {
    const { degreeId } = req.params;
    const plos = await require('../services/PLOService').getByDegreeId(parseInt(degreeId));
    
    return require('../utils/responseHelper').success(
      res, 
      plos, 
      'PLOs retrieved successfully',
      { count: plos.length }
    );
  })
);

module.exports = router;
