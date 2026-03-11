const BaseController = require('./BaseController');
const CourseService = require('../services/CourseService');
const { body, param, query } = require('express-validator');

/**
 * Course Controller
 * Handles HTTP requests for course management
 */
class CourseController extends BaseController {
  constructor() {
    super(CourseService);
  }

  /**
   * Validation rules for creating a course
   */
  get createValidation() {
    return [
      body('department_id')
        .isInt({ min: 1 }).withMessage('Department ID must be a positive integer')
        .notEmpty().withMessage('Department ID is required'),
      body('code')
        .trim()
        .notEmpty().withMessage('Course code is required')
        .isLength({ max: 20 }).withMessage('Course code must not exceed 20 characters')
        .toUpperCase(),
      body('title')
        .trim()
        .notEmpty().withMessage('Course title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Course title must be between 3 and 200 characters'),
      body('credit_hours')
        .isFloat({ min: 0.5, max: 10 }).withMessage('Credit hours must be between 0.5 and 10')
        .notEmpty().withMessage('Credit hours are required'),
      body('theory_hours')
        .isInt({ min: 0, max: 20 }).withMessage('Theory hours must be between 0 and 20')
        .notEmpty().withMessage('Theory hours are required'),
      body('lab_hours')
        .isInt({ min: 0, max: 20 }).withMessage('Lab hours must be between 0 and 20')
        .notEmpty().withMessage('Lab hours are required'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
    ];
  }

  /**
   * Validation rules for updating a course
   */
  get updateValidation() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid course ID'),
      body('department_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
      body('code')
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage('Course code must not exceed 20 characters')
        .toUpperCase(),
      body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Course title must be between 3 and 200 characters'),
      body('credit_hours')
        .optional()
        .isFloat({ min: 0.5, max: 10 }).withMessage('Credit hours must be between 0.5 and 10'),
      body('theory_hours')
        .optional()
        .isInt({ min: 0, max: 20 }).withMessage('Theory hours must be between 0 and 20'),
      body('lab_hours')
        .optional()
        .isInt({ min: 0, max: 20 }).withMessage('Lab hours must be between 0 and 20'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
    ];
  }

  /**
   * Get course with department relationship
   * GET /api/v1/courses/:id/department
   */
  async getWithDepartment(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const course = await this.service.getWithDepartment(id);
      return this.successResponse(res, course, 'Course with department retrieved successfully');
    });
  }

  /**
   * Get course with all relationships
   * GET /api/v1/courses/:id/relations
   */
  async getWithRelations(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const course = await this.service.getWithRelations(id);
      return this.successResponse(res, course, 'Course with all relations retrieved successfully');
    });
  }

  /**
   * Get active courses
   * GET /api/v1/courses/active
   */
  async getActive(req, res) {
    return this.customAction(req, res, async () => {
      const courses = await this.service.getActive();
      return this.successResponse(res, courses, 'Active courses retrieved successfully');
    });
  }

  /**
   * Search courses
   * GET /api/v1/courses/search?q=term
   */
  async search(req, res) {
    return this.customAction(req, res, async () => {
      const { q } = req.query;
      const courses = await this.service.search(q);
      return this.successResponse(res, courses, 'Search results retrieved successfully');
    });
  }

  /**
   * Get courses by department
   * GET /api/v1/departments/:departmentId/courses
   */
  async getByDepartment(req, res) {
    return this.customAction(req, res, async () => {
      const { departmentId } = req.params;
      const courses = await this.service.getByDepartmentId(departmentId);
      return this.successResponse(res, courses, 'Department courses retrieved successfully');
    });
  }

  /**
   * Get courses by credit hours
   * GET /api/v1/courses/by-credit-hours?credits=3
   */
  async getByCreditHours(req, res) {
    return this.customAction(req, res, async () => {
      const { credits } = req.query;
      const courses = await this.service.getByCreditHours(parseFloat(credits));
      return this.successResponse(res, courses, 'Courses retrieved successfully');
    });
  }

  /**
   * Get total count of courses
   * GET /api/v1/courses/count
   */
  async getCount(req, res) {
    return this.customAction(req, res, async () => {
      const filters = req.query || {};
      const count = await this.service.count(filters);
      return this.successResponse(res, { count }, 'Course count retrieved successfully');
    });
  }

  /**
   * Toggle course status
   * PATCH /api/v1/courses/:id/toggle-status
   */
  async toggleStatus(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const course = await this.service.toggleStatus(id);
      return this.successResponse(res, course, 'Course status updated successfully');
    });
  }

  /**
   * Get course statistics
   * GET /api/v1/courses/:id/statistics
   */
  async getStatistics(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const statistics = await this.service.getStatistics(id);
      return this.successResponse(res, statistics, 'Course statistics retrieved successfully');
    });
  }

  /**
   * Get CLOs for a course
   * GET /api/v1/courses/:id/clos
   */
  async getCLOs(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const clos = await this.service.getCLOs(id);
      return this.successResponse(res, clos, 'Course CLOs retrieved successfully');
    });
  }

  /**
   * Get objectives for a course
   * GET /api/v1/courses/:id/objectives
   */
  async getObjectives(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const objectives = await this.service.getObjectives(id);
      return this.successResponse(res, objectives, 'Course objectives retrieved successfully');
    });
  }

  /**
   * Get offerings for a course
   * GET /api/v1/courses/:id/offerings
   */
  async getOfferings(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const offerings = await this.service.getOfferings(id);
      return this.successResponse(res, offerings, 'Course offerings retrieved successfully');
    });
  }

  /**
   * Get prerequisites for a course
   * GET /api/v1/courses/:id/prerequisites
   */
  async getPrerequisites(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const prerequisites = await this.service.getPrerequisites(id);
      return this.successResponse(res, prerequisites, 'Course prerequisites retrieved successfully');
    });
  }

  /**
   * Get dependent courses
   * GET /api/v1/courses/:id/dependent-courses
   */
  async getDependentCourses(req, res) {
    return this.customAction(req, res, async () => {
      const { id } = req.params;
      const dependentCourses = await this.service.getDependentCourses(id);
      return this.successResponse(res, dependentCourses, 'Dependent courses retrieved successfully');
    });
  }
}

module.exports = new CourseController();
