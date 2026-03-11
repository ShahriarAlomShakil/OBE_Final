const BaseController = require('./BaseController');
const CLOService = require('../services/CLOService');
const { body, param, query, validationResult } = require('express-validator');
const responseHelper = require('../utils/responseHelper');

/**
 * CLO Controller
 * Handles HTTP requests for Course Learning Outcomes
 */
class CLOController extends BaseController {
  constructor() {
    super(CLOService);
  }

  /**
   * Validation rules for creating a CLO
   */
  validateCreate() {
    return [
      body('course_id')
        .isInt({ min: 1 })
        .withMessage('Course ID must be a positive integer'),
      body('clo_code')
        .trim()
        .matches(/^CLO\d+$/)
        .withMessage('CLO code must be in format CLO1, CLO2, etc.'),
      body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      body('bloom_level_id')
        .isInt({ min: 1, max: 6 })
        .withMessage('Bloom level ID must be between 1 and 6')
    ];
  }

  /**
   * Validation rules for updating a CLO
   */
  validateUpdate() {
    return [
      body('clo_code')
        .optional()
        .trim()
        .matches(/^CLO\d+$/)
        .withMessage('CLO code must be in format CLO1, CLO2, etc.'),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      body('bloom_level_id')
        .optional()
        .isInt({ min: 1, max: 6 })
        .withMessage('Bloom level ID must be between 1 and 6')
    ];
  }

  /**
   * Get CLO with all relationships
   */
  async getWithRelations(req, res) {
    const { id } = req.params;
    const clo = await this.service.getWithRelations(id);
    
    if (!clo) {
      return responseHelper.notFound(res, 'CLO not found');
    }

    return responseHelper.success(res, clo, 'CLO with relationships retrieved successfully');
  }

  /**
   * Get CLO with course information
   */
  async getWithCourse(req, res) {
    const { id } = req.params;
    const clo = await this.service.getWithCourse(id);
    
    if (!clo) {
      return responseHelper.notFound(res, 'CLO not found');
    }

    return responseHelper.success(res, clo, 'CLO with course retrieved successfully');
  }

  /**
   * Get CLO with Bloom level information
   */
  async getWithBloomLevel(req, res) {
    const { id } = req.params;
    const clo = await this.service.getWithBloomLevel(id);
    
    if (!clo) {
      return responseHelper.notFound(res, 'CLO not found');
    }

    return responseHelper.success(res, clo, 'CLO with Bloom level retrieved successfully');
  }

  /**
   * Get CLOs by course
   */
  async getByCourse(req, res) {
    const { courseId } = req.params;
    const clos = await this.service.getByCourseId(parseInt(courseId));
    
    return responseHelper.success(
      res, 
      clos, 
      `${clos.length} CLO(s) retrieved successfully`
    );
  }

  /**
   * Get CLOs by Bloom level
   */
  async getByBloomLevel(req, res) {
    const { bloomLevelId } = req.query;
    
    if (!bloomLevelId) {
      return responseHelper.badRequest(res, 'Bloom level ID is required');
    }

    const clos = await this.service.getByBloomLevel(parseInt(bloomLevelId));
    
    return responseHelper.success(
      res, 
      clos, 
      `${clos.length} CLO(s) retrieved successfully`
    );
  }

  /**
   * Search CLOs
   */
  async search(req, res) {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return responseHelper.badRequest(res, 'Search query (q) is required');
    }

    const clos = await this.service.search(q);
    
    return responseHelper.success(
      res, 
      clos, 
      `${clos.length} CLO(s) found`
    );
  }

  /**
   * Get PLO mappings for a CLO
   */
  async getPLOMappings(req, res) {
    const { id } = req.params;
    const mappings = await this.service.getPLOMappings(id);
    
    return responseHelper.success(
      res, 
      mappings, 
      `${mappings.length} PLO mapping(s) retrieved successfully`
    );
  }

  /**
   * Get assessments that measure this CLO
   */
  async getAssessments(req, res) {
    const { id } = req.params;
    const assessments = await this.service.getAssessments(id);
    
    return responseHelper.success(
      res, 
      assessments, 
      `${assessments.length} assessment(s) retrieved successfully`
    );
  }

  /**
   * Calculate CLO attainment for a course offering
   */
  async calculateAttainment(req, res) {
    const { id } = req.params;
    const { courseOfferingId } = req.query;
    
    if (!courseOfferingId) {
      return responseHelper.badRequest(res, 'Course offering ID is required');
    }

    const attainment = await this.service.calculateAttainment(
      parseInt(id), 
      parseInt(courseOfferingId)
    );
    
    return responseHelper.success(
      res, 
      attainment, 
      'CLO attainment calculated successfully'
    );
  }

  /**
   * Get statistics for a CLO
   */
  async getStatistics(req, res) {
    const { id } = req.params;
    const statistics = await this.service.getStatistics(id);
    
    return responseHelper.success(
      res, 
      statistics, 
      'CLO statistics retrieved successfully'
    );
  }

  /**
   * Get next available CLO code for a course
   */
  async getNextCLOCode(req, res) {
    const { courseId } = req.query;
    
    if (!courseId) {
      return responseHelper.badRequest(res, 'Course ID is required');
    }

    const nextCode = await this.service.getNextCLOCode(parseInt(courseId));
    
    return responseHelper.success(
      res, 
      { nextCode }, 
      'Next CLO code retrieved successfully'
    );
  }

  /**
   * Bulk create CLOs for a course
   */
  async bulkCreate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.validationError(res, 'Validation failed', errors.array());
    }

    const { course_id, clos } = req.body;
    
    if (!Array.isArray(clos) || clos.length === 0) {
      return responseHelper.badRequest(res, 'CLOs array is required');
    }

    const results = await this.service.bulkCreateForCourse(course_id, clos);
    
    return responseHelper.created(
      res, 
      results, 
      `${results.length} CLO(s) created successfully`
    );
  }

  /**
   * Validation rules for bulk create
   */
  validateBulkCreate() {
    return [
      body('course_id')
        .isInt({ min: 1 })
        .withMessage('Course ID must be a positive integer'),
      body('clos')
        .isArray({ min: 1 })
        .withMessage('CLOs must be an array with at least one item'),
      body('clos.*.description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Each CLO description must be between 10 and 1000 characters'),
      body('clos.*.bloom_level_id')
        .isInt({ min: 1, max: 6 })
        .withMessage('Each CLO Bloom level ID must be between 1 and 6')
    ];
  }
}

module.exports = new CLOController();
