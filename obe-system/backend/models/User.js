/**
 * User Model
 * Handles user authentication, roles, and password management
 * Extends BaseModel for MySQL operations with mysql2
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class User extends BaseModel {
  /**
   * Constructor
   */
  constructor() {
    super('users', 'id');
    
    // Fields that can be mass-assigned
    this.fillable = [
      'first_name',
      'last_name',
      'email',
      'username',
      'password',
      'role',
      'phone',
      'date_of_birth',
      'gender_id',
      'address_id',
      'is_active',
      'email_verified_at',
      'two_factor_enabled'
    ];
    
    // Fields to hide in JSON responses (password, tokens, etc.)
    this.hidden = [
      'password',
      'remember_token',
      'two_factor_secret',
      'two_factor_recovery_codes'
    ];
    
    // Enable soft deletes
    this.softDelete = true;
    
    // Enable timestamps (created_at, updated_at)
    this.timestamps = true;
  }

  /**
   * Valid user roles
   */
  static get ROLES() {
    return {
      ADMIN: 'admin',
      HOD: 'hod',
      TEACHER: 'teacher',
      STUDENT: 'student'
    };
  }

  /**
   * Hash password before creating/updating user
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Create a new user with hashed password
   * @param {Object} data - User data
   * @returns {Promise<Object>} - Created user
   */
  async create(data) {
    try {
      // Hash password if provided
      if (data.password) {
        data.password = await this.hashPassword(data.password);
      }

      // Validate role
      if (data.role && !Object.values(User.ROLES).includes(data.role)) {
        throw new Error(`Invalid role. Must be one of: ${Object.values(User.ROLES).join(', ')}`);
      }

      // Set default role if not provided
      if (!data.role) {
        data.role = User.ROLES.STUDENT;
      }

      // Call parent create method
      const userId = await super.create(data);
      
      // Fetch and return the created user
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Update user with password hashing if password is changed
   * @param {number} id - User ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} - Updated user
   */
  async update(id, data) {
    try {
      // Hash password if being updated
      if (data.password) {
        data.password = await this.hashPassword(data.password);
      }

      // Validate role if being updated
      if (data.role && !Object.values(User.ROLES).includes(data.role)) {
        throw new Error(`Invalid role. Must be one of: ${Object.values(User.ROLES).join(', ')}`);
      }

      // Call parent update method
      await super.update(id, data);
      
      // Fetch and return the updated user
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - User or null
   */
  async findByEmail(email, options = {}) {
    try {
      const { withTrashed = false, includePassword = false } = options;
      
      const select = includePassword ? '*' : this._getSelectColumns();
      
      const whereClause = this.softDelete && !withTrashed
        ? 'WHERE email = ? AND deleted_at IS NULL'
        : 'WHERE email = ?';

      const query = `
        SELECT ${select}
        FROM ${this.tableName}
        ${whereClause}
        LIMIT 1
      `;

      const [rows] = await this.db.query(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }

      // Only hide fields if not including password
      return includePassword ? rows[0] : this._hideFields([rows[0]])[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - User or null
   */
  async findByUsername(username, options = {}) {
    try {
      const { withTrashed = false, includePassword = false } = options;
      
      const select = includePassword ? '*' : this._getSelectColumns();
      
      const whereClause = this.softDelete && !withTrashed
        ? 'WHERE username = ? AND deleted_at IS NULL'
        : 'WHERE username = ?';

      const query = `
        SELECT ${select}
        FROM ${this.tableName}
        ${whereClause}
        LIMIT 1
      `;

      const [rows] = await this.db.query(query, [username]);
      
      if (rows.length === 0) {
        return null;
      }

      // Only hide fields if not including password
      return includePassword ? rows[0] : this._hideFields([rows[0]])[0];
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  /**
   * Verify password against hashed password
   * @param {string} plainPassword - Plain text password to verify
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} - True if successful
   */
  async updatePassword(id, newPassword) {
    try {
      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update only the password field
      const query = `
        UPDATE ${this.tableName}
        SET password = ?, updated_at = NOW()
        WHERE ${this.primaryKey} = ?
      `;

      const [result] = await this.db.query(query, [hashedPassword, id]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  /**
   * Check if user has a specific role
   * @param {Object} user - User object
   * @param {string|Array} roles - Role(s) to check
   * @returns {boolean} - True if user has role
   */
  hasRole(user, roles) {
    if (!user || !user.role) {
      return false;
    }

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  }

  /**
   * Check if user is active
   * @param {Object} user - User object
   * @returns {boolean} - True if active
   */
  isActive(user) {
    return user && user.is_active === 1;
  }

  /**
   * Get user with role-specific related data
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} - User with related data
   */
  async findByIdWithRelations(id) {
    try {
      const user = await this.findById(id);
      
      if (!user) {
        return null;
      }

      // Get role-specific data
      if (user.role === User.ROLES.STUDENT) {
        // Get student profile
        const query = `
          SELECT s.*, d.name as department_name, deg.name as degree_name
          FROM students s
          LEFT JOIN departments d ON s.department_id = d.id
          LEFT JOIN degrees deg ON s.degree_id = deg.id
          WHERE s.user_id = ? AND s.deleted_at IS NULL
          LIMIT 1
        `;
        const [studentRows] = await this.db.query(query, [id]);
        if (studentRows.length > 0) {
          user.student_profile = studentRows[0];
        }
      } else if (user.role === User.ROLES.TEACHER) {
        // Get teacher profile
        const query = `
          SELECT t.*, d.name as department_name, des.title as designation_title
          FROM teachers t
          LEFT JOIN departments d ON t.department_id = d.id
          LEFT JOIN designations des ON t.designation_id = des.id
          WHERE t.user_id = ? AND t.deleted_at IS NULL
          LIMIT 1
        `;
        const [teacherRows] = await this.db.query(query, [id]);
        if (teacherRows.length > 0) {
          user.teacher_profile = teacherRows[0];
        }
      }

      return user;
    } catch (error) {
      throw new Error(`Error finding user with relations: ${error.message}`);
    }
  }

  /**
   * Get columns to select (excluding hidden fields)
   * @returns {string} - Comma-separated column list
   */
  _getSelectColumns() {
    if (this.hidden.length === 0) {
      return '*';
    }

    // This is a simplified version - in production, you'd fetch actual column names
    return `id, first_name, last_name, email, username, role, phone, date_of_birth, 
            gender_id, address_id, is_active, email_verified_at, two_factor_enabled, 
            last_login_at, created_at, updated_at, deleted_at`;
  }

  /**
   * Get database connection
   * @returns {Object} - Database connection
   */
  get db() {
    return require('../config/database');
  }
}

module.exports = new User();
