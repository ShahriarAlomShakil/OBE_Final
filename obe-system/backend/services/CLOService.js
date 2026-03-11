const BaseService = require('./BaseService');
const CourseLearningOutcome = require('../models/CourseLearningOutcome');
const Joi = require('joi');
const { ValidationError } = require('../utils/AppError');

/**
 * CLO Service
 * Business logic for Course Learning Outcomes
 */
class CLOService extends BaseService {
  constructor() {
    super(CourseLearningOutcome);
  }

  /**
   * Validation schema for creating a CLO
   */
  getCreateSchema() {
    return Joi.object({
      course_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Course ID must be a number',
          'number.positive': 'Course ID must be positive',
          'any.required': 'Course ID is required'
        }),
      clo_code: Joi.string().max(20).required()
        .pattern(/^CLO\d+$/)
        .messages({
          'string.pattern.base': 'CLO code must be in format CLO1, CLO2, etc.',
          'any.required': 'CLO code is required'
        }),
      description: Joi.string().min(10).max(1000).required()
        .messages({
          'string.min': 'Description must be at least 10 characters',
          'string.max': 'Description must not exceed 1000 characters',
          'any.required': 'Description is required'
        }),
      bloom_level_id: Joi.number().integer().min(1).max(6).required()
        .messages({
          'number.base': 'Bloom level ID must be a number',
          'number.min': 'Bloom level ID must be between 1 and 6',
          'number.max': 'Bloom level ID must be between 1 and 6',
          'any.required': 'Bloom level ID is required'
        })
    });
  }

  /**
   * Validation schema for updating a CLO
   */
  getUpdateSchema() {
    return Joi.object({
      clo_code: Joi.string().max(20)
        .pattern(/^CLO\d+$/)
        .messages({
          'string.pattern.base': 'CLO code must be in format CLO1, CLO2, etc.'
        }),
      description: Joi.string().min(10).max(1000)
        .messages({
          'string.min': 'Description must be at least 10 characters',
          'string.max': 'Description must not exceed 1000 characters'
        }),
      bloom_level_id: Joi.number().integer().min(1).max(6)
        .messages({
          'number.base': 'Bloom level ID must be a number',
          'number.min': 'Bloom level ID must be between 1 and 6',
          'number.max': 'Bloom level ID must be between 1 and 6'
        })
    }).min(1);
  }

  /**
   * Lifecycle hook: Before creating a CLO
   */
  async beforeCreate(data) {
    // Validate course exists
    await this.model.validateCourseExists(data.course_id);

    // Validate Bloom level exists
    await this.model.validateBloomLevelExists(data.bloom_level_id);

    // Check if CLO code is unique for this course
    const existing = await this.model.findByCourseAndCode(data.course_id, data.clo_code);
    if (existing) {
      throw new ValidationError(`CLO code ${data.clo_code} already exists for this course`);
    }

    // Uppercase CLO code for consistency
    data.clo_code = data.clo_code.toUpperCase();

    return data;
  }

  /**
   * Lifecycle hook: Before updating a CLO
   */
  async beforeUpdate(id, data) {
    // Validate Bloom level if provided
    if (data.bloom_level_id) {
      await this.model.validateBloomLevelExists(data.bloom_level_id);
    }

    // Check if CLO code is unique (if being updated)
    if (data.clo_code) {
      const clo = await this.model.findById(id);
      if (!clo) {
        throw new ValidationError('CLO not found');
      }

      const existing = await this.model.findByCourseAndCode(clo.course_id, data.clo_code);
      if (existing && existing.id !== id) {
        throw new ValidationError(`CLO code ${data.clo_code} already exists for this course`);
      }

      // Uppercase CLO code
      data.clo_code = data.clo_code.toUpperCase();
    }

    return data;
  }

  /**
   * Get CLO with all relationships (course, bloom level)
   */
  async getWithRelations(id) {
    return await this.model.findByIdWithRelations(id);
  }

  /**
   * Get CLO with course information
   */
  async getWithCourse(id) {
    const clo = await this.model.findById(id);
    if (!clo) {
      return null;
    }
    clo.course = await this.model.getCourse(id);
    return clo;
  }

  /**
   * Get CLO with Bloom level information
   */
  async getWithBloomLevel(id) {
    const clo = await this.model.findById(id);
    if (!clo) {
      return null;
    }
    clo.bloomLevel = await this.model.getBloomLevel(id);
    return clo;
  }

  /**
   * Get all CLOs for a course
   */
  async getByCourseId(courseId) {
    return await this.model.getByCourseId(courseId);
  }

  /**
   * Get all CLOs by Bloom level
   */
  async getByBloomLevel(bloomLevelId) {
    return await this.model.getByBloomLevel(bloomLevelId);
  }

  /**
   * Search CLOs by description or code
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.model.search(searchTerm);
  }

  /**
   * Get PLO mappings for a CLO
   */
  async getPLOMappings(id) {
    const clo = await this.model.findById(id);
    if (!clo) {
      throw new ValidationError('CLO not found');
    }
    return await this.model.getPLOMappings(id);
  }

  /**
   * Get assessments that measure this CLO
   */
  async getAssessments(id) {
    const clo = await this.model.findById(id);
    if (!clo) {
      throw new ValidationError('CLO not found');
    }
    return await this.model.getAssessments(id);
  }

  /**
   * Calculate CLO attainment for a course offering
   */
  async calculateAttainment(id, courseOfferingId) {
    const clo = await this.model.findById(id);
    if (!clo) {
      throw new ValidationError('CLO not found');
    }

    if (!courseOfferingId) {
      throw new ValidationError('Course offering ID is required');
    }

    return await this.model.calculateAttainment(id, courseOfferingId);
  }

  /**
   * Get statistics for a CLO
   */
  async getStatistics(id) {
    const clo = await this.model.findById(id);
    if (!clo) {
      throw new ValidationError('CLO not found');
    }
    return await this.model.getStatistics(id);
  }

  /**
   * Get next available CLO code for a course
   */
  async getNextCLOCode(courseId) {
    // Validate course exists
    await this.model.validateCourseExists(courseId);
    return await this.model.getNextCLOCode(courseId);
  }

  /**
   * Bulk create CLOs for a course
   */
  async bulkCreateForCourse(courseId, cloDescriptions) {
    // Validate course exists
    await this.model.validateCourseExists(courseId);

    if (!Array.isArray(cloDescriptions) || cloDescriptions.length === 0) {
      throw new ValidationError('CLO descriptions array is required');
    }

    const results = [];
    for (let i = 0; i < cloDescriptions.length; i++) {
      const { description, bloom_level_id } = cloDescriptions[i];
      
      const cloCode = `CLO${i + 1}`;
      const cloData = {
        course_id: courseId,
        clo_code: cloCode,
        description,
        bloom_level_id
      };

      const clo = await this.create(cloData);
      results.push(clo);
    }

    return results;
  }

  /**
   * Reorder CLOs for a course
   */
  async reorderCLOs(courseId, cloOrderMap) {
    // cloOrderMap: { cloId: newCode } e.g., { 1: 'CLO1', 2: 'CLO2' }
    await this.model.validateCourseExists(courseId);

    const updates = [];
    for (const [cloId, newCode] of Object.entries(cloOrderMap)) {
      updates.push(
        this.update(parseInt(cloId), { clo_code: newCode })
      );
    }

    return await Promise.all(updates);
  }
}

module.exports = new CLOService();
