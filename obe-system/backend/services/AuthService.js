/**
 * AuthService - Authentication and Authorization Service
 * Handles user authentication, JWT token management, password reset, and session management
 * 
 * Features:
 * - User login with email/username and password validation
 * - User registration with password hashing
 * - JWT access and refresh token generation
 * - Token refresh mechanism
 * - Password reset with secure tokens
 * - Session tracking and invalidation
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const User = require('../models/User');
const db = require('../config/database');
const authConfig = require('../config/auth');
const {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  AppError
} = require('../utils/AppError');

class AuthService {
  constructor() {
    this.userModel = User; // Use the exported instance directly
    this.jwtSecret = authConfig.jwtConfig.secret;
    this.accessTokenExpiry = authConfig.jwtConfig.accessTokenExpiry;
    this.refreshTokenExpiry = authConfig.jwtConfig.refreshTokenExpiry;
    this.resetPasswordExpiry = authConfig.jwtConfig.resetPasswordExpiry;
    
    // Validation schemas
    this.schemas = {
      login: Joi.object({
        // Accept email or username - allow both formats
        email: Joi.string().min(3).max(255).required().messages({
          'string.min': 'Email or username must be at least 3 characters',
          'string.max': 'Email or username must be at most 255 characters',
          'any.required': 'Email or username is required'
        }),
        password: Joi.string().required()
      }),
      register: Joi.object({
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string()
          .min(authConfig.passwordConfig.minLength)
          .max(authConfig.passwordConfig.maxLength)
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .required()
          .messages({
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
          }),
        role: Joi.string().valid('admin', 'hod', 'teacher', 'student').required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
        date_of_birth: Joi.date().max('now').optional(),
        gender_id: Joi.number().integer().positive().optional()
      }),
      forgotPassword: Joi.object({
        email: Joi.string().email().required()
      }),
      resetPassword: Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string()
          .min(authConfig.passwordConfig.minLength)
          .max(authConfig.passwordConfig.maxLength)
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .required()
          .messages({
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
          })
      })
    };
  }

  /**
   * Validate input data against schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Joi schema
   * @throws {ValidationError} If validation fails
   */
  _validate(data, schema) {
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});
      throw new ValidationError('Validation failed', errors);
    }
    
    return value;
  }

  /**
   * Generate JWT access token
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  _generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      type: 'access'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: authConfig.jwtConfig.issuer,
      audience: authConfig.jwtConfig.audience
    });
  }

  /**
   * Generate JWT refresh token
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  _generateRefreshToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: authConfig.jwtConfig.issuer,
      audience: authConfig.jwtConfig.audience
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  _verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: authConfig.jwtConfig.issuer,
        audience: authConfig.jwtConfig.audience
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Create session record
   * @param {number} userId - User ID
   * @param {string} token - Refresh token
   * @param {Object} metadata - Session metadata (IP, user agent)
   * @returns {Promise<string>} Session ID
   */
  async _createSession(userId, token, metadata = {}) {
    const sessionId = crypto.randomUUID();
    const lastActivity = Math.floor(Date.now() / 1000);
    
    const payload = JSON.stringify({
      token,
      createdAt: new Date().toISOString()
    });

    const query = `
      INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      sessionId,
      userId,
      metadata.ipAddress || null,
      metadata.userAgent || null,
      payload,
      lastActivity
    ]);

    return sessionId;
  }

  /**
   * Delete session record
   * @param {number} userId - User ID
   * @param {string} token - Refresh token
   * @returns {Promise<boolean>} True if session deleted
   */
  async _deleteSession(userId, token) {
    const query = `
      DELETE FROM sessions
      WHERE user_id = ?
      AND payload LIKE ?
    `;

    const [result] = await db.query(query, [userId, `%${token}%`]);
    return result.affectedRows > 0;
  }

  /**
   * Login user with email/username and password
   * @param {string} email - Email or username
   * @param {string} password - Plain text password
   * @param {Object} metadata - Request metadata (IP, user agent)
   * @returns {Promise<Object>} User data and tokens
   * @throws {ValidationError} If input is invalid
   * @throws {UnauthorizedError} If credentials are invalid
   */
  async login(email, password, metadata = {}) {
    // Validate input
    const validated = this._validate({ email, password }, this.schemas.login);

    // Find user by email or username (include password for verification)
    let user = await this.userModel.findByEmail(validated.email, { includePassword: true });
    
    if (!user) {
      // Try finding by username instead
      user = await this.userModel.findByUsername(validated.email, { includePassword: true });
    }

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is inactive. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await this.userModel.verifyPassword(validated.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Remove password from user object
    delete user.password;

    // Generate tokens
    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    // Create session
    const sessionId = await this._createSession(user.id, refreshToken, metadata);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: this.accessTokenExpiry
      },
      sessionId
    };
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   * @throws {ValidationError} If input is invalid
   * @throws {AppError} If email or username already exists
   */
  async register(userData) {
    // Validate input
    const validated = this._validate(userData, this.schemas.register);

    // Check if email already exists
    const existingEmail = await this.userModel.findByEmail(validated.email);
    if (existingEmail) {
      throw new ValidationError('Email already registered', {
        email: 'This email is already in use'
      });
    }

    // Check if username already exists
    const existingUsername = await this.userModel.findByUsername(validated.username);
    if (existingUsername) {
      throw new ValidationError('Username already taken', {
        username: 'This username is already in use'
      });
    }

    // Set default values
    validated.is_active = true;
    validated.email_verified_at = null;

    // Create user (password will be hashed automatically in User model)
    const user = await this.userModel.create(validated);

    // Generate tokens
    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    // Create session
    const sessionId = await this._createSession(user.id, refreshToken);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: this.accessTokenExpiry
      },
      sessionId
    };
  }

  /**
   * Logout user by invalidating session
   * @param {number} userId - User ID
   * @param {string} token - Refresh token to invalidate
   * @returns {Promise<boolean>} True if logout successful
   */
  async logout(userId, token) {
    if (!userId || !token) {
      throw new ValidationError('User ID and token are required for logout');
    }

    // Delete session from database
    const deleted = await this._deleteSession(userId, token);

    return deleted;
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} New access token
   * @throws {UnauthorizedError} If refresh token is invalid
   */
  async refreshToken(refreshToken, metadata = {}) {
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = this._verifyToken(refreshToken);

    // Check token type
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Verify session exists
    const query = `
      SELECT * FROM sessions
      WHERE user_id = ?
      AND payload LIKE ?
      LIMIT 1
    `;
    
    const [sessions] = await db.query(query, [decoded.id, `%${refreshToken}%`]);

    if (sessions.length === 0) {
      throw new UnauthorizedError('Session not found or expired');
    }

    // Get user details
    const user = await this.userModel.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Generate new access token
    const accessToken = this._generateAccessToken(user);

    // Update session last activity
    const updateQuery = `
      UPDATE sessions
      SET last_activity = ?
      WHERE user_id = ?
      AND payload LIKE ?
    `;
    
    await db.query(updateQuery, [
      Math.floor(Date.now() / 1000),
      decoded.id,
      `%${refreshToken}%`
    ]);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenExpiry
    };
  }

  /**
   * Generate password reset token
   * @param {string} email - User email
   * @returns {Promise<string>} Password reset token
   * @throws {NotFoundError} If user not found
   */
  async forgotPassword(email) {
    // Validate input
    const validated = this._validate({ email }, this.schemas.forgotPassword);

    // Find user by email
    const user = await this.userModel.findByEmail(validated.email);

    if (!user) {
      throw new NotFoundError('No account found with this email address');
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing reset tokens for this email
    await db.query('DELETE FROM password_reset_tokens WHERE email = ?', [validated.email]);

    // Store hashed token in database
    const query = `
      INSERT INTO password_reset_tokens (email, token, created_at, expires_at)
      VALUES (?, ?, NOW(), ?)
    `;

    await db.query(query, [validated.email, hashedToken, expiresAt]);

    // Return the plain token (to be sent via email)
    // In production, this should be sent via email service
    return resetToken;
  }

  /**
   * Reset password using reset token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if password reset successful
   * @throws {ValidationError} If input is invalid
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  async resetPassword(token, newPassword) {
    // Validate input
    const validated = this._validate({ token, newPassword }, this.schemas.resetPassword);

    // Hash the token to match database
    const hashedToken = crypto.createHash('sha256').update(validated.token).digest('hex');

    // Find token in database
    const query = `
      SELECT * FROM password_reset_tokens
      WHERE token = ?
      AND expires_at > NOW()
      LIMIT 1
    `;

    const [tokens] = await db.query(query, [hashedToken]);

    if (tokens.length === 0) {
      throw new UnauthorizedError('Invalid or expired password reset token');
    }

    const resetRecord = tokens[0];

    // Find user by email
    const user = await this.userModel.findByEmail(resetRecord.email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update user password
    const passwordUpdated = await this.userModel.updatePassword(user.id, validated.newPassword);

    if (!passwordUpdated) {
      throw new AppError('Failed to update password', 500);
    }

    // Delete the used reset token
    await db.query('DELETE FROM password_reset_tokens WHERE email = ?', [resetRecord.email]);

    // Invalidate all user sessions (force re-login)
    await db.query('DELETE FROM sessions WHERE user_id = ?', [user.id]);

    return true;
  }

  /**
   * Verify access token and return user
   * @param {string} accessToken - JWT access token
   * @returns {Promise<Object>} User object
   * @throws {UnauthorizedError} If token is invalid
   */
  async verifyAccessToken(accessToken) {
    // Verify token
    const decoded = this._verifyToken(accessToken);

    // Check token type
    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Get user details
    const user = await this.userModel.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is inactive');
    }

    return user;
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   * @throws {NotFoundError} If user not found
   */
  async getUser(userId) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Clean up expired sessions (should be run periodically)
   * @returns {Promise<number>} Number of sessions deleted
   */
  async cleanupExpiredSessions() {
    // Delete sessions older than refresh token expiry (7 days = 604800 seconds)
    const expirySeconds = 7 * 24 * 60 * 60;
    const expiryTimestamp = Math.floor(Date.now() / 1000) - expirySeconds;

    const query = `
      DELETE FROM sessions
      WHERE last_activity < ?
    `;

    const [result] = await db.query(query, [expiryTimestamp]);
    return result.affectedRows;
  }

  /**
   * Clean up expired password reset tokens (should be run periodically)
   * @returns {Promise<number>} Number of tokens deleted
   */
  async cleanupExpiredResetTokens() {
    const query = `
      DELETE FROM password_reset_tokens
      WHERE expires_at < NOW()
    `;

    const [result] = await db.query(query);
    return result.affectedRows;
  }
}

module.exports = AuthService;
