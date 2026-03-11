const express = require('express');
const router = express.Router();
const BloomTaxonomyController = require('../controllers/BloomTaxonomyController');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

// Create controller instance
const bloomTaxonomyController = new BloomTaxonomyController();

/**
 * @route   GET /api/v1/bloom-taxonomy
 * @desc    Get all Bloom's Taxonomy levels (1-6)
 * @access  Protected
 * @usage   Used by frontend to populate dropdowns in question/assessment creation
 */
router.get(
  '/',
  authenticate,
  asyncHandler((req, res) => bloomTaxonomyController.getAllLevels(req, res))
);

/**
 * @route   GET /api/v1/bloom-taxonomy/range
 * @desc    Get Bloom's Taxonomy levels within a specified range
 * @access  Protected
 * @query   min - Minimum level number (1-6, default: 1)
 * @query   max - Maximum level number (1-6, default: 6)
 */
router.get(
  '/range',
  authenticate,
  asyncHandler((req, res) => bloomTaxonomyController.getLevelsInRange(req, res))
);

/**
 * @route   GET /api/v1/bloom-taxonomy/level/:levelNumber
 * @desc    Get Bloom's Taxonomy level by level number (1-6)
 * @access  Protected
 * @param   levelNumber - The level number (1=Remember, 2=Understand, 3=Apply, 4=Analyze, 5=Evaluate, 6=Create)
 */
router.get(
  '/level/:levelNumber',
  authenticate,
  asyncHandler((req, res) => bloomTaxonomyController.getLevelByNumber(req, res))
);

/**
 * @route   GET /api/v1/bloom-taxonomy/:id
 * @desc    Get Bloom's Taxonomy level by ID
 * @access  Protected
 * @param   id - The level ID
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler((req, res) => bloomTaxonomyController.getLevelById(req, res))
);

module.exports = router;
