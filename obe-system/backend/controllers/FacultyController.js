const BaseController = require('./BaseController');
const FacultyService = require('../services/FacultyService');
const { body, param, query } = require('express-validator');

/**
 * Faculty Controller
 * Handles HTTP requests for faculty management
 * 
 * @extends BaseController
 */
class FacultyController extends BaseController {
  constructor() {
    const facultyService = new FacultyService();
    super(facultyService);
  }

  /**
   * Validation rules for creating a faculty
   */
  static get createValidation() {
    return [
      body('name')
        .trim()
        .notEmpty().withMessage('Faculty name is required')
        .isLength({ min: 3, max: 255 }).withMessage('Faculty name must be between 3 and 255 characters'),
      
      body('short_name')
        .trim()
        .notEmpty().withMessage('Short name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Short name must be between 2 and 50 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
      
      body('established_date')
        .optional()
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
          if (value && new Date(value) > new Date()) {
            throw new Error('Established date cannot be in the future');
          }
          return true;
        }),
      
      body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean value')
    ];
  }

  /**
   * Validation rules for updating a faculty
   */
  static get updateValidation() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('Invalid faculty ID'),
      
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 }).withMessage('Faculty name must be between 3 and 255 characters'),
      
      body('short_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Short name must be between 2 and 50 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
      
      body('established_date')
        .optional()
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
          if (value && new Date(value) > new Date()) {
            throw new Error('Established date cannot be in the future');
          }
          return true;
        }),
      
      body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean value')
    ];
  }

  /**
   * Get faculty with departments
   * GET /api/v1/faculties/:id/departments
   */
  async getWithDepartments(req, res) {
    const { id } = req.params;
    const faculty = await this.service.getWithDepartments(parseInt(id));
    return this.successResponse(res, faculty, 'Faculty retrieved with departments');
  }

  /**
   * Get all active faculties
   * GET /api/v1/faculties/active
   */
  async getActive(req, res) {
    const faculties = await this.service.getActive();
    return this.successResponse(res, faculties, 'Active faculties retrieved successfully');
  }

  /**
   * Search faculties
   * GET /api/v1/faculties/search?q=term
   */
  async search(req, res) {
    const { q } = req.query;
    const faculties = await this.service.search(q);
    return this.successResponse(res, faculties, 'Search results retrieved successfully');
  }

  /**
   * Toggle faculty status
   * PATCH /api/v1/faculties/:id/toggle-status
   */
  async toggleStatus(req, res) {
    const { id } = req.params;
    const faculty = await this.service.toggleStatus(parseInt(id));
    return this.successResponse(res, faculty, 'Faculty status updated successfully');
  }

  /**
   * Get faculty statistics
   * GET /api/v1/faculties/:id/statistics
   */
  async getStatistics(req, res) {
    const { id } = req.params;
    const statistics = await this.service.getStatistics(parseInt(id));
    return this.successResponse(res, statistics, 'Faculty statistics retrieved successfully');
  }

  /**
   * Validation for search
   */
  static get searchValidation() {
    return [
      query('q')
        .trim()
        .notEmpty().withMessage('Search term is required')
        .isLength({ min: 2 }).withMessage('Search term must be at least 2 characters')
    ];
  }

  /**
   * Validation for ID parameter
   */
  static get idValidation() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid faculty ID')
    ];
  }
}

module.exports = FacultyController;
