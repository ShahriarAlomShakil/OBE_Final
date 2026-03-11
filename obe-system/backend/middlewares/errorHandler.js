/**
 * Error Handling Middleware
 * Centralized error handling for Express application with proper logging and response formatting
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const logger = require('../config/logger');
const {
  AppError,
  ValidationError,
  DatabaseError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError
} = require('../utils/AppError');

// ============================================================================
// MYSQL ERROR HANDLER
// ============================================================================

/**
 * Handle MySQL-specific errors and convert them to appropriate AppErrors
 * @param {Error} err - MySQL error object
 * @returns {AppError} Converted AppError instance
 */
const handleMySQLError = (err) => {
  // ER_DUP_ENTRY: Duplicate entry violation
  if (err.code === 'ER_DUP_ENTRY') {
    // Extract field name from error message
    const match = err.message.match(/for key '(\w+)'/);
    const field = match ? match[1] : 'field';
    
    return new ConflictError(
      `Duplicate entry: ${field} already exists`,
      { 
        field,
        code: err.code,
        sqlMessage: err.sqlMessage 
      }
    );
  }

  // ER_NO_REFERENCED_ROW: Foreign key constraint violation (insert)
  // ER_ROW_IS_REFERENCED: Foreign key constraint violation (delete)
  if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return new BadRequestError(
      'Referenced record does not exist',
      {
        code: err.code,
        sqlMessage: err.sqlMessage
      }
    );
  }

  if (err.code === 'ER_ROW_IS_REFERENCED' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return new ConflictError(
      'Cannot delete: record is referenced by other records',
      {
        code: err.code,
        sqlMessage: err.sqlMessage
      }
    );
  }

  // ER_BAD_NULL_ERROR: NOT NULL constraint violation
  if (err.code === 'ER_BAD_NULL_ERROR') {
    const match = err.message.match(/Column '(\w+)'/);
    const field = match ? match[1] : 'field';
    
    return new ValidationError(
      `Field '${field}' cannot be null`,
      {
        field,
        code: err.code
      }
    );
  }

  // ER_DATA_TOO_LONG: Data too long for column
  if (err.code === 'ER_DATA_TOO_LONG') {
    const match = err.message.match(/for column '(\w+)'/);
    const field = match ? match[1] : 'field';
    
    return new ValidationError(
      `Data too long for field '${field}'`,
      {
        field,
        code: err.code
      }
    );
  }

  // ER_TRUNCATED_WRONG_VALUE: Invalid value format
  if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
    return new ValidationError(
      'Invalid value format',
      {
        code: err.code,
        sqlMessage: err.sqlMessage
      }
    );
  }

  // ER_NO_DEFAULT_FOR_FIELD: Field doesn't have a default value
  if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
    const match = err.message.match(/Field '(\w+)'/);
    const field = match ? match[1] : 'field';
    
    return new ValidationError(
      `Field '${field}' is required`,
      {
        field,
        code: err.code
      }
    );
  }

  // ECONNREFUSED: Database connection refused
  if (err.code === 'ECONNREFUSED') {
    return new DatabaseError(
      'Database connection failed',
      {
        code: err.code,
        message: 'Unable to connect to database server'
      }
    );
  }

  // PROTOCOL_CONNECTION_LOST: Database connection lost
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    return new DatabaseError(
      'Database connection lost',
      {
        code: err.code
      }
    );
  }

  // Generic database error
  return new DatabaseError(
    'Database operation failed',
    {
      code: err.code,
      sqlMessage: err.sqlMessage
    }
  );
};

// ============================================================================
// JOI VALIDATION ERROR HANDLER
// ============================================================================

/**
 * Handle Joi validation errors
 * @param {Error} err - Joi validation error
 * @returns {ValidationError} Converted ValidationError instance
 */
const handleJoiValidationError = (err) => {
  const errors = err.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type
  }));

  return new ValidationError(
    'Input validation failed',
    { errors }
  );
};

// ============================================================================
// JWT ERROR HANDLER
// ============================================================================

/**
 * Handle JWT errors
 * @param {Error} err - JWT error
 * @returns {UnauthorizedError} Converted UnauthorizedError instance
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new UnauthorizedError('Invalid authentication token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return new UnauthorizedError('Authentication token has expired');
  }

  return new UnauthorizedError('Authentication failed');
};

// ============================================================================
// ERROR LOGGER
// ============================================================================

/**
 * Log error details
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 */
const logError = (err, req) => {
  const errorLog = {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user ? req.user.id : 'unauthenticated',
    timestamp: new Date().toISOString()
  };

  // Log based on severity
  if (err.statusCode >= 500) {
    logger.error('Server Error:', errorLog);
  } else if (err.statusCode >= 400) {
    logger.warn('Client Error:', errorLog);
  } else {
    logger.info('Error:', errorLog);
  }
};

// ============================================================================
// MAIN ERROR HANDLER MIDDLEWARE
// ============================================================================

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle MySQL errors
  if (err.code && (err.code.startsWith('ER_') || 
      err.code === 'ECONNREFUSED' || 
      err.code === 'PROTOCOL_CONNECTION_LOST')) {
    error = handleMySQLError(err);
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError' && err.details) {
    error = handleJoiValidationError(err);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ValidationError('File size too large', { maxSize: err.limit });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new ValidationError('Too many files', { maxCount: err.limit });
    } else {
      error = new ValidationError('File upload failed', { error: err.message });
    }
  }

  // Ensure error is an AppError instance
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
      error.code || 'INTERNAL_ERROR',
      error.details
    );
  }

  // Log the error
  try {
    logError(error, req);
  } catch (logErr) {
    // Fallback logging if logError fails
    console.error('Error logging failed:', logErr);
    console.error('Original error:', error);
  }

  // Prepare error response
  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details })
    }
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  // Send error response
  res.status(error.statusCode).json(response);
};

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================

/**
 * Handle 404 Not Found errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Route', req.originalUrl);
  next(error);
};

// ============================================================================
// ASYNC ERROR WRAPPER
// ============================================================================

/**
 * Wrapper for async route handlers to catch errors
 * Eliminates the need for try-catch blocks in controllers
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json({ success: true, data: users });
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
