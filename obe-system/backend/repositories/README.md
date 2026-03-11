# Repository Layer Documentation

## Overview

The Repository layer provides an abstraction over the data access layer, handling complex queries, transactions, batch operations, and data aggregation. It sits between the Model and Service layers.

## Architecture

```
Controller → Service → Repository → Model → Database
```

## BaseRepository Features

### 1. Data Access Patterns

#### Basic Queries
```javascript
// Find by ID
const user = await userRepository.findById(1);

// Find by IDs (batch)
const users = await userRepository.findByIds([1, 2, 3]);

// Find one by conditions
const user = await userRepository.findOne({ email: 'user@example.com' });

// Find all with conditions
const users = await userRepository.findAll({ role: 'teacher' });

// Check existence
const exists = await userRepository.exists({ email: 'user@example.com' });

// Count records
const count = await userRepository.count({ active: true });
```

#### Advanced Queries
```javascript
// Pagination
const result = await userRepository.paginate(
  { department_id: 1 },
  { page: 1, limit: 20, orderBy: 'created_at DESC' }
);
// Returns: { data: [...], pagination: { page, limit, total, ... } }

// Aggregation
const totalMarks = await marksRepository.aggregate(
  'SUM',
  'marks_obtained',
  { student_id: 1 }
);

// Group By
const resultsByDepartment = await studentRepository.groupBy({
  groupBy: 'department_id',
  select: {
    department: 'department_id',
    total: 'COUNT(*)',
    avgCGPA: 'AVG(cgpa)'
  },
  conditions: { active: true },
  having: 'COUNT(*) > 5'
});
```

### 2. Transaction Support

#### Simple Transaction
```javascript
const result = await repository.transaction(async (conn) => {
  // All operations within this callback use the same transaction
  const user = await repository.createWithConnection(conn, userData);
  await repository.updateWithConnection(conn, profileId, profileData);
  return user;
});
```

#### Complex Transaction with Multiple Repositories
```javascript
const enrollStudent = async (studentData, enrollmentData) => {
  return await studentRepository.transaction(async (conn) => {
    // Create student
    const student = await studentRepository.createWithConnection(
      conn,
      studentData
    );
    
    // Create enrollment
    const enrollment = await enrollmentRepository.createWithConnection(
      conn,
      { ...enrollmentData, student_id: student.id }
    );
    
    // Update course count
    await courseRepository.updateWithConnection(
      conn,
      enrollmentData.course_id,
      { enrolled_count: db.raw('enrolled_count + 1') }
    );
    
    return { student, enrollment };
  });
};
```

### 3. Batch Operations

#### Batch Insert
```javascript
// Insert multiple records at once
const students = [
  { name: 'Student 1', email: 'student1@example.com' },
  { name: 'Student 2', email: 'student2@example.com' },
  { name: 'Student 3', email: 'student3@example.com' }
];

const result = await studentRepository.batchInsert(students);
// Returns: { insertedCount: 3, firstInsertId: 100 }

// With options
await studentRepository.batchInsert(students, { 
  ignore: true  // Use INSERT IGNORE
});

await studentRepository.batchInsert(students, { 
  replace: true  // Use REPLACE INTO
});
```

#### Batch Update
```javascript
// Update multiple records
const updates = [
  { id: 1, data: { status: 'active' } },
  { id: 2, data: { status: 'active' } },
  { id: 3, data: { status: 'inactive' } }
];

const updatedCount = await studentRepository.batchUpdate(updates);
// Returns: 3
```

#### Batch Delete
```javascript
// Soft delete multiple records
const deletedCount = await studentRepository.batchDelete([1, 2, 3]);

// Hard delete multiple records
const deletedCount = await studentRepository.batchDelete([1, 2, 3], false);
```

#### Upsert (Insert or Update)
```javascript
const records = [
  { email: 'user1@example.com', name: 'User 1', score: 85 },
  { email: 'user2@example.com', name: 'User 2', score: 90 }
];

const result = await studentRepository.upsert(
  records,
  ['email'],  // Unique keys to check
  ['name', 'score']  // Columns to update on duplicate
);
// Returns: { insertedCount: 1, updatedCount: 1 }
```

### 4. Raw Queries

```javascript
// Execute custom SQL
const results = await repository.rawQuery(
  `SELECT s.*, AVG(m.marks) as avg_marks
   FROM students s
   JOIN marks m ON s.id = m.student_id
   WHERE s.department_id = ?
   GROUP BY s.id`,
  [departmentId]
);

// Within transaction
await repository.transaction(async (conn) => {
  const results = await repository.rawQueryWithConnection(
    conn,
    'UPDATE courses SET status = ? WHERE id = ?',
    ['published', courseId]
  );
});
```

## Creating Custom Repositories

### Example: UserRepository

```javascript
const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(new User());
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  /**
   * Find active teachers
   */
  async findActiveTeachers(departmentId = null) {
    const conditions = { 
      role: 'teacher',
      status: 'active'
    };
    
    if (departmentId) {
      conditions.department_id = departmentId;
    }
    
    return await this.findAll(conditions);
  }

  /**
   * Get users with role counts
   */
  async getUserCountsByRole() {
    return await this.groupBy({
      groupBy: 'role',
      select: {
        role: 'role',
        count: 'COUNT(*)',
        active: 'SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END)'
      }
    });
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId) {
    return await this.transaction(async (conn) => {
      return await this.updateWithConnection(conn, userId, {
        last_login: new Date(),
        login_count: db.raw('login_count + 1')
      });
    });
  }

  /**
   * Bulk activate users
   */
  async bulkActivate(userIds) {
    const updates = userIds.map(id => ({
      id,
      data: { status: 'active', updated_at: new Date() }
    }));
    
    return await this.batchUpdate(updates);
  }
}

module.exports = UserRepository;
```

