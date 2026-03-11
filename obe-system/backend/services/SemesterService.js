/**
 * Semester Service
 * Business logic for semester management
 */

const BaseService = require('./BaseService');
const Semester = require('../models/Semester');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

class SemesterService extends BaseService {
  constructor() {
    super(Semester);
  }

  /**
   * Joi validation schema for creating a semester
   */
  get createValidationSchema() {
    return Joi.object({
      academic_session_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Academic session ID must be a number',
          'number.positive': 'Academic session ID must be positive',
          'any.required': 'Academic session ID is required'
        }),
      name: Joi.string().trim().min(3).max(100).required()
        .messages({
          'string.empty': 'Semester name is required',
          'string.min': 'Semester name must be at least 3 characters',
          'string.max': 'Semester name must not exceed 100 characters',
          'any.required': 'Semester name is required'
        }),
      semester_type: Joi.string().valid('fall', 'spring', 'summer').required()
        .messages({
          'any.only': 'Semester type must be fall, spring, or summer',
          'any.required': 'Semester type is required'
        }),
      semester_number: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Semester number must be a number',
          'number.positive': 'Semester number must be positive',
          'any.required': 'Semester number is required'
        }),
      start_date: Joi.date().required()
        .messages({
          'date.base': 'Start date must be a valid date',
          'any.required': 'Start date is required'
        }),
      end_date: Joi.date().greater(Joi.ref('start_date')).required()
        .messages({
          'date.base': 'End date must be a valid date',
          'date.greater': 'End date must be after start date',
          'any.required': 'End date is required'
        }),
      registration_start: Joi.date().allow(null)
        .messages({
          'date.base': 'Registration start must be a valid date'
        }),
      registration_end: Joi.date().greater(Joi.ref('registration_start')).allow(null)
        .messages({
          'date.base': 'Registration end must be a valid date',
          'date.greater': 'Registration end must be after registration start'
        }),
      is_active: Joi.boolean().default(false)
    });
  }

  /**
   * Joi validation schema for updating a semester
   */
  get updateValidationSchema() {
    return Joi.object({
      academic_session_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Academic session ID must be a number',
          'number.positive': 'Academic session ID must be positive'
        }),
      name: Joi.string().trim().min(3).max(100)
        .messages({
          'string.min': 'Semester name must be at least 3 characters',
          'string.max': 'Semester name must not exceed 100 characters'
        }),
      semester_type: Joi.string().valid('fall', 'spring', 'summer')
        .messages({
          'any.only': 'Semester type must be fall, spring, or summer'
        }),
      semester_number: Joi.number().integer().positive()
        .messages({
          'number.base': 'Semester number must be a number',
          'number.positive': 'Semester number must be positive'
        }),
      start_date: Joi.date()
        .messages({
          'date.base': 'Start date must be a valid date'
        }),
      end_date: Joi.date()
        .messages({
          'date.base': 'End date must be a valid date'
        }),
      registration_start: Joi.date().allow(null)
        .messages({
          'date.base': 'Registration start must be a valid date'
        }),
      registration_end: Joi.date().allow(null)
        .messages({
          'date.base': 'Registration end must be a valid date'
        }),
      is_active: Joi.boolean()
    });
  }

  /**
   * Get all semesters with session info
   * @returns {Promise<Array>} List of semesters
   */
  async getAll() {
    return await this.model.getAllWithSession();
  }

  /**
   * Get active semesters
   * @returns {Promise<Array>} List of active semesters
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Get current active semester
   * @returns {Promise<Object|null>} Current semester
   */
  async getCurrentSemester() {
    return await this.model.getCurrentSemester();
  }

  /**
   * Get semester by ID with session details
   * @param {number} id - Semester ID
   * @returns {Promise<Object>} Semester with details
   */
  async getById(id) {
    const semester = await this.model.findByIdWithSession(id);
    if (!semester) {
      throw new NotFoundError('Semester not found');
    }
    return semester;
  }

  /**
   * Get semesters by academic session
   * @param {number} sessionId - Academic session ID
   * @returns {Promise<Array>} List of semesters
   */
  async getByAcademicSession(sessionId) {
    return await this.model.getByAcademicSession(sessionId);
  }

  /**
   * Get semesters by type
   * @param {string} type - Semester type
   * @returns {Promise<Array>} List of semesters
   */
  async getByType(type) {
    const validTypes = ['fall', 'spring', 'summer'];
    if (!validTypes.includes(type)) {
      throw new ValidationError(`Invalid semester type. Must be one of: ${validTypes.join(', ')}`);
    }
    return await this.model.getByType(type);
  }

  /**
   * Search semesters
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching semesters
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new ValidationError('Search term must be at least 2 characters');
    }
    return await this.model.search(searchTerm.trim());
  }

  /**
   * Set active semester
   * @param {number} id - Semester ID to activate
   * @returns {Promise<Object>} Updated semester
   */
  async setActive(id) {
    // Verify semester exists
    const semester = await this.model.findByIdWithSession(id);
    if (!semester) {
      throw new NotFoundError('Semester not found');
    }

    await this.model.setActive(id);
    return await this.model.findByIdWithSession(id);
  }
}

module.exports = SemesterService;
