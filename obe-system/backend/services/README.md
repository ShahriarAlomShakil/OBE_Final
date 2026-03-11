# BaseService Documentation

## Overview

The `BaseService` class provides a robust foundation for implementing service layer logic in the OBE System. It includes built-in support for validation (Joi), error handling, transaction management, and lifecycle hooks.

## Features

✅ **CRUD Operations**: Standard methods for all database operations  
✅ **Validation**: Integrated Joi schema validation  
✅ **Error Handling**: Custom AppError classes for consistent error responses  
✅ **Transaction Support**: Built-in transaction management  
✅ **Lifecycle Hooks**: beforeCreate, afterCreate, beforeUpdate, afterUpdate, beforeDelete, afterDelete  
✅ **Pagination**: Built-in pagination support  
✅ **Bulk Operations**: Bulk create and update with transaction support  

---

## Installation & Setup

### 1. Ensure Dependencies

Make sure these packages are installed:

```bash
npm install joi mysql2
```

### 2. File Structure

```
obe-system/backend/
├── services/
│   ├── BaseService.js                    # Base service class (created ✅)
│   └── FacultyService.example.js         # Example implementation (created ✅)
├── utils/
│   └── AppError.js                       # Custom error classes (created ✅)
├── models/
│   └── BaseModel.js                      # Base model (already exists ✅)
└── repositories/
    └── BaseRepository.js                 # Base repository (already exists ✅)
```

---

## Usage Guide

### Creating a New Service

Here's how to create a service for any resource (e.g., Faculty, Department, Course):

```javascript
const Joi = require('joi');
const BaseService = require('./BaseService');
const Faculty = require('../models/Faculty');

class FacultyService extends BaseService {
  constructor() {
    const facultyModel = new Faculty();
    super(facultyModel, 'Faculty'); // Pass model and resource name
    
    this.defineSchemas();
  }

  defineSchemas() {
    // Validation schema for creating
    this.schemas.create = Joi.object({
      name: Joi.string().min(3).max(100).required(),
      short_name: Joi.string().max(20).required(),
      description: Joi.string().max(500).optional(),
      is_active: Joi.boolean().default(true)
    });

    // Validation schema for updating (all fields optional)
    this.schemas.update = Joi.object({
      name: Joi.string().min(3).max(100).optional(),
      short_name: Joi.string().max(20).optional(),
      description: Joi.string().max(500).optional(),
      is_active: Joi.boolean().optional()
    });

    // Validation schema for filters
    this.schemas.filters = Joi.object({
      name: Joi.string().optional(),
      is_active: Joi.boolean().optional(),
      search: Joi.string().optional()
    });
  }
}

module.exports = FacultyService;
```

---

## Standard Methods

### 1. getAll(filters, pagination, options)

Retrieve all records with filtering and pagination.

```javascript
const facultyService = new FacultyService();

// Basic usage
const result = await facultyService.getAll();

// With filters
const result = await facultyService.getAll(
  { is_active: true },           // filters
  { page: 1, limit: 10 }         // pagination
);

// With sorting
const result = await facultyService.getAll(
  { is_active: true },
  { 
    page: 1, 
    limit: 20,
    sortBy: 'name',
    sortOrder: 'ASC'
  }
);

// Response format:
// {
//   success: true,
//   data: [...],
//   meta: {
//     total: 50,
//     page: 1,
//     limit: 10,
//     totalPages: 5,
//     hasNext: true,
//     hasPrev: false
//   }
// }
```

### 2. getById(id, options)

Retrieve a single record by ID.

```javascript
const result = await facultyService.getById(1);

// Response:
// {
//   success: true,
//   data: { id: 1, name: 'Engineering', ... }
// }

// With options (e.g., relations)
const result = await facultyService.getById(1, {
  relations: ['departments']
});
```

### 3. create(data, options)

Create a new record with validation.

```javascript
const result = await facultyService.create({
  name: 'Faculty of Engineering',
  short_name: 'FOE',
  description: 'Engineering programs',
  is_active: true
});

// Response:
// {
//   success: true,
//   data: { id: 5, name: 'Faculty of Engineering', ... },
//   message: 'Faculty created successfully'
// }
```

### 4. update(id, data, options)

Update an existing record.

```javascript
const result = await facultyService.update(1, {
  name: 'Updated Faculty Name',
  is_active: false
});

// Response:
// {
//   success: true,
//   data: { id: 1, name: 'Updated Faculty Name', ... },
//   message: 'Faculty updated successfully'
// }
```

### 5. delete(id, options)

Delete a record (soft delete by default).

