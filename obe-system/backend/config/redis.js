const Redis = require('ioredis');
require('dotenv').config();

// Redis configuration options
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  lazyConnect: true,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'obe:',
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  console.log('✓ Redis connecting...');
});

redisClient.on('ready', () => {
  console.log('✓ Redis connection ready');
});

redisClient.on('error', (error) => {
  console.error('✗ Redis connection error:', error.message);
});

redisClient.on('close', () => {
  console.log('✗ Redis connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('⟳ Redis reconnecting...');
});

redisClient.on('end', () => {
  console.log('✗ Redis connection ended');
});

// Test connection function
const testConnection = async () => {
  try {
    await redisClient.connect();
    await redisClient.ping();
    console.log('✓ Redis connection successful');
    return true;
  } catch (error) {
    console.error('✗ Redis connection test failed:', error.message);
    return false;
  }
};

// Cache helper functions
const cache = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = 3600) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  },

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  },

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<number>} - Number of keys deleted
   */
  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Redis DEL pattern error:', error.message);
      return 0;
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Exists status
   */
  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error.message);
      return false;
    }
  },

  /**
   * Set expiration on key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async expire(key, ttl) {
    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error.message);
      return false;
    }
  },

  /**
   * Increment counter
   * @param {string} key - Cache key
   * @param {number} increment - Increment value (default: 1)
   * @returns {Promise<number>} - New value
   */
  async incr(key, increment = 1) {
    try {
      return await redisClient.incrby(key, increment);
    } catch (error) {
      console.error('Redis INCR error:', error.message);
      return 0;
    }
  },

  /**
   * Add to set
   * @param {string} key - Set key
   * @param {string|string[]} members - Members to add
   * @returns {Promise<number>} - Number of members added
   */
  async sadd(key, ...members) {
    try {
      return await redisClient.sadd(key, ...members);
    } catch (error) {
      console.error('Redis SADD error:', error.message);
      return 0;
    }
  },

  /**
   * Get set members
   * @param {string} key - Set key
   * @returns {Promise<string[]>} - Set members
   */
  async smembers(key) {
    try {
      return await redisClient.smembers(key);
    } catch (error) {
      console.error('Redis SMEMBERS error:', error.message);
      return [];
    }
  },

  /**
   * Remove from set
   * @param {string} key - Set key
   * @param {string|string[]} members - Members to remove
   * @returns {Promise<number>} - Number of members removed
   */
  async srem(key, ...members) {
    try {
      return await redisClient.srem(key, ...members);
    } catch (error) {
      console.error('Redis SREM error:', error.message);
      return 0;
    }
  },

  /**
   * Flush all data in current database
   * @returns {Promise<boolean>} - Success status
   */
  async flushdb() {
    try {
      await redisClient.flushdb();
      return true;
    } catch (error) {
      console.error('Redis FLUSHDB error:', error.message);
      return false;
    }
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    await redisClient.quit();
    console.log('✓ Redis connection closed gracefully');
  } catch (error) {
    console.error('✗ Error closing Redis connection:', error.message);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  redisClient,
  cache,
  testConnection,
  shutdown
};
