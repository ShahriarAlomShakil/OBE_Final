/**
 * BaseController
 * Abstract base controller providing standard REST operations for Express.js
 * All controllers should extend this class to maintain consistency
 */

const asyncHandler = require('../utils/asyncHandler');
const { sanitizeInput } = require('../utils/sanitizer');

class BaseController {
  /**
   * Constructor
   * @param {Object} service - Service instance for business logic
   */
  constructor(service) {
    if (!service) {
      throw new Error('Service is required for BaseController');
    }
    this.service = service;
    
    // Bind methods to maintain context
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.store = this.store.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  /**
   * Format success response
   * @param {Object} res - Express response object
   * @param {*} data - Data to send
   * @param {string} message - Success message
   * @param {Object} meta - Additional metadata (pagination, etc.)
   * @param {number} statusCode - HTTP status code
   */
  successResponse(res, data = null, message = 'Success', meta = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      meta
    });
  }

  /**
   * Parse pagination parameters from query
   * @param {Object} query - Request query parameters
   * @returns {Object} Pagination options
   */
  getPaginationParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const sort = query.sort || 'id';
    const order = query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    return {
      page,
      limit,
      offset,
      sort,
      order
    };
  }

  /**
   * Build pagination metadata
   * @param {number} total - Total number of records
   * @param {number} page - Current page
   * @param {number} limit - Records per page
   * @returns {Object} Pagination metadata
   */
  buildPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * GET /resource
   * List all resources with pagination
   */
  index = asyncHandler(async (req, res) => {
    const { page, limit, offset, sort, order } = this.getPaginationParams(req.query);
    
    // Get filters from query (excluding pagination params)
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.sort;
    delete filters.order;
    
    // Sanitize filters
    const sanitizedFilters = sanitizeInput(filters);
    
    // Get data from service
    const result = await this.service.getAll(sanitizedFilters, {
      page,
      limit,
      sortBy: sort,
      sortOrder: order
    });
    
    // Build response with pagination
    const meta = result.meta || this.buildPaginationMeta(
      result.pagination?.total || result.total || result.count || 0, 
      page, 
      limit
    );
    
    return this.successResponse(
      res,
      result.data || result.rows || result,
      'Records retrieved successfully',
      meta
    );
  });

  /**
   * GET /resource/:id
   * Get a single resource by ID
   */
  show = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid ID provided',
        meta: {}
      });
    }
    
    // Get data from service
    const data = await this.service.getById(parseInt(id));
    
    return this.successResponse(
      res,
      data,
      'Record retrieved successfully'
    );
  });

  /**
   * POST /resource
   * Create a new resource
   */
  store = asyncHandler(async (req, res) => {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    // Create via service
    const data = await this.service.create(sanitizedData);
    
    return this.successResponse(
      res,
      data,
      'Record created successfully',
      {},
      201
    );
  });

  /**
   * PUT/PATCH /resource/:id
   * Update an existing resource
   */
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid ID provided',
        meta: {}
      });
    }
    
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    // Update via service
    const data = await this.service.update(parseInt(id), sanitizedData);
    
    return this.successResponse(
      res,
      data,
      'Record updated successfully'
    );
  });

  /**
   * DELETE /resource/:id
   * Delete a resource
   */
  destroy = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid ID provided',
        meta: {}
      });
    }
    
    // Delete via service
    await this.service.delete(parseInt(id));
    
    return this.successResponse(
      res,
      null,
      'Record deleted successfully',
      {},
      200
    );
  });

  /**
   * Custom action wrapper
   * Use this for custom controller methods
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} action - Async action function
   * @returns {Promise} Result of the action
   */
  async customAction(req, res, action) {
    return asyncHandler(async (req, res) => {
      const result = await action.call(this, req, res);
      
      if (result && !res.headersSent) {
        return this.successResponse(
          res,
          result.data || result,
          result.message || 'Operation successful',
          result.meta || {}
        );
      }
    })(req, res);
  }
}

module.exports = BaseController;