### Example: CourseRepository

```javascript
const BaseRepository = require('./BaseRepository');
const Course = require('../models/Course');

class CourseRepository extends BaseRepository {
  constructor() {
    super(new Course());
  }

  /**
   * Find courses with enrollment count
   */
  async findCoursesWithEnrollmentCount(filters = {}) {
    const { department_id, semester_id } = filters;
    
    let conditions = '';
    const params = [];
    
    if (department_id) {
      conditions += ' AND c.department_id = ?';
      params.push(department_id);
    }
    
    if (semester_id) {
      conditions += ' AND co.semester_id = ?';
      params.push(semester_id);
    }
    
    return await this.rawQuery(
      `SELECT 
        c.*,
        COUNT(DISTINCT ce.student_id) as enrollment_count
      FROM courses c
      LEFT JOIN course_offerings co ON c.id = co.course_id
      LEFT JOIN course_enrollments ce ON co.id = ce.course_offering_id
      WHERE c.deleted_at IS NULL ${conditions}
      GROUP BY c.id`,
      params
    );
  }

  /**
   * Enroll students in bulk
   */
  async bulkEnrollStudents(courseOfferingId, studentIds) {
    const enrollments = studentIds.map(studentId => ({
      course_offering_id: courseOfferingId,
      student_id: studentId,
      enrollment_date: new Date(),
      status: 'active'
    }));
    
    return await this.batchInsert(enrollments);
  }

  /**
   * Calculate course statistics
   */
  async getCourseStatistics(courseId) {
    return await this.rawQuery(
      `SELECT 
        c.id,
        c.course_code,
        c.course_name,
        COUNT(DISTINCT co.id) as total_offerings,
        COUNT(DISTINCT ce.student_id) as total_enrollments,
        AVG(cr.marks_obtained) as avg_marks
      FROM courses c
      LEFT JOIN course_offerings co ON c.id = co.course_id
      LEFT JOIN course_enrollments ce ON co.id = ce.course_offering_id
      LEFT JOIN course_results cr ON ce.id = cr.enrollment_id
      WHERE c.id = ? AND c.deleted_at IS NULL
      GROUP BY c.id`,
      [courseId]
    );
  }
}

module.exports = CourseRepository;
```

## Best Practices

### 1. Use Repositories for Complex Queries
- Keep Models focused on basic CRUD
- Move complex queries to Repositories
- Use Repositories for joins, aggregations, and data transformations

### 2. Transaction Guidelines
- Always use transactions for multi-step operations
- Keep transactions short and focused
- Handle rollback scenarios properly
- Release connections in finally blocks (handled automatically)

### 3. Batch Operations
- Use batch operations for bulk inserts/updates (>10 records)
- Consider chunking very large datasets (>1000 records)
- Monitor transaction size to avoid timeout issues

### 4. Performance Tips
- Use appropriate indexes (check `database/migrations/089_add_performance_indexes.sql`)
- Avoid N+1 queries - use joins or batch loading
- Cache frequently accessed data at Service layer
- Use pagination for large result sets
- Monitor slow queries and optimize

### 5. Error Handling
```javascript
try {
  const result = await repository.findById(id);
  if (!result) {
    throw new Error('Record not found');
  }
  return result;
} catch (error) {
  // Repository errors are already wrapped with context
  // Add additional context at Service layer if needed
  throw error;
}
```

### 6. Testing Repositories
```javascript
const UserRepository = require('../repositories/UserRepository');

describe('UserRepository', () => {
  let repository;
  
  beforeAll(() => {
    repository = new UserRepository();
  });
  
  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = await repository.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });
    
    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });
  
  describe('batchInsert', () => {
    it('should insert multiple users', async () => {
      const users = [
        { email: 'user1@test.com', name: 'User 1' },
        { email: 'user2@test.com', name: 'User 2' }
      ];
      
      const result = await repository.batchInsert(users);
      expect(result.insertedCount).toBe(2);
      expect(result.firstInsertId).toBeGreaterThan(0);
    });
  });
});
```

## Migration from Model Direct Usage

### Before (Using Model Directly in Service)
```javascript
class UserService {
  async getUsers(filters) {
    const userModel = new User();
    return await userModel.findAll(filters);
  }
}
```

### After (Using Repository)
```javascript
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  async getUsers(filters) {
    return await this.userRepository.findAll(filters);
  }
  
  async getUsersWithStats(filters) {
    // Complex query that doesn't belong in Model
    return await this.userRepository.findUsersWithEnrollmentStats(filters);
  }
}
```

## Summary

The Repository layer provides:
- ✅ Clean separation of concerns
- ✅ Transaction management
- ✅ Batch operations for performance
- ✅ Complex query encapsulation
- ✅ Reusable data access patterns
- ✅ Easier testing and mocking
- ✅ Better maintainability

Use Repositories for any data access logic beyond simple CRUD operations!
