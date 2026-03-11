const BaseService = require('./BaseService');
const Faculty = require('../models/Faculty');
const Joi = require('joi');
const { ValidationError } = require('../utils/AppError');

/**
 * Faculty Service
 * Handles business logic for faculty management
 * 
 * @extends BaseService
 */
class FacultyService extends BaseService {
  constructor() {
    super(Faculty);
  }

  /**
   * Validation schema for creating a faculty
   */
  get createSchema() {
    return Joi.object({
      name: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
          'string.empty': 'Faculty name is required',
          'string.min': 'Faculty name must be at least 3 characters long',
          'string.max': 'Faculty name cannot exceed 255 characters'
        }),
      
      short_name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.empty': 'Short name is required',
          'string.min': 'Short name must be at least 2 characters long',
          'string.max': 'Short name cannot exceed 50 characters'
        }),
      
      description: Joi.string()
        .max(1000)
        .allow(null, '')
        .optional()
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      
      established_date: Joi.date()
        .max('now')
        .allow(null)
        .optional()
        .messages({
          'date.max': 'Established date cannot be in the future'
        }),
      
      is_active: Joi.boolean()
        .default(true)
        .optional()
    });
  }

  /**
   * Validation schema for updating a faculty
   */
  get updateSchema() {
    return Joi.object({
      name: Joi.string()
        .min(3)
        .max(255)
        .optional()
        .messages({
          'string.min': 'Faculty name must be at least 3 characters long',
          'string.max': 'Faculty name cannot exceed 255 characters'
        }),
      
      short_name: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'Short name must be at least 2 characters long',
          'string.max': 'Short name cannot exceed 50 characters'
        }),
      
      description: Joi.string()
        .max(1000)
        .allow(null, '')
        .optional()
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      
      established_date: Joi.date()
        .max('now')
        .allow(null)
        .optional()
        .messages({
          'date.max': 'Established date cannot be in the future'
        }),
      
      is_active: Joi.boolean()
        .optional()
    });
  }

  /**
   * Hook: Before creating a faculty
   * Validates unique short_name
   */
  async beforeCreate(data) {
    // Check if short_name already exists
    const existing = await this.model.findByShortName(data.short_name);
    if (existing) {
      throw new ValidationError(`Faculty with short name '${data.short_name}' already exists`);
    }

    // Validate established date
    if (data.established_date && !this.model.validateEstablishedDate(data.established_date)) {
      throw new ValidationError('Established date cannot be in the future');
    }

    return data;
  }

  /**
   * Hook: Before updating a faculty
   * Validates unique short_name if being changed
   */
  async beforeUpdate(id, data) {
    // If short_name is being updated, check uniqueness
    if (data.short_name) {
      const existing = await this.model.findByShortName(data.short_name);
      if (existing && existing.id !== id) {
        throw new ValidationError(`Faculty with short name '${data.short_name}' already exists`);
      }
    }

    // Validate established date if provided
    if (data.established_date && !this.model.validateEstablishedDate(data.established_date)) {
      throw new ValidationError('Established date cannot be in the future');
    }

    return data;
  }

  /**
   * Get faculty with its departments
   * 
   * @param {number} id - Faculty ID
   * @returns {Promise<Object>} Faculty with departments
   */
  async getWithDepartments(id) {
    const faculty = await this.model.findByIdWithDepartments(id);
    if (!faculty) {
      throw new this.NotFoundError(`Faculty with ID ${id} not found`);
    }
    return faculty;
  }

  /**
   * Get all active faculties
   * 
   * @returns {Promise<Array>} Array of active faculties
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Search faculties by name or short name
   * 
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching faculties
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.model.search(searchTerm);
  }

  /**
   * Toggle faculty active status
   * 
   * @param {number} id - Faculty ID
   * @returns {Promise<Object>} Updated faculty
   */
  async toggleStatus(id) {
    const faculty = await this.getById(id);
    const newStatus = !this.model.isActive(faculty);
    return await this.update(id, { is_active: newStatus });
  }

  /**
   * Get faculty statistics
   * 
   * @param {number} id - Faculty ID
   * @returns {Promise<Object>} Faculty statistics
   */
  async getStatistics(id) {
    const faculty = await this.getById(id);
    
    const departmentCount = await this.model.countDepartments(id);
    
    return {
      faculty: faculty,
      statistics: {
        total_departments: departmentCount,
        is_active: this.model.isActive(faculty)
      }
    };
  }
}

module.exports = FacultyService;
