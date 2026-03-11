const BaseService = require('./BaseService');
const Course = require('../models/Course');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

/**
 * Course Service
 * Business logic for course management
 */
class CourseService extends BaseService {
  constructor() {
    super(Course);
  }

  /**
   * Joi validation schema for course creation
   */
  get createValidationSchema() {
    return Joi.object({
      department_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Department ID must be a number',
          'number.positive': 'Department ID must be positive',
          'any.required': 'Department ID is required'
        }),
      code: Joi.string().trim().uppercase().max(20).required()
        .messages({
          'string.empty': 'Course code is required',
          'string.max': 'Course code must not exceed 20 characters',
          'any.required': 'Course code is required'
        }),
      title: Joi.string().trim().min(3).max(200).required()
        .messages({
          'string.empty': 'Course title is required',
          'string.min': 'Course title must be at least 3 characters',
          'string.max': 'Course title must not exceed 200 characters',
          'any.required': 'Course title is required'
        }),
      credit_hours: Joi.number().positive().max(10).required()
        .messages({
          'number.base': 'Credit hours must be a number',
          'number.positive': 'Credit hours must be positive',
          'number.max': 'Credit hours cannot exceed 10',
          'any.required': 'Credit hours are required'
        }),
      theory_hours: Joi.number().min(0).max(20).required()
        .messages({
          'number.base': 'Theory hours must be a number',
          'number.min': 'Theory hours cannot be negative',
          'number.max': 'Theory hours cannot exceed 20',
          'any.required': 'Theory hours are required'
        }),
      lab_hours: Joi.number().min(0).max(20).required()
        .messages({
          'number.base': 'Lab hours must be a number',
          'number.min': 'Lab hours cannot be negative',
          'number.max': 'Lab hours cannot exceed 20',
          'any.required': 'Lab hours are required'
        }),
      description: Joi.string().trim().max(1000).allow('', null)
        .messages({
          'string.max': 'Description must not exceed 1000 characters'
        }),
      is_active: Joi.boolean().default(true)
    });
  }

  /**
   * Joi validation schema for course update
   */
  get updateValidationSchema() {
    return Joi.object({
      department_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Department ID must be a number',
          'number.positive': 'Department ID must be positive'
        }),
      code: Joi.string().trim().uppercase().max(20)
        .messages({
          'string.max': 'Course code must not exceed 20 characters'
        }),
      title: Joi.string().trim().min(3).max(200)
        .messages({
          'string.min': 'Course title must be at least 3 characters',
          'string.max': 'Course title must not exceed 200 characters'
        }),
      credit_hours: Joi.number().positive().max(10)
        .messages({
          'number.base': 'Credit hours must be a number',
          'number.positive': 'Credit hours must be positive',
          'number.max': 'Credit hours cannot exceed 10'
        }),
      theory_hours: Joi.number().min(0).max(20)
        .messages({
          'number.base': 'Theory hours must be a number',
          'number.min': 'Theory hours cannot be negative',
          'number.max': 'Theory hours cannot exceed 20'
        }),
      lab_hours: Joi.number().min(0).max(20)
        .messages({
          'number.base': 'Lab hours must be a number',
          'number.min': 'Lab hours cannot be negative',
          'number.max': 'Lab hours cannot exceed 20'
        }),
      description: Joi.string().trim().max(1000).allow('', null)
        .messages({
          'string.max': 'Description must not exceed 1000 characters'
        }),
      is_active: Joi.boolean()
    }).min(1);
  }

  /**
   * Lifecycle hook: Before creating course
   */
  async beforeCreate(data) {
    // Validate department exists and is active
    const departmentExists = await this.model.validateDepartmentExists(data.department_id);
    if (!departmentExists) {
      throw new ValidationError('Department does not exist or is inactive');
    }

    // Check if course code already exists
    const existingCourse = await this.model.findByCode(data.code);
    if (existingCourse) {
      throw new ValidationError(`Course code '${data.code}' already exists`);
    }

    // Validate credit hours calculation
    if (data.credit_hours && data.theory_hours !== undefined && data.lab_hours !== undefined) {
      const isValid = this.model.validateCreditHours(
        data.credit_hours,
        data.theory_hours,
        data.lab_hours
      );
      if (!isValid) {
        const expected = data.theory_hours + (data.lab_hours / 2);
        throw new ValidationError(
          `Credit hours mismatch. Based on theory (${data.theory_hours}) and lab (${data.lab_hours}) hours, expected ${expected} credits`
        );
      }
    }

    // Ensure code is uppercase
    data.code = data.code.toUpperCase();

    return data;
  }

  /**
   * Lifecycle hook: Before updating course
   */
  async beforeUpdate(id, data) {
    // Validate department exists if being updated
    if (data.department_id) {
      const departmentExists = await this.model.validateDepartmentExists(data.department_id);
      if (!departmentExists) {
        throw new ValidationError('Department does not exist or is inactive');
      }
    }

    // Check if course code already exists (excluding current course)
    if (data.code) {
      const existingCourse = await this.model.findByCode(data.code);
      if (existingCourse && existingCourse.id !== id) {
        throw new ValidationError(`Course code '${data.code}' already exists`);
      }
      data.code = data.code.toUpperCase();
    }

    // Validate credit hours if any related field is being updated
    if (data.credit_hours || data.theory_hours !== undefined || data.lab_hours !== undefined) {
      const currentCourse = await this.model.findById(id);
      const creditHours = data.credit_hours ?? currentCourse.credit_hours;
      const theoryHours = data.theory_hours !== undefined ? data.theory_hours : currentCourse.theory_hours;
      const labHours = data.lab_hours !== undefined ? data.lab_hours : currentCourse.lab_hours;

      const isValid = this.model.validateCreditHours(creditHours, theoryHours, labHours);
      if (!isValid) {
        const expected = theoryHours + (labHours / 2);
        throw new ValidationError(
          `Credit hours mismatch. Based on theory (${theoryHours}) and lab (${labHours}) hours, expected ${expected} credits`
        );
      }
    }

    return data;
  }

  /**
   * Get course with department relationship
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Course with department
   */
  async getWithDepartment(id) {
    const course = await this.model.findByIdWithDepartment(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  }

  /**
   * Get course with all relationships
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Course with department, CLOs, objectives, offerings
   */
  async getWithRelations(id) {
    const course = await this.model.findByIdWithRelations(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  }

  /**
   * Get all active courses
   * @returns {Promise<Array>} Active courses
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Search courses
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching courses
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.model.search(searchTerm.trim());
  }

  /**
   * Get courses by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Courses in department
   */
  async getByDepartmentId(departmentId) {
    return await this.model.getByDepartmentId(departmentId);
  }

  /**
   * Get courses by credit hours
   * @param {number} creditHours - Credit hours
   * @returns {Promise<Array>} Courses with specified credit hours
   */
  async getByCreditHours(creditHours) {
    return await this.model.getByCreditHours(creditHours);
  }

  /**
   * Toggle course active status
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Updated course
   */
  async toggleStatus(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const newStatus = !course.is_active;
    await this.model.update(id, { is_active: newStatus });
    
    return await this.model.findById(id);
  }

  /**
   * Get course statistics
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await this.model.getStatistics(id);
  }

  /**
   * Get CLOs for a course
   * @param {number} id - Course ID
   * @returns {Promise<Array>} CLOs
   */
  async getCLOs(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await this.model.getCLOs(id);
  }

  /**
   * Get objectives for a course
   * @param {number} id - Course ID
   * @returns {Promise<Array>} Objectives
   */
  async getObjectives(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await this.model.getObjectives(id);
  }

  /**
   * Get offerings for a course
   * @param {number} id - Course ID
   * @returns {Promise<Array>} Offerings
   */
  async getOfferings(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await this.model.getOfferings(id);
  }

  /**
   * Get prerequisites for a course
   * @param {number} id - Course ID
   * @returns {Promise<Array>} Prerequisite courses
   */
  async getPrerequisites(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await this.model.getPrerequisites(id);
  }

  /**
   * Get dependent courses (courses that have this as prerequisite)
   * @param {number} id - Course ID
   * @returns {Promise<Array>} Dependent courses
   */
  async getDependentCourses(id) {
    const course = await this.model.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await this.model.getDependentCourses(id);
  }
}

module.exports = new CourseService();
