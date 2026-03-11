const BaseService = require('./BaseService');
const ProgramEducationalObjective = require('../models/ProgramEducationalObjective');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

/**
 * PEOService - Business logic for Program Educational Objectives
 * Extends BaseService for standard CRUD operations
 */
class PEOService extends BaseService {
  constructor() {
    super(ProgramEducationalObjective);
  }

  /**
   * Joi validation schema for creating PEO
   */
  getCreateValidationSchema() {
    return Joi.object({
      degree_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive',
          'any.required': 'Degree ID is required'
        }),
      peo_no: Joi.string().trim().uppercase().max(20).required()
        .pattern(/^PEO\d+$/i)
        .messages({
          'string.empty': 'PEO number is required',
          'string.pattern.base': 'PEO number must be in format PEO1, PEO2, etc.',
          'any.required': 'PEO number is required'
        }),
      peo_description: Joi.string().trim().min(10).max(1000).required()
        .messages({
          'string.empty': 'PEO description is required',
          'string.min': 'PEO description must be at least 10 characters',
          'string.max': 'PEO description cannot exceed 1000 characters',
          'any.required': 'PEO description is required'
        }),
      display_order: Joi.number().integer().positive().optional()
        .messages({
          'number.base': 'Display order must be a number',
          'number.positive': 'Display order must be positive'
        }),
      is_active: Joi.boolean().optional()
        .messages({
          'boolean.base': 'Is active must be a boolean'
        })
    });
  }

  /**
   * Joi validation schema for updating PEO
   */
  getUpdateValidationSchema() {
    return Joi.object({
      degree_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive'
        }),
      peo_no: Joi.string().trim().uppercase().max(20)
        .pattern(/^PEO\d+$/i)
        .messages({
          'string.pattern.base': 'PEO number must be in format PEO1, PEO2, etc.'
        }),
      peo_description: Joi.string().trim().min(10).max(1000)
        .messages({
          'string.min': 'PEO description must be at least 10 characters',
          'string.max': 'PEO description cannot exceed 1000 characters'
        }),
      display_order: Joi.number().integer().positive()
        .messages({
          'number.base': 'Display order must be a number',
          'number.positive': 'Display order must be positive'
        }),
      is_active: Joi.boolean()
        .messages({
          'boolean.base': 'Is active must be a boolean'
        })
    }).min(1);
  }

  /**
   * Joi validation schema for bulk create PEOs
   */
  getBulkCreateValidationSchema() {
    return Joi.object({
      degree_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive',
          'any.required': 'Degree ID is required'
        }),
      peos: Joi.array().items(
        Joi.object({
          peo_no: Joi.string().trim().uppercase().max(20).required()
            .pattern(/^PEO\d+$/i)
            .messages({
              'string.empty': 'PEO number is required',
              'string.pattern.base': 'PEO number must be in format PEO1, PEO2, etc.',
              'any.required': 'PEO number is required'
            }),
          peo_description: Joi.string().trim().min(10).max(1000).required()
            .messages({
              'string.empty': 'PEO description is required',
              'string.min': 'PEO description must be at least 10 characters',
              'string.max': 'PEO description cannot exceed 1000 characters',
              'any.required': 'PEO description is required'
            }),
          display_order: Joi.number().integer().positive().optional(),
          is_active: Joi.boolean().optional()
        })
      ).min(1).required()
        .messages({
          'array.min': 'At least one PEO is required',
          'any.required': 'PEOs array is required'
        })
    });
  }

  /**
   * Hook: Before creating PEO
   * - Validate degree exists and is active
   * - Check for duplicate PEO code in same degree
   * - Auto-uppercase PEO code
   */
  async beforeCreate(data) {
    // Auto-uppercase PEO number
    if (data.peo_no) {
      data.peo_no = data.peo_no.toUpperCase();
    }

    // Validate degree exists and is active
    await this.model.validateDegreeExists(data.degree_id);

    // Check for duplicate PEO code in same degree
    const existing = await this.model.findByDegreeAndCode(data.degree_id, data.peo_no);
    if (existing) {
      throw new ValidationError(`PEO number '${data.peo_no}' already exists for this degree`);
    }

    return data;
  }

  /**
   * Hook: Before updating PEO
   * - Validate degree exists if degree_id is being updated
   * - Check for duplicate PEO code if peo_no is being updated
   * - Auto-uppercase PEO code
   */
  async beforeUpdate(id, data) {
    // Auto-uppercase PEO number
    if (data.peo_no) {
      data.peo_no = data.peo_no.toUpperCase();
    }

    // Get existing PEO
    const existingPeo = await this.model.findById(id);
    if (!existingPeo) {
      throw new NotFoundError('PEO not found');
    }

    // Validate degree exists if degree_id is being updated
    if (data.degree_id && data.degree_id !== existingPeo.degree_id) {
      await this.model.validateDegreeExists(data.degree_id);
    }

    // Check for duplicate PEO code if updating code or degree
    if (data.peo_no || data.degree_id) {
      const checkDegreeId = data.degree_id || existingPeo.degree_id;
      const checkPeoNo = data.peo_no || existingPeo.peo_no;
      
      const duplicate = await this.model.findByDegreeAndCode(checkDegreeId, checkPeoNo);
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(`PEO number '${checkPeoNo}' already exists for this degree`);
      }
    }

    return data;
  }

  /**
   * Get PEO with degree information
   * @param {number} id - PEO ID
   * @returns {Promise<Object>}
   */
  async getWithDegree(id) {
    const peo = await this.model.findById(id);
    if (!peo) {
      throw new NotFoundError('PEO not found');
    }

    const degree = await this.model.getDegree(id);
    
    return {
      ...peo,
      degree
    };
  }

  /**
   * Get PEO with all relationships (degree and PLO mappings)
   * @param {number} id - PEO ID
   * @returns {Promise<Object>}
   */
  async getWithRelations(id) {
    const peo = await this.model.getWithRelations(id);
    if (!peo) {
      throw new NotFoundError('PEO not found');
    }

    return peo;
  }

  /**
   * Get PLO mappings for a PEO
   * @param {number} id - PEO ID
   * @returns {Promise<Array>}
   */
  async getPLOMappings(id) {
    // Verify PEO exists
    const peo = await this.model.findById(id);
    if (!peo) {
      throw new NotFoundError('PEO not found');
    }

    return await this.model.getPLOMappings(id);
  }

  /**
   * Map PEO to PLO
   * @param {number} peoId - PEO ID
   * @param {number} ploId - PLO ID
   * @param {string} correlationLevel - Correlation strength: 'high', 'medium', 'low'
   * @returns {Promise<Object>}
   */
  async mapToPLO(peoId, ploId, correlationLevel = 'medium') {
    // Verify PEO exists
    const peo = await this.model.findById(peoId);
    if (!peo) {
      throw new NotFoundError('PEO not found');
    }

    try {
      return await this.model.mapToPLO(peoId, ploId, correlationLevel);
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  /**
   * Unmap PEO from PLO
   * @param {number} peoId - PEO ID
   * @param {number} ploId - PLO ID
   * @returns {Promise<boolean>}
   */
  async unmapFromPLO(peoId, ploId) {
    // Verify PEO exists
    const peo = await this.model.findById(peoId);
    if (!peo) {
      throw new NotFoundError('PEO not found');
    }

    const result = await this.model.unmapFromPLO(peoId, ploId);
    if (!result) {
      throw new NotFoundError('Mapping not found');
    }

    return result;
  }

  /**
   * Get all PEOs for a specific degree
   * @param {number} degreeId - Degree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getByDegree(degreeId, options = {}) {
    return await this.model.getByDegree(degreeId, options);
  }

  /**
   * Get next available PEO code for a degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<string>}
   */
  async getNextCode(degreeId) {
    // Validate degree exists
    await this.model.validateDegreeExists(degreeId);
    
    return await this.model.getNextCode(degreeId);
  }

  /**
   * Bulk create PEOs for a degree
   * @param {Object} data - {degree_id, peos: [{peo_no, peo_description, display_order, is_active}]}
   * @returns {Promise<Array>}
   */
  async bulkCreate(data) {
    // Validate input
    const schema = this.getBulkCreateValidationSchema();
    const { error, value } = schema.validate(data);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { degree_id, peos } = value;

    // Validate degree exists
    await this.model.validateDegreeExists(degree_id);

    // Auto-uppercase PEO codes and check for duplicates
    const processedPeos = [];
    const seenCodes = new Set();

    for (const peo of peos) {
      const peoNo = peo.peo_no.toUpperCase();
      
      // Check for duplicates within the batch
      if (seenCodes.has(peoNo)) {
        throw new ValidationError(`Duplicate PEO number '${peoNo}' in batch`);
      }
      seenCodes.add(peoNo);

      // Check for existing PEO code in database
      const existing = await this.model.findByDegreeAndCode(degree_id, peoNo);
      if (existing) {
        throw new ValidationError(`PEO number '${peoNo}' already exists for this degree`);
      }

      processedPeos.push({
        peo_no: peoNo,
        peo_description: peo.peo_description,
        display_order: peo.display_order,
        is_active: peo.is_active
      });
    }

    return await this.model.bulkCreate(degree_id, processedPeos);
  }

  /**
   * Search PEOs by code or description
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async search(searchTerm, options = {}) {
    return await this.model.search(searchTerm, options);
  }
}

module.exports = new PEOService();