```javascript
// Soft delete
const result = await facultyService.delete(1);

// Permanent delete
const result = await facultyService.delete(1, { force: true });

// Response:
// {
//   success: true,
//   message: 'Faculty deleted successfully',
//   data: { id: 1, deleted: true }
// }
```

---

## Lifecycle Hooks

Override these methods in your service to add custom business logic:

### beforeCreate(data)

Execute logic before creating a record.

```javascript
async beforeCreate(data) {
  // Example: Convert name to title case
  data.name = data.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Example: Check for duplicates
  const existing = await this.findOne({ short_name: data.short_name });
  if (existing) {
    throw new ConflictError('Faculty with this short name already exists');
  }

  return data;
}
```

### afterCreate(data, result)

Execute logic after creating a record.

```javascript
async afterCreate(data, result) {
  // Example: Send notification
  await notificationService.notify({
    type: 'FACULTY_CREATED',
    data: result
  });

  // Example: Create related records
  await auditService.log({
    action: 'CREATE',
    resource: 'Faculty',
    resourceId: result.id
  });

  return result;
}
```

### beforeUpdate(id, data)

Execute logic before updating a record.

```javascript
async beforeUpdate(id, data) {
  // Example: Prevent certain updates
  if (data.short_name) {
    const departments = await this.getDepartments(id);
    if (departments.length > 0) {
      throw new ValidationError('Cannot change short name for faculty with departments');
    }
  }

  return data;
}
```

### afterUpdate(id, data, result)

Execute logic after updating a record.

```javascript
async afterUpdate(id, data, result) {
  // Example: Invalidate cache
  await cacheService.invalidate(`faculty:${id}`);

  // Example: Update related records
  if (data.is_active === false) {
    await departmentService.deactivateByFaculty(id);
  }

  return result;
}
```

### beforeDelete(id) & afterDelete(id)

Execute logic before/after deletion.

```javascript
async beforeDelete(id) {
  // Example: Check dependencies
  const departments = await this.getDepartments(id);
  if (departments.length > 0) {
    throw new ValidationError('Cannot delete faculty with existing departments');
  }
}

async afterDelete(id) {
  // Example: Clean up related records
  await cacheService.invalidate(`faculty:${id}`);
}
```

---

## Transaction Management

### Using transaction() method

Automatically handles commit/rollback:

```javascript
const result = await facultyService.transaction(async (connection) => {
  // Create faculty
  const faculty = await facultyService.create({
    name: 'New Faculty',
    short_name: 'NF'
  });

  // Create departments in same transaction
  await departmentService.create({
    faculty_id: faculty.data.id,
    name: 'Computer Science'
  });

  return faculty;
});
// Transaction auto-commits if successful, auto-rolls back on error
```

### Manual transaction control

```javascript
try {
  await facultyService.beginTransaction();

  const faculty = await facultyService.create({ name: 'Faculty A' });
  await departmentService.create({ faculty_id: faculty.data.id, name: 'Dept A' });

  await facultyService.commit();
} catch (error) {
  await facultyService.rollback();
  throw error;
}
```

---

## Bulk Operations

### bulkCreate(dataArray)

Create multiple records in a transaction:

```javascript
const result = await facultyService.bulkCreate([
  { name: 'Faculty 1', short_name: 'F1' },
  { name: 'Faculty 2', short_name: 'F2' },
  { name: 'Faculty 3', short_name: 'F3' }
]);

// Response:
// {
//   success: true,
//   data: [...],
//   message: '3 Faculty records created successfully',
//   meta: { count: 3 }
// }
```

### bulkUpdate(updates)

Update multiple records in a transaction:

```javascript
const result = await facultyService.bulkUpdate([
  { id: 1, data: { is_active: false } },
  { id: 2, data: { is_active: false } },
  { id: 3, data: { is_active: false } }
]);
```

---

## Validation

### Joi Schema Examples

```javascript
this.schemas.create = Joi.object({
  // Required string with length constraints
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),

  // Optional string with default
  status: Joi.string()
    .valid('active', 'inactive')
    .default('active'),

  // Number with range
  credit_hours: Joi.number()
    .integer()
    .min(1)
    .max(6)
    .required(),

  // Email validation
  email: Joi.string()
    .email()
    .required(),

  // Date validation
  start_date: Joi.date()
    .iso()
    .required(),

  // Boolean with default
  is_active: Joi.boolean()
    .default(true),

  // Array of strings
  tags: Joi.array()
    .items(Joi.string())
    .optional(),

  // Nested object
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    postal_code: Joi.string().pattern(/^\d{4}$/)
  }).optional(),

  // Custom validation
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
    })
});
```

---

## Error Handling

### Available Error Types

