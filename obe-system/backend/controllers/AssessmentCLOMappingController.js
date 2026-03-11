const BaseController = require('./BaseController');
const AssessmentCLOMappingService = require('../services/AssessmentCLOMappingService');
const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Assessment-CLO Mapping Controller
 * Handles HTTP requests for mapping Course Learning Outcomes to Assessment Components
 */
class AssessmentCLOMappingController extends BaseController {
  constructor() {
    const service = new AssessmentCLOMappingService();
    super(service);
  }

  /**
   * Validation rules for bulk mapping CLOs to assessment
   */
  validateBulkMapping() {
    return [
      param('assessmentId')
        .isInt({ min: 1 })
        .withMessage('Assessment ID must be a positive integer'),
      body('mappings')
        .isArray({ min: 1 })
        .withMessage('Mappings must be a non-empty array'),
      body('mappings.*.clo_id')
        .isInt({ min: 1 })
        .withMessage('Each CLO ID must be a positive integer'),
      body('mappings.*.marks_allocated')
        .isFloat({ min: 0.01 })
        .withMessage('Marks allocated must be a positive number')
    ];
  }

  /**
   * Validation rules for updating mapping
   */
  validateUpdateMapping() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Mapping ID must be a positive integer'),
      body('marks_allocated')
        .isFloat({ min: 0.01 })
        .withMessage('Marks allocated must be a positive number')
    ];
  }

  /**
   * Validation rules for getting assessment CLOs
   */
  validateGetAssessmentCLOs() {
    return [
      param('assessmentId')
        .isInt({ min: 1 })
        .withMessage('Assessment ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getting CLO assessments
   */
  validateGetCLOAssessments() {
    return [
      param('cloId')
        .isInt({ min: 1 })
        .withMessage('CLO ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for deleting mapping
   */
  validateDeleteMapping() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Mapping ID must be a positive integer')
    ];
  }

  /**
   * Map multiple CLOs to an assessment component (Bulk mapping)
   * POST /api/assessments/:assessmentId/clo-mappings
   * 
   * @param {Object} req.params.assessmentId - Assessment component ID
   * @param {Array} req.body.mappings - Array of {clo_id, marks_allocated}
   */
  mapCLOsToAssessment = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const assessmentId = parseInt(req.params.assessmentId);
    const { mappings } = req.body;

    const result = await this.service.mapCLOsToAssessment(assessmentId, mappings);

    return this.successResponse(
      res,
      result,
      'CLOs successfully mapped to assessment',
      {},
      201
    );
  });

  /**
   * Get all CLO mappings for an assessment component
   * GET /api/assessments/:assessmentId/clo-mappings
   * 
   * @param {Object} req.params.assessmentId - Assessment component ID
   */
  getAssessmentCLOs = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const assessmentId = parseInt(req.params.assessmentId);

    const result = await this.service.getAssessmentCLOs(assessmentId);

    return this.successResponse(
      res,
      result,
      'Assessment CLO mappings retrieved successfully'
    );
  });

  /**
   * Update marks allocated for a specific mapping
   * PUT /api/assessment-clo-mappings/:id
   * 
   * @param {Object} req.params.id - Mapping ID
   * @param {number} req.body.marks_allocated - New marks allocation
   */
  updateMapping = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const id = parseInt(req.params.id);
    const { marks_allocated } = req.body;

    const result = await this.service.updateMapping(id, marks_allocated);

    return this.successResponse(
      res,
      result,
      'Mapping updated successfully'
    );
  });

  /**
   * Delete a CLO mapping from an assessment
   * DELETE /api/assessment-clo-mappings/:id
   * 
   * @param {Object} req.params.id - Mapping ID
   */
  deleteMapping = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const id = parseInt(req.params.id);

    await this.service.deleteMapping(id);

    return this.successResponse(
      res,
      null,
      'Mapping deleted successfully'
    );
  });

  /**
   * Get all assessments that use a specific CLO
   * GET /api/clos/:cloId/assessments
   * 
   * @param {Object} req.params.cloId - CLO ID
   */
  getCLOAssessments = asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const cloId = parseInt(req.params.cloId);

    const result = await this.service.getCLOAssessments(cloId);

    return this.successResponse(
      res,
      result,
      'CLO assessments retrieved successfully'
    );
  });

  /**
   * Get mapping by ID
   * GET /api/assessment-clo-mappings/:id
   * 
   * @param {Object} req.params.id - Mapping ID
   */
  getMappingById = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    const connection = await require('../config/database').getConnection();
    
    try {
      const [rows] = await connection.query(
        `SELECT 
          acm.id,
          acm.assessment_component_id,
          acm.clo_id,
          acm.marks_allocated,
          clo.clo_code,
          clo.description as clo_description,
          ac.name as assessment_name,
          ac.total_marks as assessment_total_marks,
          acm.created_at,
          acm.updated_at
         FROM assessment_clo_mapping acm
         INNER JOIN course_learning_outcomes clo ON acm.clo_id = clo.id
         INNER JOIN assessment_components ac ON acm.assessment_component_id = ac.id
         WHERE acm.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mapping not found'
        });
      }

      return this.successResponse(
        res,
        rows[0],
        'Mapping retrieved successfully'
      );

    } finally {
      connection.release();
    }
  });
}

module.exports = AssessmentCLOMappingController;
