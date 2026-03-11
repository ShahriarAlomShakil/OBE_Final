/**
 * AuthController
 * 
 * Handles all authentication-related HTTP requests:
 * - User login and registration
 * - Token refresh and logout
 * - Password reset flow
 * - Current user retrieval
 * 
 * Uses AuthService for business logic and returns consistent JSON responses.
 */

const { body, validationResult } = require('express-validator');
const AuthService = require('../services/AuthService');
const responseHelper = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Validation rules for login
   */
  loginValidation = [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email or username is required')
      .isLength({ min: 3 })
      .withMessage('Email or username must be at least 3 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ];

  /**
   * Validation rules for registration
   */
  registerValidation = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
      .optional()
      .isIn(['admin', 'hod', 'teacher', 'student'])
      .withMessage('Invalid role. Must be one of: admin, hod, teacher, student')
  ];

  /**
   * Validation rules for forgot password
   */
  forgotPasswordValidation = [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ];

  /**
   * Validation rules for reset password
   */
  resetPasswordValidation = [
    body('token')
      .trim()
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ];

  /**
   * Validation rules for refresh token
   */
  refreshTokenValidation = [
    body('refreshToken')
      .trim()
      .notEmpty()
      .withMessage('Refresh token is required')
  ];

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return JWT tokens
   */
  login = asyncHandler(async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.validationError(res, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Extract metadata for session tracking
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    // Perform login
    const result = await this.authService.login(email, password, metadata);

    return responseHelper.success(res, result, 'Login successful');
  });

  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  register = asyncHandler(async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.validationError(res, 'Validation failed', errors.array());
    }

    const userData = req.body;

    // Register user
    const result = await this.authService.register(userData);

    return responseHelper.created(res, result, 'User registered successfully');
  });

  /**
   * POST /api/v1/auth/logout
   * Logout user and invalidate session
   */
  logout = asyncHandler(async (req, res) => {
    // User is attached by auth middleware
    const userId = req.user.id;

    // Extract token from Authorization header
    const authHeader = req.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      return responseHelper.badRequest(res, 'No token provided');
    }

    // Perform logout
    await this.authService.logout(userId, token);

    return responseHelper.success(res, null, 'Logout successful');
  });

  /**
   * POST /api/v1/auth/refresh-token
   * Refresh access token using refresh token
   */
  refreshToken = asyncHandler(async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.validationError(res, 'Validation failed', errors.array());
    }

    const { refreshToken } = req.body;

    // Extract metadata
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    // Refresh token
    const result = await this.authService.refreshToken(refreshToken, metadata);

    return responseHelper.success(res, result, 'Token refreshed successfully');
  });

  /**
   * POST /api/v1/auth/forgot-password
   * Send password reset token to user's email
   */
  forgotPassword = asyncHandler(async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.validationError(res, 'Validation failed', errors.array());
    }

    const { email } = req.body;

    // Generate reset token
    const result = await this.authService.forgotPassword(email);

    return responseHelper.success(res, result, 'Password reset instructions sent to your email');
  });

  /**
   * POST /api/v1/auth/reset-password
   * Reset password using token
   */
  resetPassword = asyncHandler(async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.validationError(res, 'Validation failed', errors.array());
    }

    const { token, password } = req.body;

    // Reset password
    await this.authService.resetPassword(token, password);

    return responseHelper.success(res, null, 'Password reset successful. Please login with your new password.');
  });

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user
   */
  me = asyncHandler(async (req, res) => {
    // User is attached by auth middleware
    const userId = req.user.id;

    // Get user details
    const user = await this.authService.getUser(userId);

    return responseHelper.success(res, { user }, 'User retrieved successfully');
  });
}

module.exports = new AuthController();