```javascript
const {
  AppError,
  ValidationError,      // 400 - Validation failures
  NotFoundError,        // 404 - Resource not found
  UnauthorizedError,    // 401 - Authentication required
  ForbiddenError,       // 403 - Insufficient permissions
  ConflictError,        // 409 - Resource conflicts (duplicates)
  DatabaseError,        // 500 - Database operation failures
  BadRequestError       // 400 - Malformed requests
} = require('../utils/AppError');
```

### Throwing Errors

```javascript
// In your service methods
async beforeCreate(data) {
  const existing = await this.findOne({ email: data.email });
  if (existing) {
    throw new ConflictError('Email already exists', { email: data.email });
  }
  return data;
}

// Custom validation
if (data.credit_hours < 1 || data.credit_hours > 6) {
  throw new ValidationError('Credit hours must be between 1 and 6', {
    field: 'credit_hours',
    value: data.credit_hours
  });
}

// Not found
const user = await this.model.findById(userId);
if (!user) {
  throw new NotFoundError('User', userId);
}
```

---

## Utility Methods

### exists(id)

Check if a record exists:

```javascript
const exists = await facultyService.exists(1);
// Returns: true or false
```

### count(filters)

Count records with filters:

```javascript
const total = await facultyService.count({ is_active: true });
// Returns: 15
```

### findOne(conditions, options)

Find one record by conditions:

```javascript
const faculty = await facultyService.findOne({ 
  short_name: 'FOE' 
});
```

---

## Adding Custom Methods

Extend your service with custom business logic:

```javascript
class FacultyService extends BaseService {
  // ... constructor and schemas ...

  /**
   * Get all departments for a faculty
   */
  async getDepartments(facultyId) {
    await this.getById(facultyId); // Verify exists
    return await Department.findAll({ 
      where: { faculty_id: facultyId } 
    });
  }

  /**
   * Get faculty statistics
   */
  async getStatistics(facultyId) {
    await this.getById(facultyId);
    
    const [departments, teachers, students] = await Promise.all([
      departmentService.count({ faculty_id: facultyId }),
      teacherService.count({ faculty_id: facultyId }),
      studentService.count({ faculty_id: facultyId })
    ]);

    return {
      success: true,
      data: {
        totalDepartments: departments,
        totalTeachers: teachers,
        totalStudents: students
      }
    };
  }

  /**
   * Toggle active status
   */
  async toggleActive(facultyId) {
    const { data: faculty } = await this.getById(facultyId);
    return await this.update(facultyId, {
      is_active: !faculty.is_active
    });
  }
}
```

---

## Integration with Controllers

Use services in your controllers:

```javascript
const FacultyService = require('../services/FacultyService');
const facultyService = new FacultyService();

class FacultyController {
  async index(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      
      const result = await facultyService.getAll(
        filters,
        { page, limit, sortBy, sortOrder }
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const result = await facultyService.getById(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async store(req, res, next) {
    try {
      const result = await facultyService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const result = await facultyService.update(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async destroy(req, res, next) {
    try {
      const result = await facultyService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FacultyController();
```

---

## Best Practices

1. **Always define validation schemas** in the constructor
2. **Use lifecycle hooks** for business logic, not in controllers
3. **Throw appropriate error types** for better error handling
4. **Use transactions** for operations that modify multiple tables
5. **Keep controllers thin** - put business logic in services
6. **Add custom methods** for domain-specific operations
7. **Document your methods** with JSDoc comments
8. **Test services independently** before integration

---

## Testing Example

```javascript
const FacultyService = require('../services/FacultyService');

describe('FacultyService', () => {
  let facultyService;

  beforeEach(() => {
    facultyService = new FacultyService();
  });

  describe('create', () => {
    it('should create a faculty successfully', async () => {
      const data = {
        name: 'Faculty of Science',
        short_name: 'FOS',
        is_active: true
      };

      const result = await facultyService.create(data);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data.name).toBe('Faculty of Science');
    });

    it('should throw validation error for invalid data', async () => {
      const data = { name: 'AB' }; // Too short

      await expect(facultyService.create(data))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

---

## Next Steps

1. ✅ BaseService created
2. ✅ AppError utilities created
3. ✅ Example service created
4. ⏭️ Create BaseController (Step 1.2)
5. ⏭️ Create error handling middleware (Step 1.3)
6. ⏭️ Start implementing actual models and services

---

## Support

For questions or issues, refer to:
- [EXAM_DEVELOPMENT_PLAN.md](../../../EXAM_DEVELOPMENT_PLAN.md)
- BaseModel documentation
- BaseRepository documentation

---

**Created:** February 3, 2026  
**Status:** ✅ Complete - Ready for use
