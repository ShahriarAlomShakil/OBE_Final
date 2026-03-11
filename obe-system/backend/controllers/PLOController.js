const BaseController = require('./BaseController');
const PLOService = require('../services/PLOService');
const { body, param, query } = require('express-validator');
const responseHelper = require('../utils/responseHelper');

/**
 * PLOController - Handles HTTP requests for Program Learning Outcomes
 * Extends BaseController for standard CRUD operations
 */
class PLOController extends BaseController {
  constructor() {
    super(PLOService);
  }

  /**
   * Validation rules for creating PLO
   */
  getCreateValidationRules() {
    return [
      body('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      body('plo_code')
        .trim()
        .notEmpty()
        .withMessage('PLO code is required')
        .matches(/^PLO\d+$/i)
        .withMessage('PLO code must be in format PLO1, PLO2, etc.')
        .toUpperCase(),
      body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      body('plo_domain')
        .trim()
        .notEmpty()
        .withMessage('PLO domain is required')
        .isIn(['cognitive', 'affective', 'psychomotor'])
        .withMessage('PLO domain must be cognitive, affective, or psychomotor')
        .toLowerCase()
    ];
  }

  /**
   * Validation rules for updating PLO
   */
  getUpdateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Valid PLO ID is required'),
      body('degree_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      body('plo_code')
        .optional()
        .trim()
        .matches(/^PLO\d+$/i)
        .withMessage('PLO code must be in format PLO1, PLO2, etc.')
        .toUpperCase(),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      body('plo_domain')
        .optional()
        .trim()
        .isIn(['cognitive', 'affective', 'psychomotor'])
        .withMessage('PLO domain must be cognitive, affective, or psychomotor')
        .toLowerCase()
    ];
  }

  /**
   * GET /api/v1/plos/:id/degree
   * Get PLO with degree information
   */
  async getWithDegree(req, res) {
    const { id } = req.params;
    const plo = await this.service.getWithDegree(id);
    
    return responseHelper.success(res, plo, 'PLO with degree retrieved successfully');
  }

  /**
   * GET /api/v1/plos/:id/relations
   * Get PLO with all relationships
   */
  async getWithRelations(req, res) {
    const { id } = req.params;
    const plo = await this.service.getWithRelations(id);
    
    return responseHelper.success(res, plo, 'PLO with relations retrieved successfully');
  }

  /**
   * GET /api/v1/plos/by-domain?domain=cognitive
   * Get PLOs by domain type
   */
  async getByDomain(req, res) {
    const { domain } = req.query;
    
    if (!domain) {
      return responseHelper.badRequest(res, 'Domain parameter is required');
    }

    const plos = await this.service.getByDomain(domain);
    
    return responseHelper.success(res, plos, `PLOs in ${domain} domain retrieved successfully`);
  }

  /**
   * GET /api/v1/plos/search?q=term
   * Search PLOs by description or code
   */
  async search(req, res) {
    const { q } = req.query;
    
    if (!q) {
      return responseHelper.badRequest(res, 'Search query (q) is required');
    }

    const plos = await this.service.search(q);
    
    return responseHelper.success(res, plos, `Found ${plos.length} PLO(s)`, {
      count: plos.length,
      searchTerm: q
    });
  }

  /**
   * GET /api/v1/plos/:id/clo-mappings
   * Get CLO mappings for a PLO
   */
  async getCLOMappings(req, res) {
    const { id } = req.params;
    const mappings = await this.service.getCLOMappings(id);
    
    return responseHelper.success(res, mappings, 'CLO mappings retrieved successfully', {
      count: mappings.length
    });
  }

  /**
   * GET /api/v1/plos/:id/peo-mappings
   * Get PEO mappings for a PLO
   */
  async getPEOMappings(req, res) {
    const { id } = req.params;
    const mappings = await this.service.getPEOMappings(id);
    
    return responseHelper.success(res, mappings, 'PEO mappings retrieved successfully', {
      count: mappings.length
    });
  }

  /**
   * GET /api/v1/plos/:id/attainment?batch=2023
   * Calculate attainment for a PLO
   */
  async calculateAttainment(req, res) {
    const { id } = req.params;
    const { batch } = req.query;
    
    if (!batch) {
      return responseHelper.badRequest(res, 'Batch year is required');
    }

    const attainment = await this.service.calculateAttainment(id, batch);
    
    return responseHelper.success(res, attainment, 'PLO attainment calculated successfully');
  }

  /**
   * GET /api/v1/plos/:id/statistics
   * Get statistics for a PLO
   */
  async getStatistics(req, res) {
    const { id } = req.params;
    const statistics = await this.service.getStatistics(id);
    
    return responseHelper.success(res, statistics, 'PLO statistics retrieved successfully');
  }

  /**
   * GET /api/v1/plos/next-code?degreeId=X
   * Get next available PLO code for a degree
   */
  async getNextPLOCode(req, res) {
    const { degreeId } = req.query;
    
    if (!degreeId) {
      return responseHelper.badRequest(res, 'Degree ID is required');
    }

    const nextCode = await this.service.getNextPLOCode(parseInt(degreeId));
    
    return responseHelper.success(res, { nextCode }, 'Next PLO code retrieved successfully');
  }

  /**
   * POST /api/v1/plos/bulk
   * Bulk create PLOs for a degree
   */
  async bulkCreate(req, res) {
    const { degree_id, plos } = req.body;
    
    if (!degree_id) {
      return responseHelper.badRequest(res, 'Degree ID is required');
    }

    if (!Array.isArray(plos) || plos.length === 0) {
      return responseHelper.badRequest(res, 'PLOs array is required and must not be empty');
    }

    const created = await this.service.bulkCreateForDegree(degree_id, plos);
    
    return responseHelper.created(res, created, `${created.length} PLO(s) created successfully`, {
      count: created.length
    });
  }

  /**
   * Validation rules for bulk create
   */
  getBulkCreateValidationRules() {
    return [
      body('degree_id')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required'),
      body('plos')
        .isArray({ min: 1 })
        .withMessage('PLOs array is required and must not be empty'),
      body('plos.*.description')
        .trim()
        .notEmpty()
        .withMessage('Description is required for each PLO')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      body('plos.*.plo_domain')
        .trim()
        .notEmpty()
        .withMessage('PLO domain is required for each PLO')
        .isIn(['cognitive', 'affective', 'psychomotor'])
        .withMessage('PLO domain must be cognitive, affective, or psychomotor')
        .toLowerCase(),
      body('plos.*.plo_code')
        .optional()
        .trim()
        .matches(/^PLO\d+$/i)
        .withMessage('PLO code must be in format PLO1, PLO2, etc.')
        .toUpperCase()
    ];
  }

  /**
   * Validation rules for degree-specific queries
   */
  getDegreeQueryValidationRules() {
    return [
      query('degreeId')
        .isInt({ min: 1 })
        .withMessage('Valid degree ID is required')
    ];
  }

  /**
   * Validation rules for batch query
   */
  getBatchQueryValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 })
        .withMessage('Valid PLO ID is required'),
      query('batch')
        .matches(/^\d{4}$/)
        .withMessage('Valid batch year is required (format: YYYY)')
    ];
  }
}

module.exports = new PLOController();
