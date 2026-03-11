/**
 * UserRepository - Example repository implementation
 * Demonstrates how to extend BaseRepository with domain-specific methods
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    // Pass User model instance to BaseRepository
    super(User);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  /**
   * Find user by email with case-insensitive search
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  async findByEmailInsensitive(email) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE LOWER(email) = LOWER(?)
      AND deleted_at IS NULL
      LIMIT 1
    `;
    
    const results = await this.rawQuery(query, [email]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find active users by role
   * @param {string} role - User role
   * @param {number} departmentId - Optional department filter
   * @returns {Promise<Array>}
   */
  async findActiveByRole(role, departmentId = null) {
    const conditions = { 
      role,
      status: 'active'
    };
    
    if (departmentId) {
      conditions.department_id = departmentId;
    }
    
    return await this.findAll(conditions, {
      orderBy: 'name ASC'
    });
  }

  /**
   * Get user statistics by role
   * @returns {Promise<Array>}
   */
  async getUserStatsByRole() {
    return await this.groupBy({
      groupBy: 'role',
      select: {
        role: 'role',
        total: 'COUNT(*)',
        active: 'SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END)',
        inactive: 'SUM(CASE WHEN status = "inactive" THEN 1 ELSE 0 END)',
        last_login_avg: 'AVG(TIMESTAMPDIFF(DAY, last_login, NOW()))'
      },
      conditions: {}
    });
  }

  /**
   * Update user last login timestamp
   * @param {number} userId - User ID
   * @returns {Promise<Object>}
   */
  async updateLastLogin(userId) {
    return await this.transaction(async (conn) => {
      const query = `
        UPDATE ${this.tableName}
        SET last_login = NOW(),
            login_count = login_count + 1,
            updated_at = NOW()
        WHERE ${this.primaryKey} = ?
      `;
      
      await this.rawQueryWithConnection(conn, query, [userId]);
      return await this.findByIdWithConnection(conn, userId);
    });
  }

  /**
   * Bulk activate/deactivate users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {string} status - Status to set ('active' or 'inactive')
   * @returns {Promise<number>} - Number of updated users
   */
  async bulkUpdateStatus(userIds, status) {
    const updates = userIds.map(id => ({
      id,
      data: { 
        status,
        updated_at: new Date()
      }
    }));
    
    return await this.batchUpdate(updates);
  }

  /**
   * Find users with failed login attempts
   * @param {number} threshold - Minimum failed attempts
   * @returns {Promise<Array>}
   */
  async findUsersWithFailedLogins(threshold = 3) {
    const query = `
      SELECT u.*, 
             COUNT(al.id) as failed_attempts,
             MAX(al.created_at) as last_failed_attempt
      FROM ${this.tableName} u
      LEFT JOIN audit_logs al ON u.id = al.user_id 
        AND al.action = 'login_failed'
        AND al.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
      HAVING failed_attempts >= ?
      ORDER BY failed_attempts DESC
    `;
    
    return await this.rawQuery(query, [threshold]);
  }

  /**
   * Get users with their department and faculty information
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async findUsersWithDepartmentInfo(filters = {}) {
    const { role, status, departmentId } = filters;
    
    let whereConditions = ['u.deleted_at IS NULL'];
    const params = [];
    
    if (role) {
      whereConditions.push('u.role = ?');
      params.push(role);
    }
    
    if (status) {
      whereConditions.push('u.status = ?');
      params.push(status);
    }
    
    if (departmentId) {
      whereConditions.push('u.department_id = ?');
      params.push(departmentId);
    }
    
    const query = `
      SELECT 
        u.*,
        d.name as department_name,
        f.name as faculty_name
      FROM ${this.tableName} u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY u.name ASC
    `;
    
    return await this.rawQuery(query, params);
  }

  /**
   * Create user with associated records in transaction
   * @param {Object} userData - User data
   * @param {Object} additionalData - Additional related data
   * @returns {Promise<Object>}
   */
  async createUserWithProfile(userData, additionalData = {}) {
    return await this.transaction(async (conn) => {
      // Create user
      const user = await this.createWithConnection(conn, userData);
      
      // Create address if provided
      if (additionalData.address) {
        const addressQuery = `
          INSERT INTO addresses (user_id, street, city, state, country, postal_code)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await this.rawQueryWithConnection(conn, addressQuery, [
          user.id,
          additionalData.address.street,
          additionalData.address.city,
          additionalData.address.state,
          additionalData.address.country,
          additionalData.address.postal_code
        ]);
      }
      
      // Create audit log
      const auditQuery = `
        INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address)
        VALUES (?, 'user_created', 'users', ?, ?)
      `;
      
      await this.rawQueryWithConnection(conn, auditQuery, [
        user.id,
        user.id,
        additionalData.ip_address || null
      ]);
      
      return user;
    });
  }

  /**
   * Bulk import users from external data
   * @param {Array<Object>} usersData - Array of user data
   * @param {Object} options - Import options
   * @returns {Promise<Object>}
   */
  async bulkImportUsers(usersData, options = {}) {
    const { skipDuplicates = true, updateExisting = false } = options;
    
    if (updateExisting) {
      // Use upsert for insert or update
      return await this.upsert(
        usersData,
        ['email'],  // Unique key
        ['name', 'phone', 'status', 'updated_at']  // Update these on duplicate
      );
    } else {
      // Simple batch insert
      return await this.batchInsert(usersData, {
        ignore: skipDuplicates
      });
    }
  }

  /**
   * Get user activity summary
   * @param {number} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Object>}
   */
  async getUserActivitySummary(userId, days = 30) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.last_login,
        u.login_count,
        COUNT(DISTINCT al.id) as total_actions,
        COUNT(DISTINCT DATE(al.created_at)) as active_days,
        MAX(al.created_at) as last_activity
      FROM ${this.tableName} u
      LEFT JOIN audit_logs al ON u.id = al.user_id 
        AND al.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      WHERE u.id = ? AND u.deleted_at IS NULL
      GROUP BY u.id
    `;
    
    const results = await this.rawQuery(query, [days, userId]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Permanently delete old soft-deleted users
   * @param {number} daysOld - Number of days since soft deletion
   * @returns {Promise<number>} - Number of permanently deleted users
   */
  async permanentlyDeleteOldUsers(daysOld = 90) {
    return await this.transaction(async (conn) => {
      const query = `
        DELETE FROM ${this.tableName}
        WHERE deleted_at IS NOT NULL
        AND deleted_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      
      const [result] = await conn.execute(query, [daysOld]);
      return result.affectedRows;
    });
  }
}

module.exports = UserRepository;
