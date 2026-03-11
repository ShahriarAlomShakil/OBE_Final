const BaseController = require('./BaseController');
const DepartmentService = require('../services/DepartmentService');
const { body, param, query } = require('express-validator');

class DepartmentController extends BaseController {
  constructor() {
    super(DepartmentService);
  }

  /**
   * Validation rules for creating a department
   */
  createValidationRules() {
    return [
      body('faculty_id')
        .notEmpty().withMessage('Faculty ID is required')
        .isInt({ min: 1 }).withMessage('Faculty ID must be a positive integer'),
      body('name')
        .trim()
        .notEmpty().withMessage('Department name is required')
        .isLength({ min: 3, max: 200 }).withMessage('Department name must be between 3 and 200 characters'),
      body('short_name')
        .trim()
        .notEmpty().withMessage('Short name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Short name must be between 2 and 50 characters'),
      body('code')
        .trim()
        .notEmpty().withMessage('Department code is required')
        .isLength({ min: 2, max: 20 }).withMessage('Department code must be between 2 and 20 characters'),
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
   * Validation rules for updating a department
   */
  updateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('Invalid department ID'),
      body('faculty_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Faculty ID must be a positive integer'),
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Department name must be between 3 and 200 characters'),
      body('short_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Short name must be between 2 and 50 characters'),
      body('code')
        .optional()
        .trim()
        .isLength({ min: 2, max: 20 }).withMessage('Department code must be between 2 and 20 characters'),
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
      param('id').isInt({ min: 1 }).withMessage('Invalid department ID')
    ];
  }

  /**
   * Validation rules for deleting
   */
  deleteValidationRules() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid department ID')
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
   * Validation rules for getting by faculty
   */
  getByFacultyValidationRules() {
    return [
      param('facultyId').isInt({ min: 1 }).withMessage('Invalid faculty ID')
    ];
  }

  /**
   * GET /api/v1/departments/:id/faculty
   * Get department with faculty relationship
   */
  async getWithFaculty(req, res) {
    const { id } = req.params;
    const department = await this.service.getWithFaculty(id);
    return this.successResponse(res, department, 'Department with faculty retrieved successfully');
  }

  /**
   * GET /api/v1/departments/:id/relations
   * Get department with all relationships (faculty, courses, teachers)
   */
  async getWithRelations(req, res) {
    const { id } = req.params;
    const department = await this.service.getWithRelations(id);
    return this.successResponse(res, department, 'Department with all relationships retrieved successfully');
  }

  /**
   * GET /api/v1/departments/active
   * Get all active departments
   */
  async getActive(req, res) {
    const departments = await this.service.getActive();
    return this.successResponse(res, departments, 'Active departments retrieved successfully');
  }

  /**
   * GET /api/v1/departments/search?q=term
   * Search departments by name, short name, or code
   */
  async search(req, res) {
    const { q } = req.query;
    const departments = await this.service.search(q);
    return this.successResponse(res, departments, 'Search results retrieved successfully');
  }

  /**
   * GET /api/v1/faculties/:facultyId/departments
   * Get departments by faculty ID
   */
  async getByFaculty(req, res) {
    const { facultyId } = req.params;
    const departments = await this.service.getByFacultyId(facultyId);
    return this.successResponse(res, departments, 'Departments retrieved successfully');
  }

  /**
   * PATCH /api/v1/departments/:id/toggle-status
   * Toggle department active status
   */
  async toggleStatus(req, res) {
    const { id } = req.params;
    const department = await this.service.toggleStatus(id);
    return this.successResponse(res, department, 'Department status toggled successfully');
  }

  /**
   * GET /api/v1/departments/:id/statistics
   * Get department statistics (courses, teachers, students count)
   */
  async getStatistics(req, res) {
    const { id } = req.params;
    const statistics = await this.service.getStatistics(id);
    return this.successResponse(res, statistics, 'Department statistics retrieved successfully');
  }

  /**
   * GET /api/v1/departments/:id/courses
   * Get all courses in department
   */
  async getCourses(req, res) {
    const { id } = req.params;
    const courses = await this.service.getCourses(id);
    return this.successResponse(res, courses, 'Department courses retrieved successfully');
  }

  /**
   * GET /api/v1/departments/:id/teachers
   * Get all teachers in department
   */
  async getTeachers(req, res) {
    const { id } = req.params;
    const teachers = await this.service.getTeachers(id);
    return this.successResponse(res, teachers, 'Department teachers retrieved successfully');
  }
}

module.exports = new DepartmentController();
