/**
 * Semester Controller
 * Handles HTTP requests for semester management
 */

const BaseController = require('./BaseController');
const SemesterService = require('../services/SemesterService');
const { body, param, query } = require('express-validator');

class SemesterController extends BaseController {
  constructor() {
    super(new SemesterService());
  }

  /**
   * Validation rules for creating a semester
   */
  createValidationRules() {
    return [
      body('academic_session_id')
        .notEmpty().withMessage('Academic session ID is required')
        .isInt({ min: 1 }).withMessage('Academic session ID must be a positive integer'),
      body('name')
        .trim()
        .notEmpty().withMessage('Semester name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Semester name must be between 3 and 100 characters'),
      body('semester_type')
        .trim()
        .notEmpty().withMessage('Semester type is required')
        .isIn(['fall', 'spring', 'summer']).withMessage('Semester type must be fall, spring, or summer'),
      body('semester_number')
        .notEmpty().withMessage('Semester number is required')
        .isInt({ min: 1 }).withMessage('Semester number must be a positive integer'),
      body('start_date')
        .notEmpty().withMessage('Start date is required')
        .isISO8601().withMessage('Start date must be a valid date'),
      body('end_date')
        .notEmpty().withMessage('End date is required')
        .isISO8601().withMessage('End date must be a valid date'),
      body('registration_start')
        .optional({ nullable: true })
        .isISO8601().withMessage('Registration start must be a valid date'),
      body('registration_end')
        .optional({ nullable: true })
        .isISO8601().withMessage('Registration end must be a valid date'),
      body('is_active')
        .optional()
        .isBoolean().withMessage('is_active must be a boolean')
    ];
  }

  /**
   * Validation rules for updating a semester
   */
  updateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('Invalid semester ID'),
      body('academic_session_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Academic session ID must be a positive integer'),
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Semester name must be between 3 and 100 characters'),
      body('semester_type')
        .optional()
        .trim()
        .isIn(['fall', 'spring', 'summer']).withMessage('Semester type must be fall, spring, or summer'),
      body('semester_number')
        .optional()
        .isInt({ min: 1 }).withMessage('Semester number must be a positive integer'),
      body('start_date')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date'),
      body('end_date')
        .optional()
        .isISO8601().withMessage('End date must be a valid date'),
      body('registration_start')
        .optional({ nullable: true })
        .isISO8601().withMessage('Registration start must be a valid date'),
      body('registration_end')
        .optional({ nullable: true })
        .isISO8601().withMessage('Registration end must be a valid date'),
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
      param('id').isInt({ min: 1 }).withMessage('Invalid semester ID')
    ];
  }

  /**
   * Validation rules for deleting
   */
  deleteValidationRules() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid semester ID')
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
        .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
    ];
  }

  /**
   * Validation rules for getting by type
   */
  getByTypeValidationRules() {
    return [
      query('type')
        .trim()
        .notEmpty().withMessage('Type is required')
        .isIn(['fall', 'spring', 'summer']).withMessage('Type must be fall, spring, or summer')
    ];
  }

  /**
   * Validation rules for getting by session
   */
  getBySessionValidationRules() {
    return [
      query('session_id')
        .notEmpty().withMessage('Session ID is required')
        .isInt({ min: 1 }).withMessage('Session ID must be a positive integer')
    ];
  }

  /**
   * Get active semesters
   * GET /api/v1/semesters/active
   */
  async getActive(req, res) {
    const semesters = await this.service.getActive();
    return this.successResponse(res, semesters, 'Active semesters retrieved successfully');
  }

  /**
   * Get current semester
   * GET /api/v1/semesters/current
   */
  async getCurrentSemester(req, res) {
    const semester = await this.service.getCurrentSemester();
    return this.successResponse(res, semester, 'Current semester retrieved successfully');
  }

  /**
   * Search semesters
   * GET /api/v1/semesters/search?q=...
   */
  async search(req, res) {
    const { q } = req.query;
    const semesters = await this.service.search(q);
    return this.successResponse(res, semesters, 'Search results retrieved successfully');
  }

  /**
   * Get semesters by type
   * GET /api/v1/semesters/by-type?type=...
   */
  async getByType(req, res) {
    const { type } = req.query;
    const semesters = await this.service.getByType(type);
    return this.successResponse(res, semesters, 'Semesters retrieved successfully');
  }

  /**
   * Get semesters by academic session
   * GET /api/v1/semesters/by-session?session_id=...
   */
  async getBySession(req, res) {
    const { session_id } = req.query;
    const semesters = await this.service.getByAcademicSession(parseInt(session_id));
    return this.successResponse(res, semesters, 'Semesters retrieved successfully');
  }

  /**
   * Set active semester
   * PUT /api/v1/semesters/:id/set-active
   */
  async setActive(req, res) {
    const { id } = req.params;
    const semester = await this.service.setActive(parseInt(id));
    return this.successResponse(res, semester, 'Semester set as active successfully');
  }
}

module.exports = SemesterController;
