const BaseController = require('./BaseController');
const AttainmentThreshold = require('../models/AttainmentThreshold');
const asyncHandler = require('../utils/asyncHandler');
const { body, param, query, validationResult } = require('express-validator');

class AttainmentThresholdController extends BaseController {
  constructor() {
    const model = AttainmentThreshold;
    super({
      getAll: async (options) => await model.findAll(options),
      getById: async (id) => await model.findById(id),
      create: async (data) => await model.createThreshold(data),
      update: async (id, data) => await model.updateThreshold(id, data),
      delete: async (id) => await model.delete(id)
    });
    
    this.model = model;
  }

  /**
   * Validation rules for creating threshold
   */
  createValidationRules() {
    return [
      body('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree_id is required'),
      body('threshold_type')
        .isIn(['clo', 'plo'])
        .withMessage('threshold_type must be either "clo" or "plo"'),
      body('minimum_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('minimum_percentage must be between 0 and 100'),
      body('target_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('target_percentage must be between 0 and 100'),
      body('excellence_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('excellence_percentage must be between 0 and 100'),
      body('effective_from_session_id')
        .isInt({ min: 1 })
        .withMessage('Valid effective_from_session_id is required'),
      body('effective_to_session_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('effective_to_session_id must be a valid session ID'),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: errors.array()
            }
          });
        }
        next();
      }
    ];
  }

  /**
   * Validation rules for updating threshold
   */
  updateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Valid threshold ID is required'),
      body('minimum_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('minimum_percentage must be between 0 and 100'),
      body('target_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('target_percentage must be between 0 and 100'),
      body('excellence_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('excellence_percentage must be between 0 and 100'),
      body('effective_from_session_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('effective_from_session_id must be a valid session ID'),
      body('effective_to_session_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('effective_to_session_id must be a valid session ID'),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: errors.array()
            }
          });
        }
        next();
      }
    ];
  }

  /**
   * Validation rules for getting thresholds by degree
   */
  getThresholdsByDegreeValidationRules() {
    return [
      param('degreeId')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: errors.array()
            }
          });
        }
        next();
      }
    ];
  }

  /**
   * Validation rules for checking attainment
   */
  checkAttainmentValidationRules() {
    return [
      body('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree_id is required'),
      body('threshold_type')
        .isIn(['clo', 'plo'])
        .withMessage('threshold_type must be either "clo" or "plo"'),
      body('achieved_percentage')
        .isFloat({ min: 0, max: 100 })
        .withMessage('achieved_percentage must be between 0 and 100'),
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Validation failed',
              code: 'VALIDATION_ERROR',
              details: errors.array()
            }
          });
        }
        next();
      }
    ];
  }

  /**
   * GET /api/v1/settings/thresholds/degree/:degreeId
   * Get all thresholds for a specific degree
   */
  getThresholdsByDegree = asyncHandler(async (req, res) => {
    const degreeId = parseInt(req.params.degreeId);
    const thresholds = await this.model.getThresholds(degreeId);
    
    return this.successResponse(
      res,
      thresholds,
      'Thresholds retrieved successfully'
    );
  });

  /**
   * GET /api/v1/settings/thresholds/degree/:degreeId/current
   * Get current active thresholds for a degree
   */
  getCurrentThresholds = asyncHandler(async (req, res) => {
    const degreeId = parseInt(req.params.degreeId);
    const thresholds = await this.model.getCurrentThresholds(degreeId);
    
    return this.successResponse(
      res,
      thresholds,
      'Current thresholds retrieved successfully'
    );
  });

  /**
   * GET /api/v1/settings/thresholds/degree/:degreeId/type/:type
   * Get threshold by type (CLO or PLO) for a degree
   */
  getThresholdByType = asyncHandler(async (req, res) => {
    const degreeId = parseInt(req.params.degreeId);
    const thresholdType = req.params.type;
    
    if (!['clo', 'plo'].includes(thresholdType)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'threshold_type must be either "clo" or "plo"',
          code: 'INVALID_THRESHOLD_TYPE'
        }
      });
    }
    
    const threshold = await this.model.getThresholdByType(degreeId, thresholdType);
    
    if (!threshold) {
      return res.status(404).json({
        success: false,
        error: {
          message: `No ${thresholdType.toUpperCase()} threshold found for this degree`,
          code: 'THRESHOLD_NOT_FOUND'
        }
      });
    }
    
    return this.successResponse(
      res,
      threshold,
      'Threshold retrieved successfully'
    );
  });

  /**
   * POST /api/v1/settings/thresholds
   * Create new threshold
   */
  createThreshold = asyncHandler(async (req, res) => {
    const threshold = await this.model.createThreshold(req.body);
    
    return this.successResponse(
      res,
      threshold,
      'Threshold created successfully',
      {},
      201
    );
  });

  /**
   * PUT /api/v1/settings/thresholds/:id
   * Update threshold
   */
  updateThreshold = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    
    // Validate percentages if provided
    if (req.body.minimum_percentage || req.body.target_percentage || req.body.excellence_percentage) {
      const validation = this.model.validatePercentages(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid percentage values',
            code: 'INVALID_PERCENTAGES',
            details: validation.errors
          }
        });
      }
    }
    
    const threshold = await this.model.updateThreshold(id, req.body);
    
    return this.successResponse(
      res,
      threshold,
      'Threshold updated successfully'
    );
  });

  /**
   * POST /api/v1/settings/thresholds/check-attainment
   * Check if achievement meets threshold
   */
  checkAttainment = asyncHandler(async (req, res) => {
    const { degree_id, threshold_type, achieved_percentage } = req.body;
    
    const attainmentStatus = await this.model.checkAttainment(
      degree_id,
      threshold_type,
      achieved_percentage
    );
    
    return this.successResponse(
      res,
      attainmentStatus,
      'Attainment status checked successfully'
    );
  });

  /**
   * GET /api/v1/settings/thresholds/degree/:degreeId/history
   * Get historical thresholds for a degree
   */
  getHistoricalThresholds = asyncHandler(async (req, res) => {
    const degreeId = parseInt(req.params.degreeId);
    const thresholds = await this.model.getHistoricalThresholds(degreeId);
    
    return this.successResponse(
      res,
      thresholds,
      'Historical thresholds retrieved successfully'
    );
  });

  /**
   * DELETE /api/v1/settings/thresholds/:id
   * Delete threshold (soft delete)
   */
  deleteThreshold = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await this.model.delete(id);
    
    return this.successResponse(
      res,
      null,
      'Threshold deleted successfully'
    );
  });
}

module.exports = AttainmentThresholdController;
