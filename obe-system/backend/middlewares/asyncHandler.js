/**
 * AsyncHandler Middleware
 * 
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express error handling middleware.
 * 
 * Usage:
 * router.get('/route', asyncHandler(async (req, res, next) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 * 
 * Any error thrown in the async function will be automatically
 * caught and passed to next(error).
 */

/**
 * Async handler wrapper function
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
