const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'obe_user',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'obe_system',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  maxIdle: parseInt(process.env.DB_MAX_IDLE) || 10,
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
};

// Query helper function
// Uses pool.query instead of pool.execute to support LIMIT/OFFSET parameters
// pool.execute (prepared statements) has issues with LIMIT/OFFSET in some MySQL versions
// Returns [rows, fields] to match mysql2's native response pattern
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result; // Returns [rows, fields] array
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

// Transaction helper function
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Execute helper function - delegates to pool.execute for consistency
const execute = async (sql, params = []) => {
  try {
    return await pool.execute(sql, params);
  } catch (error) {
    console.error('Execute error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  execute,
  transaction,
  testConnection
};
