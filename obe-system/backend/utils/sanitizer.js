/**
 * Input Sanitization Utility
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Sanitize a string by removing/escaping dangerous characters
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Trim whitespace
  return sanitized.trim();
};

/**
 * Recursively sanitize an object
 * @param {Object|Array} obj - Object or array to sanitize
 * @returns {Object|Array} Sanitized object or array
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
};

/**
 * Sanitize request body
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
const sanitizeInput = (body) => {
  return sanitizeObject(body);
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeInput
};
