/**
 * BaseService - Abstract base class for all service layers
 * Provides business logic layer with validation, transaction support,
 * lifecycle hooks, and standardized CRUD operations
 * 
 * Services act as the business logic layer between Controllers and Repositories/Models.
 * They handle validation, business rules, transactions, and complex operations.
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const Joi = require('joi');
const db = require('../config/database');
const {
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError
} = require('../utils/AppError');

class BaseService {
  /**
   * Constructor
   * @param {BaseModel|BaseRepository} modelOrRepository - Model or Repository instance
   * @param {string} resourceName - Human-readable resource name for error messages
   */
  constructor(modelOrRepository, resourceName = 'Resource') {
    if (this.constructor === BaseService) {
      throw new Error('BaseService is an abstract class and cannot be instantiated directly');
    }

    // Support both Model and Repository pattern
    this.repository = modelOrRepository;
    this.model = modelOrRepository.model || modelOrRepository;
    this.resourceName = resourceName;

    // Validation schemas - to be defined in child classes
    this.schemas = {
      create: null,
      update: null,
      filters: null
    };

    // Transaction support
    this.connection = null;
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================
  // Override these methods in child classes for custom logic

  /**
   * Hook: Before creating a record
   * @param {Object} data - Data to be created
   * @returns {Promise<Object>} - Modified data
   */
  async beforeCreate(data) {
    return data;
  }

  /**
   * Hook: After creating a record
   * @param {Object} data - Original data
   * @param {Object} result - Created record
   * @returns {Promise<Object>} - Modified result
   */
  async afterCreate(data, result) {
    return result;
  }

  /**
   * Hook: Before updating a record
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to be updated
   * @returns {Promise<Object>} - Modified data
   */
  async beforeUpdate(id, data) {
    return data;
  }

  /**
   * Hook: After updating a record
   * @param {number|string} id - Record ID
   * @param {Object} data - Original data
   * @param {Object} result - Updated record
   * @returns {Promise<Object>} - Modified result
   */
  async afterUpdate(id, data, result) {
    return result;
  }

  /**
   * Hook: Before deleting a record
   * @param {number|string} id - Record ID
   * @returns {Promise<void>}
   */
  async beforeDelete(id) {
    // Override in child classes
  }

  /**
   * Hook: After deleting a record
   * @param {number|string} id - Record ID
   * @returns {Promise<void>}
   */
  async afterDelete(id) {
    // Override in child classes
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate data against a Joi schema
   * @param {Object} data - Data to validate
   * @param {Joi.Schema} schema - Joi validation schema
   * @param {Object} options - Joi validation options
   * @returns {Promise<Object>} - Validated and sanitized data
   * @throws {ValidationError}
   */
  async validate(data, schema, options = {}) {
    if (!schema) {
      return data;
    }

    const defaultOptions = {
      abortEarly: false, // Collect all errors, not just the first one
      stripUnknown: true, // Remove unknown keys
      ...options
    };

    try {
      const { error, value } = schema.validate(data, defaultOptions);

      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        throw new ValidationError('Validation failed', details);
      }

      return value;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Validation error occurred', { error: error.message });
    }
  }

  /**
   * Validate create data
   * @param {Object} data - Data to validate
   * @returns {Promise<Object>}
   */
  async validateCreate(data) {
    return this.validate(data, this.schemas.create);
  }

  /**
   * Validate update data
   * @param {Object} data - Data to validate
   * @returns {Promise<Object>}
   */
  async validateUpdate(data) {
    return this.validate(data, this.schemas.update);
  }

  /**
   * Validate filters/query parameters
   * @param {Object} filters - Filters to validate
   * @returns {Promise<Object>}
   */
  async validateFilters(filters) {
    return this.validate(filters, this.schemas.filters);
  }

  // ============================================================================
  // TRANSACTION MANAGEMENT
  // ============================================================================

  /**
   * Begin a database transaction
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    if (this.connection) {
      throw new DatabaseError('Transaction already in progress');
    }

    this.connection = await db.getConnection();
    await this.connection.beginTransaction();
  }

  /**
   * Commit the current transaction
   * @returns {Promise<void>}
   */
  async commit() {
    if (!this.connection) {
      throw new DatabaseError('No transaction in progress');
    }

    try {
      await this.connection.commit();
      this.connection.release();
      this.connection = null;
    } catch (error) {
      await this.rollback();
      throw new DatabaseError('Failed to commit transaction', { error: error.message });
    }
  }

  /**
   * Rollback the current transaction
   * @returns {Promise<void>}
   */
  async rollback() {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.rollback();
      this.connection.release();
      this.connection = null;
    } catch (error) {
      throw new DatabaseError('Failed to rollback transaction', { error: error.message });
    }
  }

  /**
   * Execute a callback within a transaction
   * @param {Function} callback - Async function to execute
   * @returns {Promise<*>} - Result of the callback
   */
  async transaction(callback) {
    await this.beginTransaction();

    try {
      const result = await callback(this.connection);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  // ============================================================================
  // STANDARD CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all records with filters and pagination
   * @param {Object} filters - Filter conditions
   * @param {Object} pagination - Pagination options
   * @param {number} pagination.page - Page number (default: 1)
   * @param {number} pagination.limit - Records per page (default: 10)
   * @param {string} pagination.sortBy - Sort field (default: 'id')
   * @param {string} pagination.sortOrder - Sort order: 'ASC' or 'DESC' (default: 'DESC')
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} - Paginated results with metadata
   */
  async getAll(filters = {}, pagination = {}, options = {}) {
    try {
      // Validate filters if schema is defined
      if (this.schemas.filters) {
        filters = await this.validateFilters(filters);
      }

      // Prepare pagination
      const {
        page = 1,
        limit = 10,
        sortBy = this.model.primaryKey || 'id',
        sortOrder = 'DESC'
      } = pagination;

      // Build query options
      const queryOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        where: filters,
        orderBy: `${sortBy} ${sortOrder}`,
        ...options
      };

      // Execute query using repository/model
      const result = await this.model.findAll(queryOptions);

      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          pagination: result.pagination
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch ${this.resourceName} list`, {
        error: error.message
      });
    }
  }

  /**
   * Get a single record by ID
   * @param {number|string} id - Record ID
   * @param {Object} options - Query options (e.g., relations to load)
   * @returns {Promise<Object>} - Record data
   * @throws {NotFoundError}
   */
  async getById(id, options = {}) {
    try {
      // Use repository if available, otherwise use model
      const result = this.repository.findById 
        ? await this.repository.findById(id, options)
        : await this.model.findById(id, options);

      if (!result) {
        throw new NotFoundError(this.resourceName, id);
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch ${this.resourceName}`, {
        error: error.message
      });
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Data to create
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Created record
   */
  async create(data, options = {}) {
    try {
      // Validate data
      const validatedData = await this.validateCreate(data);

      // Execute beforeCreate hook
      const processedData = await this.beforeCreate(validatedData);

      // Create record
      let result;
      if (this.connection) {
        // Use transaction connection if available
        result = await this.model.create(processedData, { connection: this.connection });
      } else {
        result = await this.model.create(processedData);
      }

      // Execute afterCreate hook
      const finalResult = await this.afterCreate(processedData, result);

      return {
        success: true,
        data: finalResult,
        message: `${this.resourceName} created successfully`
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create ${this.resourceName}`, {
        error: error.message
      });
    }
  }

  /**
   * Update an existing record
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Updated record
   * @throws {NotFoundError}
   */
  async update(id, data, options = {}) {
    try {
      // Check if record exists
      await this.getById(id);

      // Validate data
      const validatedData = await this.validateUpdate(data);

      // Execute beforeUpdate hook
      const processedData = await this.beforeUpdate(id, validatedData);

      // Update record
      let result;
      if (this.connection) {
        // Use transaction connection if available
        result = await this.model.update(id, processedData, { connection: this.connection });
      } else {
        result = await this.model.update(id, processedData);
      }

      // Fetch updated record
      const updatedRecord = this.repository.findById
        ? await this.repository.findById(id)
        : await this.model.findById(id);

      // Execute afterUpdate hook
      const finalResult = await this.afterUpdate(id, processedData, updatedRecord);

      return {
        success: true,
        data: finalResult,
        message: `${this.resourceName} updated successfully`
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update ${this.resourceName}`, {
        error: error.message
      });
    }
  }

  /**
   * Delete a record (soft delete if supported)
   * @param {number|string} id - Record ID
   * @param {Object} options - Additional options
   * @param {boolean} options.force - Force permanent delete (default: false)
   * @returns {Promise<Object>} - Deletion confirmation
   * @throws {NotFoundError}
   */
  async delete(id, options = {}) {
    try {
      // Check if record exists
      await this.getById(id);

      // Execute beforeDelete hook
      await this.beforeDelete(id);

      // Delete record
      const { force = false } = options;
      let result;

      if (this.connection) {
        // Use transaction connection if available
        result = await this.model.delete(id, { force, connection: this.connection });
      } else {
        result = await this.model.delete(id, { force });
      }

      // Execute afterDelete hook
      await this.afterDelete(id);

      return {
        success: true,
        message: `${this.resourceName} deleted successfully`,
        data: { id, deleted: true }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete ${this.resourceName}`, {
        error: error.message
      });
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if a record exists
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    try {
      const result = this.repository.findById
        ? await this.repository.findById(id)
        : await this.model.findById(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count records with optional filters
   * @param {Object} filters - Filter conditions
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    try {
      if (this.schemas.filters) {
        filters = await this.validateFilters(filters);
      }

      const result = await this.model.count(filters);
      return result;
    } catch (error) {
      throw new DatabaseError(`Failed to count ${this.resourceName}`, {
        error: error.message
      });
    }
  }

  /**
   * Find one record by conditions
   * @param {Object} conditions - Query conditions
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async findOne(conditions, options = {}) {
    try {
      const result = await this.model.findOne(conditions, options);
      return result;
    } catch (error) {
      throw new DatabaseError(`Failed to find ${this.resourceName}`, {
        error: error.message
      });
    }
  }

  /**
   * Bulk create multiple records
   * @param {Array<Object>} dataArray - Array of records to create
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  async bulkCreate(dataArray, options = {}) {
    try {
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw new ValidationError('Data array is required and must not be empty');
      }

      // Validate all records
      const validatedData = await Promise.all(
        dataArray.map(data => this.validateCreate(data))
      );

      // Execute in transaction
      const results = await this.transaction(async (connection) => {
        const createdRecords = [];
        for (const data of validatedData) {
          const processedData = await this.beforeCreate(data);
          const result = await this.model.create(processedData, { connection });
          const finalResult = await this.afterCreate(processedData, result);
          createdRecords.push(finalResult);
        }
        return createdRecords;
      });

      return {
        success: true,
        data: results,
        message: `${results.length} ${this.resourceName} records created successfully`,
        meta: {
          count: results.length
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to bulk create ${this.resourceName} records`, {
        error: error.message
      });
    }
  }

  /**
   * Bulk update multiple records
   * @param {Array<Object>} updates - Array of {id, data} objects
   * @param {Object} options - Additional options
   * @returns {Promise<Object>}
   */
  async bulkUpdate(updates, options = {}) {
    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new ValidationError('Updates array is required and must not be empty');
      }

      // Execute in transaction
      const results = await this.transaction(async (connection) => {
        const updatedRecords = [];
        for (const { id, data } of updates) {
          const validatedData = await this.validateUpdate(data);
          const processedData = await this.beforeUpdate(id, validatedData);
          await this.model.update(id, processedData, { connection });
          
          const updatedRecord = await this.model.findById(id);
          const finalResult = await this.afterUpdate(id, processedData, updatedRecord);
          updatedRecords.push(finalResult);
        }
        return updatedRecords;
      });

      return {
        success: true,
        data: results,
        message: `${results.length} ${this.resourceName} records updated successfully`,
        meta: {
          count: results.length
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to bulk update ${this.resourceName} records`, {
        error: error.message
      });
    }
  }
}

module.exports = BaseService;
