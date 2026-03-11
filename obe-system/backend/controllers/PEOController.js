const BaseController = require('./BaseController');
const PEOService = require('../services/PEOService');
const { body, param, query } = require('express-validator');
const responseHelper = require('../utils/responseHelper');

/**
 * PEOController - Handles HTTP requests for Program Educational Objectives
 * Extends BaseController for standard CRUD operations
 */
class PEOController extends BaseController {
  constructor() {
    super(PEOService);
  }

  /**
   * Validation rules for creating PEO
   */
  getCreateValidationRules() {
    return [
      body('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      body('peo_no')
        .trim()
        .notEmpty()
        .withMessage('PEO number is required')
        .matches(/^PEO\d+$/i)
        .withMessage('PEO number must be in format PEO1, PEO2, etc.')
        .toUpperCase(),
      body('peo_description')
        .trim()
        .notEmpty()
        .withMessage('PEO description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('PEO description must be between 10 and 1000 characters'),
      body('display_order')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Display order must be a positive integer'),
      body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean')
    ];
  }

  /**
   * Validation rules for updating PEO
   */
  getUpdateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Valid PEO ID is required'),
      body('degree_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      body('peo_no')
        .optional()
        .trim()
        .matches(/^PEO\d+$/i)
        .withMessage('PEO number must be in format PEO1, PEO2, etc.')
        .toUpperCase(),
      body('peo_description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('PEO description must be between 10 and 1000 characters'),
      body('display_order')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Display order must be a positive integer'),
      body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean')
    ];
  }

  /**
   * Validation rules for bulk create PEOs
   */
  getBulkCreateValidationRules() {
    return [
      body('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      body('peos')
        .isArray({ min: 1 })
        .withMessage('PEOs array is required with at least one PEO'),
      body('peos.*.peo_no')
        .trim()
        .notEmpty()
        .withMessage('PEO number is required')
        .matches(/^PEO\d+$/i)
        .withMessage('PEO number must be in format PEO1, PEO2, etc.'),
      body('peos.*.peo_description')
        .trim()
        .notEmpty()
        .withMessage('PEO description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('PEO description must be between 10 and 1000 characters'),
      body('peos.*.display_order')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Display order must be a positive integer'),
      body('peos.*.is_active')
        .optional()
        .isBoolean()
        .withMessage('Is active must be a boolean')
    ];
  }

  /**
   * Validation rules for degree query parameter
   */
  getDegreeQueryValidationRules() {
    return [
      query('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required')
    ];
  }

  /**
   * Validation rules for mapping PEO to PLO
   */
  getMapPLOValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Valid PEO ID is required'),
      body('plo_id')
        .isInt({ min: 1 })
        .withMessage('Valid PLO ID is required'),
      body('correlation_level')
        .optional()
        .isIn(['high', 'medium', 'low'])
        .withMessage('Correlation level must be high, medium, or low')
    ];
  }

  /**
   * GET /api/v1/peos/:id/degree
   * Get PEO with degree information
   */
  async getWithDegree(req, res) {
    const { id } = req.params;
    const peo = await this.service.getWithDegree(id);
    
    return responseHelper.success(res, peo, 'PEO with degree retrieved successfully');
  }

  /**
   * GET /api/v1/peos/:id/relations
   * Get PEO with all relationships
   */
  async getWithRelations(req, res) {
    const { id } = req.params;
    const peo = await this.service.getWithRelations(id);
    
    return responseHelper.success(res, peo, 'PEO with relations retrieved successfully');
  }

  /**
   * GET /api/v1/peos/:id/plo-mappings
   * Get PLO mappings for a PEO
   */
  async getPLOMappings(req, res) {
    const { id } = req.params;
    const mappings = await this.service.getPLOMappings(id);
    
    return responseHelper.success(
      res, 
      mappings, 
      `Retrieved ${mappings.length} PLO mapping(s) successfully`
    );
  }

  /**
   * POST /api/v1/peos/:id/map-plo
   * Map PEO to PLO
   */
  async mapToPLO(req, res) {
    const { id } = req.params;
    const { plo_id, correlation_level = 'medium' } = req.body;
    
    const mapping = await this.service.mapToPLO(
      parseInt(id), 
      parseInt(plo_id),
      correlation_level
    );
    
    return responseHelper.success(res, mapping, 'PEO mapped to PLO successfully', 201);
  }

  /**
   * DELETE /api/v1/peos/:id/unmap-plo/:ploId
   * Unmap PEO from PLO
   */
  async unmapFromPLO(req, res) {
    const { id, ploId } = req.params;
    
    await this.service.unmapFromPLO(parseInt(id), parseInt(ploId));
    
    return responseHelper.success(res, null, 'PEO unmapped from PLO successfully');
  }

  /**
   * GET /api/v1/peos/by-degree
   * Get PEOs by degree
   */
  async getByDegree(req, res) {
    const { degree_id } = req.query;
    const peos = await this.service.getByDegree(parseInt(degree_id));
    
    return responseHelper.success(
      res, 
      peos, 
      `Retrieved ${peos.length} PEO(s) successfully`
    );
  }

  /**
   * GET /api/v1/peos/next-code
   * Get next available PEO code for a degree
   */
  async getNextPEOCode(req, res) {
    const { degree_id } = req.query;
    const nextCode = await this.service.getNextCode(parseInt(degree_id));
    
    return responseHelper.success(
      res, 
      { next_code: nextCode }, 
      'Next PEO code generated successfully'
    );
  }

  /**
   * POST /api/v1/peos/bulk
   * Bulk create PEOs for a degree
   */
  async bulkCreate(req, res) {
    const peos = await this.service.bulkCreate(req.body);
    
    return responseHelper.success(
      res, 
      peos, 
      `Successfully created ${peos.length} PEO(s)`,
      201
    );
  }

  /**
   * GET /api/v1/peos/search
   * Search PEOs by code or description
   */
  async search(req, res) {
    const { q, degree_id, limit } = req.query;
    
    const options = {
      degreeId: degree_id ? parseInt(degree_id) : null,
      limit: limit ? parseInt(limit) : 50
    };
    
    const results = await this.service.search(q || '', options);
    
    return responseHelper.success(
      res, 
      results, 
      `Found ${results.length} PEO(s)`
    );
  }
}

// Export instance for use in routes
module.exports = new PEOController();
