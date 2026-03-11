const Joi = require('joi');
require('dotenv').config();

/**
 * Configuration validation schema
 */
const configSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number()
    .port()
    .default(3000),
  APP_NAME: Joi.string()
    .default('OBE System'),
  APP_URL: Joi.string()
    .uri()
    .default('http://localhost:3000'),
  
  // Database
  DB_HOST: Joi.string()
    .required()
    .messages({ 'any.required': 'DB_HOST is required' }),
  DB_PORT: Joi.number()
    .port()
    .default(3306),
  DB_USER: Joi.string()
    .required()
    .messages({ 'any.required': 'DB_USER is required' }),
  DB_PASSWORD: Joi.string()
    .allow('')
    .default(''),
  DB_NAME: Joi.string()
    .required()
    .messages({ 'any.required': 'DB_NAME is required' }),
  DB_CONNECTION_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(10),
  DB_MAX_IDLE: Joi.number()
    .integer()
    .min(1)
    .default(10),
  DB_IDLE_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .default(60000),
  
  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'any.required': 'JWT_SECRET is required',
      'string.min': 'JWT_SECRET must be at least 32 characters long'
    }),
  JWT_ACCESS_TOKEN_EXPIRY: Joi.string()
    .default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: Joi.string()
    .default('7d'),
  JWT_RESET_PASSWORD_EXPIRY: Joi.string()
    .default('10m'),
  JWT_EMAIL_VERIFICATION_EXPIRY: Joi.string()
    .default('24h'),
  
  // Redis
  REDIS_HOST: Joi.string()
    .default('localhost'),
  REDIS_PORT: Joi.number()
    .port()
    .default(6379),
  REDIS_PASSWORD: Joi.string()
    .allow('')
    .default(''),
  REDIS_DB: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .default(0),
  REDIS_KEY_PREFIX: Joi.string()
    .default('obe:'),
  REDIS_QUEUE_DB: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .default(1),
  
  // Email
  SMTP_HOST: Joi.string()
    .when('FEATURE_EMAIL_VERIFICATION', {
      is: 'true',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  SMTP_PORT: Joi.number()
    .port()
    .default(587),
  SMTP_SECURE: Joi.boolean()
    .default(false),
  SMTP_USER: Joi.string()
    .when('FEATURE_EMAIL_VERIFICATION', {
      is: 'true',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  SMTP_PASSWORD: Joi.string()
    .when('FEATURE_EMAIL_VERIFICATION', {
      is: 'true',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  EMAIL_FROM: Joi.string()
    .email()
    .default('noreply@obesystem.com'),
  EMAIL_FROM_NAME: Joi.string()
    .default('OBE System'),
  
  // Storage
  STORAGE_TYPE: Joi.string()
    .valid('local', 's3', 'minio')
    .default('local'),
  STORAGE_LOCAL_PATH: Joi.string()
    .when('STORAGE_TYPE', {
      is: 'local',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .default('./uploads'),
  AWS_ACCESS_KEY_ID: Joi.string()
    .when('STORAGE_TYPE', {
      is: 's3',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .when('STORAGE_TYPE', {
      is: 's3',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  AWS_S3_BUCKET: Joi.string()
    .when('STORAGE_TYPE', {
      is: 's3',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  AWS_REGION: Joi.string()
    .default('us-east-1'),
  MINIO_ENDPOINT: Joi.string()
    .when('STORAGE_TYPE', {
      is: 'minio',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  MINIO_ACCESS_KEY: Joi.string()
    .when('STORAGE_TYPE', {
      is: 'minio',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  MINIO_SECRET_KEY: Joi.string()
    .when('STORAGE_TYPE', {
      is: 'minio',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  MINIO_BUCKET: Joi.string()
    .default('obe-system'),
  
  // Security
  BCRYPT_ROUNDS: Joi.number()
    .integer()
    .min(10)
    .max(15)
    .default(12),
  PASSWORD_MIN_LENGTH: Joi.number()
    .integer()
    .min(8)
    .default(8),
  SESSION_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'any.required': 'SESSION_SECRET is required',
      'string.min': 'SESSION_SECRET must be at least 32 characters long'
    }),
  MAX_LOGIN_ATTEMPTS: Joi.number()
    .integer()
    .min(1)
    .default(5),
  LOCK_TIME: Joi.number()
    .integer()
    .min(1)
    .default(15),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: Joi.boolean()
    .default(true),
  RATE_LIMIT_WINDOW: Joi.number()
    .integer()
    .min(1)
    .default(15),
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .integer()
    .min(1)
    .default(100),
  
  // Features
  FEATURE_SWAGGER_ENABLED: Joi.boolean()
    .default(true),
  MAINTENANCE_MODE: Joi.boolean()
    .default(false),
  FEATURE_REGISTRATION_ENABLED: Joi.boolean()
    .default(true),
  FEATURE_EMAIL_VERIFICATION: Joi.boolean()
    .default(false),
  FEATURE_TWO_FACTOR: Joi.boolean()
    .default(false),
  FEATURE_SOCIAL_LOGIN: Joi.boolean()
    .default(false),
  FEATURE_NOTIFICATIONS: Joi.boolean()
    .default(true),
  FEATURE_ANALYTICS: Joi.boolean()
    .default(false),
  
  // CORS
  CORS_ENABLED: Joi.boolean()
    .default(true),
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:5173'),
  FRONTEND_URL: Joi.string()
    .uri()
    .default('http://localhost:5173'),
  
  // API
  API_VERSION: Joi.string()
    .default('v1'),
  API_PREFIX: Joi.string()
    .default('/api'),
  API_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .default(30000),
  
  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_CONSOLE: Joi.boolean()
    .default(true),
  LOG_FILE_ENABLED: Joi.boolean()
    .default(true),
  LOG_FILE_PATH: Joi.string()
    .default('./logs'),
  LOG_FORMAT: Joi.string()
    .valid('json', 'simple')
    .default('json'),
  
  // Cache
  CACHE_ENABLED: Joi.boolean()
    .default(true),
  CACHE_DEFAULT_TTL: Joi.number()
    .integer()
    .min(1)
    .default(3600),
  CACHE_PREFIX: Joi.string()
    .default('obe:cache:'),
  
  // Queue
  QUEUE_ENABLED: Joi.boolean()
    .default(true),
  QUEUE_PREFIX: Joi.string()
    .default('obe:queue:'),
  QUEUE_ATTEMPTS: Joi.number()
    .integer()
    .min(1)
    .default(3),
  
  // Pagination
  DEFAULT_PAGE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(20),
  MAX_PAGE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(100),
  
  // File Upload
  MAX_FILE_SIZE: Joi.number()
    .integer()
    .min(1024)
    .default(10485760),
  MAX_FILES_PER_REQUEST: Joi.number()
    .integer()
    .min(1)
    .default(5),
  
  // Academic
  CURRENT_ACADEMIC_SESSION: Joi.string()
    .allow('')
    .optional(),
  GRADE_SYSTEM: Joi.string()
    .valid('4.0', '5.0')
    .default('4.0'),
  PASSING_GRADE: Joi.number()
    .min(0)
    .max(5)
    .default(2.0),
  
  // WebSocket
  WEBSOCKET_ENABLED: Joi.boolean()
    .default(false),
  
  // Health Check
  HEALTH_CHECK_ENABLED: Joi.boolean()
    .default(true),
  HEALTH_CHECK_PATH: Joi.string()
    .default('/health'),
  
  // Timezone
  TZ: Joi.string()
    .default('UTC'),
  
}).unknown(true); // Allow other environment variables

/**
 * Validate configuration
 * @returns {object} - Validation result
 */
const validateConfig = () => {
  const { error, value } = configSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    return {
      isValid: false,
      errors,
      config: null,
    };
  }
  
  return {
    isValid: true,
    errors: [],
    config: value,
  };
};

/**
 * Check for security issues in configuration
 * @returns {Array} - Array of warnings
 */
const checkSecurityIssues = () => {
  const warnings = [];
  
  // Check for default secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      warnings.push({
        level: 'critical',
        message: 'JWT_SECRET is using default value. This is a critical security risk in production!'
      });
    }
    
    if (process.env.SESSION_SECRET === 'your-session-secret-change-this') {
      warnings.push({
        level: 'critical',
        message: 'SESSION_SECRET is using default value. This is a critical security risk in production!'
      });
    }
    
    if (!process.env.DB_PASSWORD) {
      warnings.push({
        level: 'high',
        message: 'DB_PASSWORD is empty. This is a security risk in production!'
      });
    }
    
    if (process.env.RATE_LIMIT_ENABLED !== 'true') {
      warnings.push({
        level: 'medium',
        message: 'Rate limiting is disabled. This may expose the API to abuse.'
      });
    }
    
    if (process.env.HELMET_ENABLED === 'false') {
      warnings.push({
        level: 'medium',
        message: 'Helmet security headers are disabled. This may expose the application to attacks.'
      });
    }
  }
  
  // Check JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push({
      level: 'high',
      message: 'JWT_SECRET is too short. Use at least 32 characters for better security.'
    });
  }
  
  // Check SESSION secret length
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
    warnings.push({
      level: 'high',
      message: 'SESSION_SECRET is too short. Use at least 32 characters for better security.'
    });
  }
  
  // Check bcrypt rounds
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  if (bcryptRounds < 10) {
    warnings.push({
      level: 'medium',
      message: 'BCRYPT_ROUNDS is too low. Recommended minimum is 10.'
    });
  }
  
  return warnings;
};

/**
 * Display configuration validation results
 * @param {object} result - Validation result
 */
const displayValidationResults = (result) => {
  console.log('\n========================================');
  console.log('   CONFIGURATION VALIDATION RESULTS');
  console.log('========================================\n');
  
  if (result.isValid) {
    console.log('✓ Configuration is valid');
  } else {
    console.error('✗ Configuration validation failed\n');
    console.error('Errors:');
    result.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. ${error.field}: ${error.message}`);
    });
  }
  
  // Check for security issues
  const warnings = checkSecurityIssues();
  if (warnings.length > 0) {
    console.log('\n⚠ Security Warnings:');
    warnings.forEach((warning, index) => {
      const icon = warning.level === 'critical' ? '🔴' : 
                   warning.level === 'high' ? '🟠' : '🟡';
      console.log(`  ${icon} ${index + 1}. [${warning.level.toUpperCase()}] ${warning.message}`);
    });
  }
  
  console.log('\n========================================\n');
  
  return result.isValid && warnings.filter(w => w.level === 'critical').length === 0;
};

/**
 * Validate and load configuration
 * @returns {object} - Validated configuration
 */
const loadConfig = () => {
  const result = validateConfig();
  const isValid = displayValidationResults(result);
  
  if (!isValid) {
    console.error('✗ Configuration validation failed. Please fix the errors above.');
    process.exit(1);
  }
  
  return result.config;
};

/**
 * Test all service connections
 * @returns {Promise<boolean>} - All connections successful
 */
const testConnections = async () => {
  console.log('\n========================================');
  console.log('   TESTING SERVICE CONNECTIONS');
  console.log('========================================\n');
  
  const results = {
    database: false,
    redis: false,
    email: false,
    storage: false,
  };
  
  // Test database connection
  try {
    const { testConnection: testDb } = require('./database');
    results.database = await testDb();
  } catch (error) {
    console.error('✗ Database test failed:', error.message);
  }
  
  // Test Redis connection
  try {
    const { testConnection: testRedis } = require('./redis');
    results.redis = await testRedis();
  } catch (error) {
    console.error('✗ Redis test failed:', error.message);
  }
  
  // Test email configuration (if enabled)
  if (process.env.FEATURE_EMAIL_VERIFICATION === 'true') {
    try {
      const { testConnection: testEmail } = require('./email');
      results.email = await testEmail();
    } catch (error) {
      console.error('✗ Email test failed:', error.message);
    }
  } else {
    console.log('⊘ Email testing skipped (feature disabled)');
    results.email = true; // Not required
  }
  
  // Test storage initialization
  try {
    const { storage } = require('./storage');
    await storage.initialize();
    results.storage = true;
  } catch (error) {
    console.error('✗ Storage initialization failed:', error.message);
  }
  
  console.log('\n========================================');
  console.log('   CONNECTION TEST RESULTS');
  console.log('========================================\n');
  
  Object.entries(results).forEach(([service, success]) => {
    console.log(`  ${success ? '✓' : '✗'} ${service}: ${success ? 'OK' : 'FAILED'}`);
  });
  
  console.log('\n========================================\n');
  
  const allSuccess = Object.values(results).every(r => r === true);
  
  if (!allSuccess) {
    console.error('⚠ Some service connections failed. The application may not work correctly.');
    if (process.env.NODE_ENV === 'production') {
      console.error('✗ Cannot start application with failed connections in production mode.');
      process.exit(1);
    }
  }
  
  return allSuccess;
};

module.exports = {
  validateConfig,
  checkSecurityIssues,
  displayValidationResults,
  loadConfig,
  testConnections,
};
