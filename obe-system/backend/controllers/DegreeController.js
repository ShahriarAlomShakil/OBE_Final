const BaseController = require('./BaseController');
const DegreeService = require('../services/DegreeService');
const { body, param, query } = require('express-validator');

class DegreeController extends BaseController {
  constructor() {
    super(DegreeService);
  }

  /**
   * Validation rules for creating a degree
   */
  createValidationRules() {
    return [
      body('department_id')
        .notEmpty().withMessage('Department ID is required')
        .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
      body('name')
        .trim()
        .notEmpty().withMessage('Degree name is required')
        .isLength({ min: 3, max: 200 }).withMessage('Degree name must be between 3 and 200 characters'),
      body('short_name')
        .trim()
        .notEmpty().withMessage('Short name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Short name must be between 2 and 50 characters'),
      body('degree_type')
        .trim()
        .notEmpty().withMessage('Degree type is required')
        .isIn(['bachelors', 'masters', 'phd', 'diploma', 'associate'])
        .withMessage('Degree type must be one of: bachelors, masters, phd, diploma, associate'),
      body('total_credits')
        .notEmpty().withMessage('Total credits is required')
        .isFloat({ min: 0.1 }).withMessage('Total credits must be a positive number'),
      body('duration_years')
        .notEmpty().withMessage('Duration is required')
        .isInt({ min: 1, max: 10 }).withMessage('Duration must be between 1 and 10 years'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
      body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean')
    ];
  }

  /**
   * Validation rules for updating a degree
   */
  updateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('Invalid degree ID'),
      body('department_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Degree name must be between 3 and 200 characters'),
      body('short_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Short name must be between 2 and 50 characters'),
      body('degree_type')
        .optional()
        .trim()
        .isIn(['bachelors', 'masters', 'phd', 'diploma', 'associate'])
        .withMessage('Degree type must be one of: bachelors, masters, phd, diploma, associate'),
      body('total_credits')
        .optional()
        .isFloat({ min: 0.1 }).withMessage('Total credits must be a positive number'),
      body('duration_years')
        .optional()
        .isInt({ min: 1, max: 10 }).withMessage('Duration must be between 1 and 10 years'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
      body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean')
    ];
  }

  /**
   * Validation rules for getting by ID
   */
  getByIdValidationRules() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid degree ID')
    ];
  }

  /**
   * Validation rules for deleting
   */
  deleteValidationRules() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid degree ID')
    ];
  }

  /**
   * Validation rules for search
   */
  searchValidationRules() {
    return [
      query('q')
        .trim()
        .notEmpty().withMessage('Search query is required')
        .isLength({ min: 1 }).withMessage('Search query must be at least 1 character')
    ];
  }

  /**
   * Validation rules for getting by department
   */
  getByDepartmentValidationRules() {
    return [
      param('departmentId').isInt({ min: 1 }).withMessage('Invalid department ID')
    ];
  }

  /**
   * Validation rules for getting by type
   */
  getByTypeValidationRules() {
    return [
      query('type')
        .trim()
        .notEmpty().withMessage('Degree type is required')
        .isIn(['bachelors', 'masters', 'phd', 'diploma', 'associate'])
        .withMessage('Invalid degree type')
    ];
  }

  /**
   * Validation rules for toggle status
   */
  toggleStatusValidationRules() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid degree ID')
    ];
  }

  /**
   * Get degree with department - GET /degrees/:id/department
   */
  async getWithDepartment(req, res) {
    await this.handleAction(req, res, async () => {
      const degree = await this.service.getWithDepartment(parseInt(req.params.id));
      return this.successResponse(res, degree, 'Degree retrieved successfully');
    });
  }

  /**
   * Get degree with all relationships - GET /degrees/:id/relations
   */
  async getWithRelations(req, res) {
    await this.handleAction(req, res, async () => {
      const degree = await this.service.getWithRelations(parseInt(req.params.id));
      return this.successResponse(res, degree, 'Degree with relationships retrieved successfully');
    });
  }

  /**
   * Get active degrees - GET /degrees/active
   */
  async getActive(req, res) {
    await this.handleAction(req, res, async () => {
      const degrees = await this.service.getActive();
      return this.successResponse(res, degrees, 'Active degrees retrieved successfully');
    });
  }

  /**
   * Search degrees - GET /degrees/search?q=term
   */
  async search(req, res) {
    await this.handleAction(req, res, async () => {
      const degrees = await this.service.search(req.query.q);
      return this.successResponse(res, degrees, 'Search results retrieved successfully');
    });
  }

  /**
   * Get degrees by department - GET /departments/:departmentId/degrees
   */
  async getByDepartment(req, res) {
    await this.handleAction(req, res, async () => {
      const degrees = await this.service.getByDepartmentId(parseInt(req.params.departmentId));
      return this.successResponse(res, degrees, 'Degrees retrieved successfully');
    });
  }

  /**
   * Get degrees by type - GET /degrees/by-type?type=bachelors
   */
  async getByType(req, res) {
    await this.handleAction(req, res, async () => {
      const degrees = await this.service.getByType(req.query.type);
      return this.successResponse(res, degrees, 'Degrees retrieved successfully');
    });
  }

  /**
   * Toggle degree status - PATCH /degrees/:id/toggle-status
   */
  async toggleStatus(req, res) {
    await this.handleAction(req, res, async () => {
      const degree = await this.service.toggleStatus(parseInt(req.params.id));
      return this.successResponse(res, degree, 'Degree status toggled successfully');
    });
  }

  /**
   * Get degree statistics - GET /degrees/:id/statistics
   */
  async getStatistics(req, res) {
    await this.handleAction(req, res, async () => {
      const stats = await this.service.getStatistics(parseInt(req.params.id));
      return this.successResponse(res, stats, 'Degree statistics retrieved successfully');
    });
  }

  /**
   * Get degree PLOs - GET /degrees/:id/plos
   */
  async getPLOs(req, res) {
    await this.handleAction(req, res, async () => {
      const plos = await this.service.getPLOs(parseInt(req.params.id));
      return this.successResponse(res, plos, 'PLOs retrieved successfully');
    });
  }

  /**
   * Get degree PEOs - GET /degrees/:id/peos
   */
  async getPEOs(req, res) {
    await this.handleAction(req, res, async () => {
      const peos = await this.service.getPEOs(parseInt(req.params.id));
      return this.successResponse(res, peos, 'PEOs retrieved successfully');
    });
  }

  /**
   * Get degree students - GET /degrees/:id/students
   */
  async getStudents(req, res) {
    await this.handleAction(req, res, async () => {
      const students = await this.service.getStudents(parseInt(req.params.id));
      return this.successResponse(res, students, 'Students retrieved successfully');
    });
  }
}

module.exports = DegreeController;
