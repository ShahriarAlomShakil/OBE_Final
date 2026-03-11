require('dotenv').config();

// Application Configuration
const appConfig = {
  // Basic app info
  name: process.env.APP_NAME || 'OBE System',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  url: process.env.APP_URL || 'http://localhost:3000',
  
  // API configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000, // 30 seconds
  },
  
  // Frontend configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    buildPath: process.env.FRONTEND_BUILD_PATH || '../frontend/dist'
  },
  
  // Server configuration
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    trustProxy: process.env.TRUST_PROXY === 'true',
    behindProxy: process.env.BEHIND_PROXY === 'true',
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
    corsEnabled: process.env.CORS_ENABLED !== 'false',
  },
  
  // Security configuration
  security: {
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false',
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    },
    cors: {
      origin: process.env.CORS_ORIGIN ? 
        process.env.CORS_ORIGIN.split(',') : 
        [process.env.FRONTEND_URL || 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    },
    rateLimiting: {
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    xssProtection: {
      enabled: process.env.XSS_PROTECTION_ENABLED !== 'false',
    },
    mongoSanitize: {
      enabled: process.env.MONGO_SANITIZE_ENABLED !== 'false',
    },
    hpp: {
      enabled: process.env.HPP_ENABLED !== 'false', // HTTP Parameter Pollution
    }
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    console: process.env.LOG_CONSOLE !== 'false',
    file: {
      enabled: process.env.LOG_FILE_ENABLED !== 'false',
      path: process.env.LOG_FILE_PATH || './logs',
      filename: process.env.LOG_FILENAME || 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
    },
    format: process.env.LOG_FORMAT || 'json', // json or simple
  },
  
  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT) || 20,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT) || 100,
  },
  
  // File upload limits
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_REQUEST) || 5,
    allowedMimeTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv'
      ],
      videos: ['video/mp4', 'video/mpeg', 'video/webm'],
      all: [] // Will be populated from above
    }
  },
  
  // Cache configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 3600, // 1 hour
    prefix: process.env.CACHE_PREFIX || 'obe:cache:',
    ttl: {
      short: 300, // 5 minutes
      medium: 1800, // 30 minutes
      long: 3600, // 1 hour
      veryLong: 86400, // 24 hours
    }
  },
  
  // Session configuration
  session: {
    enabled: process.env.SESSION_ENABLED !== 'false',
    store: process.env.SESSION_STORE || 'redis', // redis or memory
    ttl: parseInt(process.env.SESSION_TTL) || 86400, // 24 hours
    checkPeriod: parseInt(process.env.SESSION_CHECK_PERIOD) || 3600, // 1 hour
  },
  
  // Background jobs
  queue: {
    enabled: process.env.QUEUE_ENABLED !== 'false',
    prefix: process.env.QUEUE_PREFIX || 'obe:queue:',
    defaultJobOptions: {
      attempts: parseInt(process.env.QUEUE_ATTEMPTS) || 3,
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.QUEUE_BACKOFF_DELAY) || 5000,
      },
      removeOnComplete: parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE) || 100,
      removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL) || 50,
    }
  },
  
  // WebSocket configuration
  websocket: {
    enabled: process.env.WEBSOCKET_ENABLED === 'true',
    path: process.env.WEBSOCKET_PATH || '/socket.io',
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL) || 25000,
  },
  
  // Academic year configuration
  academic: {
    sessionFormat: 'YYYY-YYYY', // e.g., 2024-2025
    currentSession: process.env.CURRENT_ACADEMIC_SESSION || null,
    semesterTypes: ['fall', 'spring', 'summer'],
    gradeSystem: {
      type: process.env.GRADE_SYSTEM || '4.0', // 4.0 or 5.0
      passingGrade: parseFloat(process.env.PASSING_GRADE) || 2.0,
    }
  },
  
  // Date and time configuration
  datetime: {
    timezone: process.env.TZ || 'UTC',
    dateFormat: process.env.DATE_FORMAT || 'YYYY-MM-DD',
    timeFormat: process.env.TIME_FORMAT || 'HH:mm:ss',
    datetimeFormat: process.env.DATETIME_FORMAT || 'YYYY-MM-DD HH:mm:ss',
  },
  
  // Feature flags
  features: {
    swagger: process.env.FEATURE_SWAGGER_ENABLED !== 'false',
    maintenance: process.env.MAINTENANCE_MODE === 'true',
    registration: process.env.FEATURE_REGISTRATION_ENABLED !== 'false',
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
    twoFactor: process.env.FEATURE_TWO_FACTOR === 'true',
    socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',
    notifications: process.env.FEATURE_NOTIFICATIONS !== 'false',
    analytics: process.env.FEATURE_ANALYTICS === 'true',
  },
  
  // Monitoring and health check
  monitoring: {
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      path: process.env.HEALTH_CHECK_PATH || '/health',
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      path: process.env.METRICS_PATH || '/metrics',
    }
  },
  
  // Error handling
  errors: {
    stackTrace: process.env.NODE_ENV === 'development',
    logErrors: true,
    sendErrorDetails: process.env.NODE_ENV === 'development',
  },
  
  // Testing configuration
  testing: {
    enabled: process.env.NODE_ENV === 'test',
    mockExternalServices: process.env.MOCK_EXTERNAL_SERVICES === 'true',
  }
};

// Populate all allowed mime types
appConfig.upload.allowedMimeTypes.all = [
  ...appConfig.upload.allowedMimeTypes.images,
  ...appConfig.upload.allowedMimeTypes.documents,
  ...appConfig.upload.allowedMimeTypes.videos
];

// Helper functions
const helpers = {
  /**
   * Check if app is in production
   * @returns {boolean}
   */
  isProduction() {
    return appConfig.env === 'production';
  },

  /**
   * Check if app is in development
   * @returns {boolean}
   */
  isDevelopment() {
    return appConfig.env === 'development';
  },

  /**
   * Check if app is in test mode
   * @returns {boolean}
   */
  isTesting() {
    return appConfig.env === 'test';
  },

  /**
   * Get full API URL
   * @param {string} path - API path
   * @returns {string}
   */
  getApiUrl(path = '') {
    return `${appConfig.url}${appConfig.api.prefix}/${appConfig.api.version}${path}`;
  },

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name
   * @returns {boolean}
   */
  isFeatureEnabled(feature) {
    return appConfig.features[feature] === true;
  },

  /**
   * Get cache key with prefix
   * @param {string} key - Cache key
   * @returns {string}
   */
  getCacheKey(key) {
    return `${appConfig.cache.prefix}${key}`;
  }
};

module.exports = {
  ...appConfig,
  helpers
};
