# Error Handling Middleware

## Overview

This directory contains the centralized error handling system for the OBE application. It provides consistent error responses, proper logging, and handles various error types including MySQL errors, validation errors, and authentication errors.

## Files

### `errorHandler.js`
Main error handling middleware with:
- Custom AppError class usage
- MySQL error handler
- Joi validation error handler
- JWT error handler
- 404 Not Found handler
- Async error wrapper utility

### Usage in Controllers

```javascript
const { asyncHandler } = require('../middlewares/errorHandler');
const { NotFoundError, ValidationError } = require('../utils/AppError');

// Use asyncHandler to automatically catch errors
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }
  
  res.json({ success: true, data: user });
});

// Validation errors
exports.createUser = asyncHandler(async (req, res) => {
  if (!req.body.email) {
    throw new ValidationError('Email is required');
  }
  
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});
```

### Usage in app.js

```javascript
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// ... other middlewares and routes ...

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);
```

## Error Response Format

All errors return a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "code": "ERROR_CODE",
    "details": {
      "field": "email",
      "value": "invalid@"
    }
  }
}
```

In development mode, stack traces are included:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "stack": "Error stack trace..."
  }
}
```

## Handled Error Types

### 1. MySQL Errors
- **ER_DUP_ENTRY**: Duplicate entry (409 Conflict)
- **ER_NO_REFERENCED_ROW**: Foreign key constraint on insert (400 Bad Request)
- **ER_ROW_IS_REFERENCED**: Foreign key constraint on delete (409 Conflict)
- **ER_BAD_NULL_ERROR**: NOT NULL constraint (400 Validation Error)
- **ER_DATA_TOO_LONG**: Data exceeds column length (400 Validation Error)
- **ECONNREFUSED**: Database connection failed (500 Database Error)
- **PROTOCOL_CONNECTION_LOST**: Connection lost (500 Database Error)

### 2. Validation Errors (400)
- Joi validation failures
- Missing required fields
- Invalid data formats
- Data length violations

### 3. Authentication Errors (401)
- Invalid JWT token
- Expired JWT token
- Missing authentication

### 4. Not Found Errors (404)
- Resource not found
- Invalid route

### 5. Database Errors (500)
- Query failures
- Connection issues
- Transaction failures

## Custom Error Classes

Available from `utils/AppError.js`:

```javascript
const {
  AppError,           // Base error class
  ValidationError,    // 400 - Input validation
  NotFoundError,      // 404 - Resource not found
  UnauthorizedError,  // 401 - Authentication failed
  ForbiddenError,     // 403 - Authorization failed
  ConflictError,      // 409 - Resource conflict
  DatabaseError,      // 500 - Database operation failed
  BadRequestError     // 400 - Malformed request
} = require('../utils/AppError');
```

## Logging

Errors are logged using Winston with different severity levels:

- **500+ errors**: Logged as `error` (red)
- **400-499 errors**: Logged as `warn` (yellow)
- **Other errors**: Logged as `info` (green)

Log files:
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs

Each log entry includes:
- Error message and code
- HTTP method and URL
- User IP and User Agent
- Authenticated user ID (if available)
- Stack trace
- Timestamp

## Examples

### Throwing Custom Errors

```javascript
// Not Found
if (!course) {
  throw new NotFoundError('Course', courseId);
}

// Validation Error
if (marks > totalMarks) {
  throw new ValidationError('Marks cannot exceed total marks', {
    marks,
    totalMarks
  });
}

// Authorization Error
if (user.role !== 'admin') {
  throw new ForbiddenError('Only admins can perform this action');
}

// Database Error
try {
  await db.query('...');
} catch (error) {
  throw new DatabaseError('Failed to fetch records', { originalError: error.message });
}
```

### Async Handler Usage

The `asyncHandler` wrapper eliminates the need for try-catch blocks:

```javascript
// Without asyncHandler (verbose)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// With asyncHandler (clean)
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ success: true, data: user });
});
```

## Best Practices

1. **Always use asyncHandler** for async route handlers
2. **Throw specific errors** instead of generic ones
3. **Include helpful details** in error objects
4. **Don't expose sensitive information** in production
5. **Log errors appropriately** based on severity
6. **Use operational errors** (AppError) for expected failures
7. **Let programming errors crash** (let process manager restart)

## Environment Variables

Configure in `.env`:

```env
NODE_ENV=development          # Hide stack traces in production
LOG_LEVEL=debug              # Logging level (error, warn, info, http, debug)
```

## Testing Error Handling

```javascript
// Test 404
GET /api/v1/nonexistent

// Test validation error
POST /api/v1/users
{ "email": "invalid" }

// Test MySQL duplicate error
POST /api/v1/users
{ "email": "existing@example.com" }

// Test authentication error
GET /api/v1/protected-route
// Without Authorization header
```

## Created By

✅ **Step 1.3 Completed** - Error Handling Middleware  
Date: February 3, 2026  
Part of: OBE System - University Exam Demo Development Plan
