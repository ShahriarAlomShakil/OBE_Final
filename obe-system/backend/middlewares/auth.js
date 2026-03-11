/**
 * Authentication Middleware
 * 
 * Provides JWT token verification and role-based authorization
 * for protecting Express routes.
 */

const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/auth');
const { UnauthorizedError, ForbiddenError } = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

// Create User model instance for database operations
const userModel = User;

/**
 * Authenticate middleware - Verify JWT token from Authorization header
 * 
 * Extracts the Bearer token, verifies it, and attaches the user to req.user
 * Requires valid token or responds with 401 Unauthorized
 * 
 * @middleware
 * @example
 * router.get('/protected', authenticate, controller.method);
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided. Please authenticate.');
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Invalid token format.');
  }

  try {
    // Verify token with matching options from token generation
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    });

    // Get user from database (exclude password)
    // Token payload uses 'id' not 'userId'
    const user = await userModel.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found. Token may be invalid.');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('User account is inactive.');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      email_verified_at: user.email_verified_at
    };

    // Attach full user object for methods
    req.userModel = user;

    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired. Please login again.');
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token. Please authenticate.');
    }

    if (error.name === 'NotBeforeError') {
      throw new UnauthorizedError('Token not active yet.');
    }

    // Re-throw if it's already an AppError
    throw error;
  }
});

/**
 * Authorize middleware - Check if user has required role(s)
 * 
 * Must be used after authenticate middleware
 * Checks if user's role matches any of the allowed roles
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'teacher', 'student')
 * @returns {Function} Express middleware function
 * @middleware
 * @example
 * router.post('/courses', authenticate, authorize('admin', 'hod'), controller.create);
 * router.get('/grades', authenticate, authorize('teacher', 'student'), controller.index);
 */
const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }

    next();
  });
};

/**
 * Optional Auth middleware - Attach user if token exists, continue if not
 * 
 * Attempts to verify JWT token but doesn't throw error if missing/invalid
 * Useful for routes that work differently for authenticated vs anonymous users
 * 
 * @middleware
 * @example
 * router.get('/courses', optionalAuth, controller.index); // Shows more data if logged in
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  // If no token, just continue
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);

    // Get user from database
    const user = await userModel.findById(decoded.userId);

    // Only attach user if found and active
    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        email_verified_at: user.email_verified_at
      };

      req.userModel = user;
    }
  } catch (error) {
    // Silently ignore token errors in optional auth
    // User will be treated as unauthenticated
  }

  next();
});

/**
 * Require Email Verification middleware
 * 
 * Checks if user has verified their email address
 * Must be used after authenticate middleware
 * 
 * @middleware
 * @example
 * router.post('/courses', authenticate, requireEmailVerification, controller.create);
 */
const requireEmailVerification = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required.');
  }

  if (!req.user.email_verified_at) {
    throw new ForbiddenError('Email verification required. Please verify your email to continue.');
  }

  next();
});

/**
 * Check if user owns resource middleware
 * 
 * Verifies that the authenticated user is the owner of the resource
 * Admins bypass this check
 * 
 * @param {string} userIdField - Field name containing the user ID (default: 'user_id')
 * @returns {Function} Express middleware function
 * @middleware
 * @example
 * router.put('/posts/:id', authenticate, checkOwnership('author_id'), controller.update);
 */
const checkOwnership = (userIdField = 'user_id') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }

    // Admins can access everything
    if (req.user.role === User.ROLE_ADMIN) {
      return next();
    }

    // Get resource owner ID from request (params, body, or resource)
    const resourceOwnerId = req.params[userIdField] || 
                           req.body[userIdField] || 
                           (req.resource && req.resource[userIdField]);

    if (!resourceOwnerId) {
      throw new ForbiddenError('Cannot determine resource ownership.');
    }

    // Check if user owns the resource
    if (req.user.id !== parseInt(resourceOwnerId)) {
      throw new ForbiddenError('You do not have permission to access this resource.');
    }

    next();
  });
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireEmailVerification,
  checkOwnership
};
