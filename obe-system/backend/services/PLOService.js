const BaseService = require('./BaseService');
const ProgramLearningOutcome = require('../models/ProgramLearningOutcome');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

/**
 * PLOService - Business logic for Program Learning Outcomes
 * Extends BaseService for standard CRUD operations
 */
class PLOService extends BaseService {
  constructor() {
    super(ProgramLearningOutcome);
  }

  /**
   * Joi validation schema for creating PLO
   */
  getCreateValidationSchema() {
    return Joi.object({
      degree_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive',
          'any.required': 'Degree ID is required'
        }),
      plo_code: Joi.string().trim().uppercase().max(20).required()
        .pattern(/^PLO\d+$/i)
        .messages({
          'string.empty': 'PLO code is required',
          'string.pattern.base': 'PLO code must be in format PLO1, PLO2, etc.',
          'any.required': 'PLO code is required'
        }),
      description: Joi.string().trim().min(10).max(1000).required()
        .messages({
          'string.empty': 'Description is required',
          'string.min': 'Description must be at least 10 characters',
          'string.max': 'Description cannot exceed 1000 characters',
          'any.required': 'Description is required'
        }),
      plo_domain: Joi.string().trim().lowercase()
        .valid('cognitive', 'affective', 'psychomotor').required()
        .messages({
          'string.empty': 'PLO domain is required',
          'any.only': 'PLO domain must be cognitive, affective, or psychomotor',
          'any.required': 'PLO domain is required'
        })
    });
  }

  /**
   * Joi validation schema for updating PLO
   */
  getUpdateValidationSchema() {
    return Joi.object({
      degree_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive'
        }),
      plo_code: Joi.string().trim().uppercase().max(20)
        .pattern(/^PLO\d+$/i)
        .messages({
          'string.pattern.base': 'PLO code must be in format PLO1, PLO2, etc.'
        }),
      description: Joi.string().trim().min(10).max(1000)
        .messages({
          'string.min': 'Description must be at least 10 characters',
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      plo_domain: Joi.string().trim().lowercase()
        .valid('cognitive', 'affective', 'psychomotor')
        .messages({
          'any.only': 'PLO domain must be cognitive, affective, or psychomotor'
        })
    }).min(1);
  }

  /**
   * Hook: Before creating PLO
   * - Validate degree exists and is active
   * - Check for duplicate PLO code in same degree
   * - Auto-uppercase PLO code
   */
  async beforeCreate(data) {
    // Auto-uppercase PLO code
    if (data.plo_code) {
      data.plo_code = data.plo_code.toUpperCase();
    }

    // Validate degree exists and is active
    await this.model.validateDegreeExists(data.degree_id);

    // Validate domain
    this.model.validateDomain(data.plo_domain);

    // Check for duplicate PLO code in same degree
    const existing = await this.model.findByDegreeAndCode(data.degree_id, data.plo_code);
    if (existing) {
      throw new ValidationError(`PLO code '${data.plo_code}' already exists for this degree`);
    }

    return data;
  }

  /**
   * Hook: Before updating PLO
   * - Validate degree exists if changed
   * - Check for duplicate PLO code if changed
   * - Auto-uppercase PLO code
   */
  async beforeUpdate(id, data) {
    // Auto-uppercase PLO code if provided
    if (data.plo_code) {
      data.plo_code = data.plo_code.toUpperCase();
    }

    // Get existing PLO
    const existing = await this.model.findById(id);
    if (!existing) {
      throw new NotFoundError('PLO not found');
    }

    // Validate degree exists if changed
    if (data.degree_id && data.degree_id !== existing.degree_id) {
      await this.model.validateDegreeExists(data.degree_id);
    }

    // Validate domain if changed
    if (data.plo_domain) {
      this.model.validateDomain(data.plo_domain);
    }

    // Check for duplicate PLO code if changed
    if (data.plo_code && data.plo_code !== existing.plo_code) {
      const degreeId = data.degree_id || existing.degree_id;
      const duplicate = await this.model.findByDegreeAndCode(degreeId, data.plo_code);
      
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(`PLO code '${data.plo_code}' already exists for this degree`);
      }
    }

    return data;
  }

  /**
   * Get PLO with degree relationship
   * @param {number} id - PLO ID
   * @returns {Promise<Object>} PLO with degree info
   */
  async getWithDegree(id) {
    const plo = await this.model.findByIdWithDegree(id);
    if (!plo) {
      throw new NotFoundError('PLO not found');
    }
    return plo;
  }

  /**
   * Get PLO with all relationships
   * @param {number} id - PLO ID
   * @returns {Promise<Object>} PLO with all relationships
   */
  async getWithRelations(id) {
    const plo = await this.model.findByIdWithRelations(id);
    if (!plo) {
      throw new NotFoundError('PLO not found');
    }
    return plo;
  }

  /**
   * Get all PLOs for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of PLOs
   */
  async getByDegreeId(degreeId) {
    return await this.model.getByDegreeId(degreeId);
  }

  /**
   * Get PLOs by domain type
   * @param {string} domain - Domain type
   * @returns {Promise<Array>} Array of PLOs
   */
  async getByDomain(domain) {
    // Validate domain
    this.model.validateDomain(domain);
    return await this.model.getByDomain(domain);
  }

  /**
   * Search PLOs by term
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching PLOs
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term is required');
    }
    return await this.model.search(searchTerm);
  }

  /**
   * Get CLO mappings for a PLO
   * @param {number} id - PLO ID
   * @returns {Promise<Array>} Array of CLO mappings
   */
  async getCLOMappings(id) {
    const plo = await this.model.findById(id);
    if (!plo) {
      throw new NotFoundError('PLO not found');
    }
    return await this.model.getCLOMappings(id);
  }

  /**
   * Get PEO mappings for a PLO
   * @param {number} id - PLO ID
   * @returns {Promise<Array>} Array of PEO mappings
   */
  async getPEOMappings(id) {
    const plo = await this.model.findById(id);
    if (!plo) {
      throw new NotFoundError('PLO not found');
    }
    return await this.model.getPEOMappings(id);
  }

  /**
   * Calculate attainment for a PLO
   * @param {number} id - PLO ID
   * @param {string} batchYear - Batch year
   * @returns {Promise<Object>} Attainment statistics
   */
  async calculateAttainment(id, batchYear) {
    const plo = await this.model.findById(id);
    if (!plo) {
      throw new NotFoundError('PLO not found');
    }

    if (!batchYear || !/^\d{4}$/.test(batchYear)) {
      throw new ValidationError('Valid batch year is required (format: YYYY)');
    }

    return await this.model.calculateAttainment(id, batchYear);
  }

  /**
   * Get statistics for a PLO
   * @param {number} id - PLO ID
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(id) {
    const plo = await this.model.findById(id);
    if (!plo) {
      throw new NotFoundError('PLO not found');
    }
    return await this.model.getStatistics(id);
  }

  /**
   * Get next available PLO code for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<string>} Next PLO code
   */
  async getNextPLOCode(degreeId) {
    // Validate degree exists
    await this.model.validateDegreeExists(degreeId);
    return await this.model.getNextPLOCode(degreeId);
  }

  /**
   * Bulk create PLOs for a degree
   * @param {number} degreeId - Degree ID
   * @param {Array} plos - Array of PLO data objects
   * @returns {Promise<Array>} Created PLOs
   */
  async bulkCreateForDegree(degreeId, plos) {
    // Validate degree exists
    await this.model.validateDegreeExists(degreeId);

    if (!Array.isArray(plos) || plos.length === 0) {
      throw new ValidationError('PLOs array is required and must not be empty');
    }

    const createdPLOs = [];

    for (const ploData of plos) {
      const data = {
        ...ploData,
        degree_id: degreeId
      };

      // If PLO code not provided, auto-generate
      if (!data.plo_code) {
        data.plo_code = await this.getNextPLOCode(degreeId);
      }

      const created = await this.create(data);
      createdPLOs.push(created);
    }

    return createdPLOs;
  }
}

module.exports = new PLOService();
