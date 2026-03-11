const path = require('path');

/**
 * Centralized configuration index
 * Exports all configuration modules
 */

// Load and validate configuration first
const { loadConfig, testConnections } = require('./validator');

// Load configuration (will exit if validation fails)
const config = loadConfig();

// Export all configurations
module.exports = {
  // Core configurations
  app: require('./app'),
  auth: require('./auth'),
  database: require('./database'),
  redis: require('./redis'),
  email: require('./email'),
  storage: require('./storage'),
  queue: require('./queue'),
  
  // Utilities
  validator: require('./validator'),
  
  // Validated environment config
  env: config,
  
  // Helper to test all connections
  testConnections,
  
  // Quick access to commonly used values
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTesting: config.NODE_ENV === 'test',
  port: config.PORT,
  apiUrl: `${config.APP_URL}${config.API_PREFIX}/${config.API_VERSION}`,
};
