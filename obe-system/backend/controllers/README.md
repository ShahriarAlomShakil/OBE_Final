# Controllers

This directory contains all Express.js route controllers for the OBE System.

## BaseController

The `BaseController` class provides standard REST operations that all controllers should extend.

### Features

- ✅ Standard REST methods (index, show, store, update, destroy)
- ✅ Automatic error handling with asyncHandler
- ✅ Consistent JSON response format
- ✅ Built-in pagination support
- ✅ Input sanitization
- ✅ Query parameter parsing

### Response Format

All responses follow this consistent structure:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Usage Example

```javascript
const BaseController = require('./BaseController');
const FacultyService = require('../services/FacultyService');

class FacultyController extends BaseController {
  constructor() {
    super(new FacultyService());
  }

  // Inherits: index, show, store, update, destroy

  // Add custom methods
  getDepartments = this.customAction(async (req, res) => {
    const { id } = req.params;
    const departments = await this.service.getDepartments(id);
    
    return {
      data: departments,
      message: 'Departments retrieved successfully'
    };
  });
}

module.exports = new FacultyController();
```

### Available Methods

#### `index(req, res)`
- **Route:** `GET /resource`
- **Purpose:** List all resources with pagination
- **Query Params:** 
  - `page` (default: 1)
  - `limit` (default: 10)
  - `sort` (default: 'id')
  - `order` ('ASC' or 'DESC', default: 'ASC')
  - Any other params are treated as filters

#### `show(req, res)`
- **Route:** `GET /resource/:id`
- **Purpose:** Get a single resource by ID

#### `store(req, res)`
- **Route:** `POST /resource`
- **Purpose:** Create a new resource
- **Body:** Resource data (automatically sanitized)

#### `update(req, res)`
- **Route:** `PUT/PATCH /resource/:id`
- **Purpose:** Update an existing resource
- **Body:** Updated resource data (automatically sanitized)

#### `destroy(req, res)`
- **Route:** `DELETE /resource/:id`
- **Purpose:** Delete a resource

### Custom Actions

For custom controller methods, use the `customAction` wrapper:

```javascript
getStats = this.customAction(async (req, res) => {
  const stats = await this.service.getStatistics();
  return {
    data: stats,
    message: 'Statistics retrieved successfully',
    meta: { calculatedAt: new Date() }
  };
});
```

### Router Setup Example

```javascript
const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/FacultyController');
const { authenticate } = require('../middlewares/auth');

// Standard REST routes
router.get('/', authenticate, facultyController.index);
router.get('/:id', authenticate, facultyController.show);
router.post('/', authenticate, facultyController.store);
router.put('/:id', authenticate, facultyController.update);
router.delete('/:id', authenticate, facultyController.destroy);

// Custom routes
router.get('/:id/departments', authenticate, facultyController.getDepartments);

module.exports = router;
```

### Input Sanitization

All request body and query parameters are automatically sanitized to prevent:
- XSS attacks (HTML tags removed)
- Script injection
- SQL injection (when combined with parameterized queries)

### Pagination

Pagination is automatically handled for `index()` method:

```bash
# Request
GET /api/v1/faculties?page=2&limit=20&sort=name&order=ASC&is_active=true

# Response
{
  "success": true,
  "data": [...],
  "message": "Records retrieved successfully",
  "meta": {
    "pagination": {
      "total": 45,
      "page": 2,
      "limit": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

### Error Handling

Errors are automatically caught by `asyncHandler` and passed to the error handling middleware. The service layer should throw appropriate errors (ValidationError, NotFoundError, etc.) which will be formatted by the error handler.

## Next Steps

1. Create specific controllers by extending BaseController
2. Implement custom methods as needed
3. Setup routes for each controller
4. Apply authentication and authorization middleware
