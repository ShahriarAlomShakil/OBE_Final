/**
 * OBE System - Main Application Entry Point
 * 
 * @description Express application setup with middleware, routes, and error handling
 * @author OBE System Team
 * @version 1.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import configurations
const appConfig = require('./config/app');
const logger = require('./config/logger');

// Import middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import routes
const apiRouter = require('./routes');

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================

const app = express();

// ============================================================================
// TRUST PROXY (for apps behind reverse proxy like nginx)
// ============================================================================

if (appConfig.server.trustProxy) {
  app.set('trust proxy', 1);
}

// ============================================================================
// SECURITY MIDDLEWARES
// ============================================================================

// Helmet - Security headers
if (appConfig.security.helmet.enabled) {
  app.use(helmet({
    contentSecurityPolicy: appConfig.security.helmet.contentSecurityPolicy ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
}

// CORS - Cross-Origin Resource Sharing
if (appConfig.server.corsEnabled) {
  app.use(cors(appConfig.security.cors));
}

// Rate Limiting - Prevent brute-force attacks
if (appConfig.security.rateLimiting.enabled) {
  const limiter = rateLimit({
    windowMs: appConfig.security.rateLimiting.windowMs,
    max: appConfig.security.rateLimiting.max,
    standardHeaders: appConfig.security.rateLimiting.standardHeaders,
    legacyHeaders: appConfig.security.rateLimiting.legacyHeaders,
    skipSuccessfulRequests: appConfig.security.rateLimiting.skipSuccessfulRequests,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: appConfig.security.rateLimiting.windowMs / 1000,
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: appConfig.security.rateLimiting.windowMs / 1000,
      });
    },
  });

  // Apply rate limiter to all routes
  app.use(limiter);

  // Stricter rate limit for authentication routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: true,
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.',
    },
  });

  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth/forgot-password', authLimiter);
}

// Data Sanitization against NoSQL injection
if (appConfig.security.mongoSanitize.enabled) {
  app.use(mongoSanitize());
}

// Data Sanitization against XSS
if (appConfig.security.xssProtection.enabled) {
  app.use(xss());
}

// Prevent HTTP Parameter Pollution
if (appConfig.security.hpp.enabled) {
  app.use(hpp());
}

// ============================================================================
// REQUEST PROCESSING MIDDLEWARES
// ============================================================================

// Compression - Compress response bodies
app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Body parser - Parse JSON bodies
app.use(express.json({
  limit: appConfig.server.maxRequestSize,
}));

// Body parser - Parse URL-encoded bodies
app.use(express.urlencoded({
  extended: true,
  limit: appConfig.server.maxRequestSize,
}));

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

// Morgan HTTP request logger
if (appConfig.env === 'development') {
  app.use(morgan('dev'));
} else {
  // Combined format for production with custom stream to winston
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }));
}

// ============================================================================
// API DOCUMENTATION (SWAGGER)
// ============================================================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OBE System API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Outcome-Based Education System',
      contact: {
        name: 'OBE System Team',
        email: 'support@obesystem.edu',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `${appConfig.url}${appConfig.api.prefix}/${appConfig.api.version}`,
        description: `${appConfig.env.charAt(0).toUpperCase() + appConfig.env.slice(1)} Server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Faculties', description: 'Faculty management' },
      { name: 'Departments', description: 'Department management' },
      { name: 'Degrees', description: 'Degree program management' },
      { name: 'Courses', description: 'Course management' },
      { name: 'Course Offerings', description: 'Course offering management' },
      { name: 'Students', description: 'Student management' },
      { name: 'Teachers', description: 'Teacher management' },
      { name: 'Enrollments', description: 'Course enrollment management' },
      { name: 'CLOs', description: 'Course Learning Outcomes' },
      { name: 'PLOs', description: 'Program Learning Outcomes' },
      { name: 'PEOs', description: 'Program Educational Objectives' },
      { name: 'CLO-PLO Mappings', description: 'CLO-PLO mapping management' },
      { name: 'Bloom Taxonomy', description: 'Bloom\'s Taxonomy levels' },
      { name: 'Assessments', description: 'Assessment component management' },
      { name: 'Questions', description: 'Question bank management' },
      { name: 'Marks', description: 'Marks entry and management' },
      { name: 'Attainment', description: 'CLO/PLO attainment calculations' },
      { name: 'Settings', description: 'System settings and thresholds' },
      { name: 'Reports', description: 'Report generation' },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'OBE System API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: 'OBE System API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: appConfig.env,
    version: appConfig.api.version,
    status: {
      api: 'healthy',
      database: 'connected', // This could be enhanced with actual DB connection check
    },
  };

  res.status(200).json(healthCheck);
});

// ============================================================================
// API ROUTES
// ============================================================================

// Mount main API router at /api/v1
app.use(`${appConfig.api.prefix}/${appConfig.api.version}`, apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to OBE System API',
    version: appConfig.api.version,
    documentation: `${appConfig.url}/api-docs`,
    health: `${appConfig.url}/health`,
    endpoints: `${appConfig.url}${appConfig.api.prefix}/${appConfig.api.version}`,
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler - Handle unknown routes
app.use(notFoundHandler);

// Global Error Handler - Handle all errors
app.use(errorHandler);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  // Close server
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  
  // Close database connections
  try {
    const db = require('./config/database');
    await db.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
  
  // Close Redis connections
  try {
    const redis = require('./config/redis');
    await redis.disconnect();
    logger.info('Redis connections closed');
  } catch (error) {
    logger.error('Error closing Redis connections:', error);
  }
  
  process.exit(0);
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log the error
  if (appConfig.env === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Exit immediately on uncaught exception
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

let server;

if (require.main === module) {
  const PORT = appConfig.port;
  const HOST = appConfig.server.host;
  
  server = app.listen(PORT, HOST, () => {
    logger.info(`🚀 OBE System API Server started successfully!`);
    logger.info(`📍 Environment: ${appConfig.env}`);
    logger.info(`🌐 Server running at: ${appConfig.url}`);
    logger.info(`📖 API Documentation: ${appConfig.url}/api-docs`);
    logger.info(`❤️  Health Check: ${appConfig.url}/health`);
    logger.info(`🔗 API Endpoint: ${appConfig.url}${appConfig.api.prefix}/${appConfig.api.version}`);
    logger.info(`⏰ Started at: ${new Date().toISOString()}`);
    
    // Additional development info
    if (appConfig.env === 'development') {
      logger.info(`\n🛠️  Development Tools:`);
      logger.info(`   • Swagger UI: ${appConfig.url}/api-docs`);
      logger.info(`   • Health Check: ${appConfig.url}/health`);
      logger.info(`   • API Info: ${appConfig.url}${appConfig.api.prefix}/${appConfig.api.version}`);
    }
  });
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use`);
    } else {
      logger.error('❌ Server error:', error);
    }
    process.exit(1);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = app;
