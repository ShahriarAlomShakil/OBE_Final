/**
 * Response Helper Utility
 * 
 * Provides consistent response formatting across all API endpoints
 * Format: { success, data, message, meta }
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Array|Object} errors - Validation errors or additional error details
 */
const error = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    data: null,
    message,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  // Include errors if provided
  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {Number} pagination.page - Current page number
 * @param {Number} pagination.limit - Items per page
 * @param {Number} pagination.total - Total number of items
 * @param {Number} pagination.totalPages - Total number of pages
 * @param {String} message - Success message
 */
const paginated = (res, data, pagination, message = 'Data retrieved successfully') => {
  const { page, limit, total, totalPages } = pagination;

  return res.status(200).json({
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit),
        totalItems: parseInt(total),
        totalPages: parseInt(totalPages),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
};

/**
 * Send a created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Success message
 */
const created = (res, data = null, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Send a no content response (204)
 * @param {Object} res - Express response object
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Send a bad request response (400)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Array|Object} errors - Validation errors
 */
const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, 400, errors);
};

/**
 * Send an unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

/**
 * Send a forbidden response (403)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

/**
 * Send a not found response (404)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

/**
 * Send a conflict response (409)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const conflict = (res, message = 'Resource already exists') => {
  return error(res, message, 409);
};

/**
 * Send a validation error response (422)
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 * @param {String} message - Error message
 */
const validationError = (res, errors, message = 'Validation failed') => {
  return error(res, message, 422, errors);
};

/**
 * Send an internal server error response (500)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const serverError = (res, message = 'Internal server error') => {
  return error(res, message, 500);
};

module.exports = {
  // Core response methods
  success,
  error,
  paginated,
  created,
  noContent,

  // Convenience methods for common status codes
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError
};
