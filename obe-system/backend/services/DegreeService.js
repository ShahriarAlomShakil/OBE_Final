const BaseService = require('./BaseService');
const Degree = require('../models/Degree');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

class DegreeService extends BaseService {
  constructor() {
    super(Degree);
  }

  /**
   * Joi validation schema for creating degree
   */
  getCreateValidationSchema() {
    return Joi.object({
      department_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Department ID must be a number',
          'number.positive': 'Department ID must be positive',
          'any.required': 'Department ID is required'
        }),
      name: Joi.string().min(3).max(200).required()
        .messages({
          'string.min': 'Degree name must be at least 3 characters',
          'string.max': 'Degree name cannot exceed 200 characters',
          'any.required': 'Degree name is required'
        }),
      short_name: Joi.string().min(2).max(50).required()
        .messages({
          'string.min': 'Short name must be at least 2 characters',
          'string.max': 'Short name cannot exceed 50 characters',
          'any.required': 'Short name is required'
        }),
      degree_type: Joi.string().valid('bachelors', 'masters', 'phd', 'diploma', 'associate').required()
        .messages({
          'any.only': 'Degree type must be one of: bachelors, masters, phd, diploma, associate',
          'any.required': 'Degree type is required'
        }),
      total_credits: Joi.number().positive().required()
        .messages({
          'number.base': 'Total credits must be a number',
          'number.positive': 'Total credits must be positive',
          'any.required': 'Total credits is required'
        }),
      duration_years: Joi.number().integer().min(1).max(10).required()
        .messages({
          'number.base': 'Duration must be a number',
          'number.integer': 'Duration must be an integer',
          'number.min': 'Duration must be at least 1 year',
          'number.max': 'Duration cannot exceed 10 years',
          'any.required': 'Duration is required'
        }),
      description: Joi.string().max(1000).allow(null, '')
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      is_active: Joi.boolean().default(true)
    });
  }

  /**
   * Joi validation schema for updating degree
   */
  getUpdateValidationSchema() {
    return Joi.object({
      department_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Department ID must be a number',
          'number.positive': 'Department ID must be positive'
        }),
      name: Joi.string().min(3).max(200)
        .messages({
          'string.min': 'Degree name must be at least 3 characters',
          'string.max': 'Degree name cannot exceed 200 characters'
        }),
      short_name: Joi.string().min(2).max(50)
        .messages({
          'string.min': 'Short name must be at least 2 characters',
          'string.max': 'Short name cannot exceed 50 characters'
        }),
      degree_type: Joi.string().valid('bachelors', 'masters', 'phd', 'diploma', 'associate')
        .messages({
          'any.only': 'Degree type must be one of: bachelors, masters, phd, diploma, associate'
        }),
      total_credits: Joi.number().positive()
        .messages({
          'number.base': 'Total credits must be a number',
          'number.positive': 'Total credits must be positive'
        }),
      duration_years: Joi.number().integer().min(1).max(10)
        .messages({
          'number.base': 'Duration must be a number',
          'number.integer': 'Duration must be an integer',
          'number.min': 'Duration must be at least 1 year',
          'number.max': 'Duration cannot exceed 10 years'
        }),
      description: Joi.string().max(1000).allow(null, '')
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      is_active: Joi.boolean()
    });
  }

  /**
   * Lifecycle hook: Before creating a degree
   */
  async beforeCreate(data) {
    // Validate department exists
    const departmentExists = await this.model.validateDepartmentExists(data.department_id);
    if (!departmentExists) {
      throw new ValidationError('Department not found or is not active');
    }

    // Check if short name already exists
    const existingByShortName = await this.model.findByShortName(data.short_name);
    if (existingByShortName) {
      throw new ValidationError('Degree with this short name already exists');
    }

    // Validate duration
    if (!this.model.validateDuration(data.duration_years)) {
      throw new ValidationError('Duration must be between 1 and 10 years');
    }

    // Validate total credits
    if (!this.model.validateTotalCredits(data.total_credits)) {
      throw new ValidationError('Total credits must be positive');
    }

    return data;
  }

  /**
   * Lifecycle hook: Before updating a degree
   */
  async beforeUpdate(id, data) {
    // Validate department exists if being updated
    if (data.department_id) {
      const departmentExists = await this.model.validateDepartmentExists(data.department_id);
      if (!departmentExists) {
        throw new ValidationError('Department not found or is not active');
      }
    }

    // Check if short name already exists (excluding current record)
    if (data.short_name) {
      const existingByShortName = await this.model.findByShortName(data.short_name);
      if (existingByShortName && existingByShortName.id !== id) {
        throw new ValidationError('Degree with this short name already exists');
      }
    }

    // Validate duration if being updated
    if (data.duration_years && !this.model.validateDuration(data.duration_years)) {
      throw new ValidationError('Duration must be between 1 and 10 years');
    }

    // Validate total credits if being updated
    if (data.total_credits && !this.model.validateTotalCredits(data.total_credits)) {
      throw new ValidationError('Total credits must be positive');
    }

    return data;
  }

  /**
   * Get degree with department relationship
   * @param {number} id - Degree ID
   * @returns {Promise<Object>} Degree with department
   */
  async getWithDepartment(id) {
    const degree = await this.model.findByIdWithDepartment(id);
    if (!degree) {
      throw new NotFoundError('Degree not found');
    }
    return degree;
  }

  /**
   * Get degree with all relationships
   * @param {number} id - Degree ID
   * @returns {Promise<Object>} Degree with department, PLOs, PEOs, and students
   */
  async getWithRelations(id) {
    const degree = await this.model.findByIdWithRelations(id);
    if (!degree) {
      throw new NotFoundError('Degree not found');
    }
    return degree;
  }

  /**
   * Get all active degrees
   * @returns {Promise<Array>} Array of active degrees
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Search degrees by term
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching degrees
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.model.search(searchTerm);
  }

  /**
   * Get degrees by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Array of degrees
   */
  async getByDepartmentId(departmentId) {
    return await this.model.getByDepartmentId(departmentId);
  }

  /**
   * Get degrees by type
   * @param {string} degreeType - Degree type
   * @returns {Promise<Array>} Array of degrees
   */
  async getByType(degreeType) {
    const validTypes = ['bachelors', 'masters', 'phd', 'diploma', 'associate'];
    if (!validTypes.includes(degreeType)) {
      throw new ValidationError(`Invalid degree type. Must be one of: ${validTypes.join(', ')}`);
    }
    return await this.model.getByType(degreeType);
  }

  /**
   * Toggle degree active status
   * @param {number} id - Degree ID
   * @returns {Promise<Object>} Updated degree
   */
  async toggleStatus(id) {
    const degree = await this.getById(id);
    const newStatus = !degree.is_active;
    return await this.update(id, { is_active: newStatus });
  }

  /**
   * Get degree statistics
   * @param {number} id - Degree ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(id) {
    // Check if degree exists
    await this.getById(id);

    const [ploCount, peoCount, studentCount] = await Promise.all([
      this.model.countPLOs(id),
      this.model.countPEOs(id),
      this.model.countStudents(id)
    ]);

    return {
      plo_count: ploCount,
      peo_count: peoCount,
      student_count: studentCount
    };
  }

  /**
   * Get PLOs for a degree
   * @param {number} id - Degree ID
   * @returns {Promise<Array>} Array of PLOs
   */
  async getPLOs(id) {
    // Check if degree exists
    await this.getById(id);
    return await this.model.getPLOs(id);
  }

  /**
   * Get PEOs for a degree
   * @param {number} id - Degree ID
   * @returns {Promise<Array>} Array of PEOs
   */
  async getPEOs(id) {
    // Check if degree exists
    await this.getById(id);
    return await this.model.getPEOs(id);
  }

  /**
   * Get students for a degree
   * @param {number} id - Degree ID
   * @returns {Promise<Array>} Array of students
   */
  async getStudents(id) {
    // Check if degree exists
    await this.getById(id);
    return await this.model.getStudents(id);
  }
}

module.exports = DegreeService;
