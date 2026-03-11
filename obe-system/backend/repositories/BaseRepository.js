/**
 * BaseRepository - Abstract base class for all repositories
 * Provides data access patterns, transaction support, batch operations,
 * and complex query building for database interactions
 * 
 * This layer sits between Models and Services, handling complex queries,
 * transactions, and data aggregation that go beyond basic CRUD operations
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const db = require('../config/database');

class BaseRepository {
  /**
   * Constructor
   * @param {BaseModel} model - Model instance to work with
   */
  constructor(model) {
    if (this.constructor === BaseRepository) {
      throw new Error('BaseRepository is an abstract class and cannot be instantiated directly');
    }
    
    if (!model) {
      throw new Error('Model instance is required');
    }

    this.model = model;
    this.tableName = model.tableName;
    this.primaryKey = model.primaryKey;
  }

  // ============================================================================
  // BASIC DATA ACCESS PATTERNS
  // ============================================================================

  /**
   * Find record by ID with optional relations
   * @param {number|string} id - Record ID
   * @param {Object} options - Query options
   * @param {Array<string>} options.relations - Relations to load
   * @param {Array<string>} options.select - Columns to select
   * @param {boolean} options.withTrashed - Include soft deleted
   * @returns {Promise<Object|null>}
   */
  async findById(id, options = {}) {
    try {
      const { relations = [], select = ['*'], withTrashed = false } = options;

      let query = this._buildSelectQuery(select);
      let params = [id];

      // Add soft delete filter
      if (this.model.softDelete && !withTrashed) {
        query += ` AND ${this.tableName}.deleted_at IS NULL`;
      }

      const [rows] = await db.pool.execute(query, params);
      
      if (rows.length === 0) {
        return null;
      }

      let result = rows[0];

      // Load relations if specified
      if (relations.length > 0) {
        result = await this._loadRelations(result, relations);
      }

      return result;
    } catch (error) {
      throw new Error(`Error in findById: ${error.message}`);
    }
  }

  /**
   * Find multiple records by IDs
   * @param {Array<number|string>} ids - Array of IDs
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async findByIds(ids, options = {}) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return [];
      }

      const { select = ['*'], withTrashed = false } = options;
      const placeholders = ids.map(() => '?').join(',');
      
      let query = `
        SELECT ${select.join(', ')}
        FROM ${this.tableName}
        WHERE ${this.primaryKey} IN (${placeholders})
      `;

      if (this.model.softDelete && !withTrashed) {
        query += ` AND deleted_at IS NULL`;
      }

      const [rows] = await db.pool.execute(query, ids);
      return rows;
    } catch (error) {
      throw new Error(`Error in findByIds: ${error.message}`);
    }
  }

  /**
   * Find one record by conditions
   * @param {Object} conditions - WHERE conditions
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async findOne(conditions, options = {}) {
    try {
      const results = await this.findAll({ ...conditions, limit: 1 }, options);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      throw new Error(`Error in findOne: ${error.message}`);
    }
  }

  /**
   * Find all records matching conditions
   * @param {Object} conditions - WHERE conditions
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async findAll(conditions = {}, options = {}) {
    try {
      const { 
        select = ['*'], 
        orderBy = `${this.primaryKey} DESC`,
        limit = null,
        offset = null,
        withTrashed = false 
      } = options;

      const { whereClause, params } = this._buildWhereClause(conditions, withTrashed);

      let query = `
        SELECT ${select.join(', ')}
        FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${orderBy}
      `;

      if (limit) {
        query += ` LIMIT ?`;
        params.push(limit);
        
        if (offset) {
          query += ` OFFSET ?`;
          params.push(offset);
        }
      }

      const [rows] = await db.pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in findAll: ${error.message}`);
    }
  }

  /**
   * Check if record exists
   * @param {Object} conditions - WHERE conditions
   * @returns {Promise<boolean>}
   */
  async exists(conditions) {
    try {
      const { whereClause, params } = this._buildWhereClause(conditions);
      
      const query = `
        SELECT EXISTS(
          SELECT 1 FROM ${this.tableName}
          ${whereClause}
        ) as \`exists\`
      `;

      const [rows] = await db.pool.execute(query, params);
      return rows[0].exists === 1;
    } catch (error) {
      throw new Error(`Error in exists: ${error.message}`);
    }
  }

  /**
   * Count records matching conditions
   * @param {Object} conditions - WHERE conditions
   * @returns {Promise<number>}
   */
  async count(conditions = {}) {
    try {
      const { whereClause, params } = this._buildWhereClause(conditions);
      
      const query = `
        SELECT COUNT(*) as count
        FROM ${this.tableName}
        ${whereClause}
      `;

      const [rows] = await db.pool.execute(query, params);
      return rows[0].count;
    } catch (error) {
      throw new Error(`Error in count: ${error.message}`);
    }
  }

  // ============================================================================
  // TRANSACTION SUPPORT
  // ============================================================================

  /**
   * Execute operations within a transaction
   * @param {Function} callback - Async function receiving connection
   * @returns {Promise<any>} - Transaction result
   * @example
   * await repository.transaction(async (conn) => {
   *   await repository.createWithConnection(conn, data1);
   *   await repository.updateWithConnection(conn, id, data2);
   *   return result;
   * });
   */
  async transaction(callback) {
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Create record within existing transaction
   * @param {Connection} connection - MySQL connection
   * @param {Object} data - Data to insert
   * @returns {Promise<Object>}
   */
  async createWithConnection(connection, data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => '?').join(',');

      const query = `
        INSERT INTO ${this.tableName} (${columns.join(',')})
        VALUES (${placeholders})
      `;

      const [result] = await connection.execute(query, values);
      return await this.findByIdWithConnection(connection, result.insertId);
    } catch (error) {
      throw new Error(`Error in createWithConnection: ${error.message}`);
    }
  }

  /**
   * Update record within existing transaction
   * @param {Connection} connection - MySQL connection
   * @param {number|string} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>}
   */
  async updateWithConnection(connection, id, data) {
    try {
      const updates = Object.keys(data).map(key => `${key} = ?`).join(',');
      const values = [...Object.values(data), id];

      const query = `
        UPDATE ${this.tableName}
        SET ${updates}
        WHERE ${this.primaryKey} = ?
      `;

      await connection.execute(query, values);
      return await this.findByIdWithConnection(connection, id);
    } catch (error) {
      throw new Error(`Error in updateWithConnection: ${error.message}`);
    }
  }

  /**
   * Delete record within existing transaction
   * @param {Connection} connection - MySQL connection
   * @param {number|string} id - Record ID
   * @param {boolean} soft - Use soft delete
   * @returns {Promise<boolean>}
   */
  async deleteWithConnection(connection, id, soft = true) {
    try {
      let query;
      
      if (soft && this.model.softDelete) {
        query = `
          UPDATE ${this.tableName}
          SET deleted_at = NOW()
          WHERE ${this.primaryKey} = ?
        `;
      } else {
        query = `
          DELETE FROM ${this.tableName}
          WHERE ${this.primaryKey} = ?
        `;
      }

      const [result] = await connection.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error in deleteWithConnection: ${error.message}`);
    }
  }

  /**
   * Find by ID within existing transaction
   * @param {Connection} connection - MySQL connection
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithConnection(connection, id) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE ${this.primaryKey} = ?
      `;

      const [rows] = await connection.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error in findByIdWithConnection: ${error.message}`);
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Batch insert multiple records
   * @param {Array<Object>} records - Array of records to insert
   * @param {Object} options - Options
   * @param {boolean} options.ignore - Use INSERT IGNORE
   * @param {boolean} options.replace - Use REPLACE INTO
   * @returns {Promise<Object>} - { insertedCount, firstInsertId }
   */
  async batchInsert(records, options = {}) {
    if (!Array.isArray(records) || records.length === 0) {
      return { insertedCount: 0, firstInsertId: null };
    }

    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { ignore = false, replace = false } = options;
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(',');

      let queryType = 'INSERT';
      if (ignore) queryType = 'INSERT IGNORE';
      if (replace) queryType = 'REPLACE';

      const query = `
        ${queryType} INTO ${this.tableName} (${columns.join(',')})
        VALUES (${placeholders})
      `;

      let firstInsertId = null;
      let insertedCount = 0;

      for (const record of records) {
        const values = columns.map(col => record[col]);
        const [result] = await connection.execute(query, values);
        
        if (result.affectedRows > 0) {
          insertedCount++;
          if (firstInsertId === null) {
            firstInsertId = result.insertId;
          }
        }
      }

      await connection.commit();
      
      return { insertedCount, firstInsertId };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error in batchInsert: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Batch update multiple records
   * @param {Array<Object>} updates - Array of {id, data} objects
   * @returns {Promise<number>} - Number of updated records
   */
  async batchUpdate(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return 0;
    }

    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      let updatedCount = 0;

      for (const { id, data } of updates) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(data), id];

        const query = `
          UPDATE ${this.tableName}
          SET ${setClause}
          WHERE ${this.primaryKey} = ?
        `;

        const [result] = await connection.execute(query, values);
        updatedCount += result.affectedRows;
      }

      await connection.commit();
      return updatedCount;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error in batchUpdate: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Batch delete multiple records
   * @param {Array<number|string>} ids - Array of IDs to delete
   * @param {boolean} soft - Use soft delete
   * @returns {Promise<number>} - Number of deleted records
   */
  async batchDelete(ids, soft = true) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }

    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const placeholders = ids.map(() => '?').join(',');
      let query;

      if (soft && this.model.softDelete) {
        query = `
          UPDATE ${this.tableName}
          SET deleted_at = NOW()
          WHERE ${this.primaryKey} IN (${placeholders})
        `;
      } else {
        query = `
          DELETE FROM ${this.tableName}
          WHERE ${this.primaryKey} IN (${placeholders})
        `;
      }

      const [result] = await connection.execute(query, ids);
      
      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error in batchDelete: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Upsert (Insert or Update) records
   * @param {Array<Object>} records - Records to upsert
   * @param {Array<string>} uniqueKeys - Columns that determine uniqueness
   * @param {Array<string>} updateColumns - Columns to update on duplicate
   * @returns {Promise<Object>} - { insertedCount, updatedCount }
   */
  async upsert(records, uniqueKeys, updateColumns) {
    if (!Array.isArray(records) || records.length === 0) {
      return { insertedCount: 0, updatedCount: 0 };
    }

    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(',');
      const updateClause = updateColumns
        .map(col => `${col} = VALUES(${col})`)
        .join(',');

      const query = `
        INSERT INTO ${this.tableName} (${columns.join(',')})
        VALUES (${placeholders})
        ON DUPLICATE KEY UPDATE ${updateClause}
      `;

      let insertedCount = 0;
      let updatedCount = 0;

      for (const record of records) {
        const values = columns.map(col => record[col]);
        const [result] = await connection.execute(query, values);
        
        if (result.affectedRows === 1) {
          insertedCount++;
        } else if (result.affectedRows === 2) {
          updatedCount++;
        }
      }

      await connection.commit();
      
      return { insertedCount, updatedCount };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error in upsert: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // ============================================================================
  // COMPLEX QUERIES
  // ============================================================================

  /**
   * Execute raw SQL query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  async rawQuery(sql, params = []) {
    try {
      const [rows] = await db.pool.execute(sql, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in rawQuery: ${error.message}`);
    }
  }

  /**
   * Execute raw SQL query within transaction
   * @param {Connection} connection - MySQL connection
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  async rawQueryWithConnection(connection, sql, params = []) {
    try {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in rawQueryWithConnection: ${error.message}`);
    }
  }

  /**
   * Aggregate query (SUM, AVG, MAX, MIN, COUNT)
   * @param {string} aggregateFunction - SQL aggregate function
   * @param {string} column - Column to aggregate
   * @param {Object} conditions - WHERE conditions
   * @returns {Promise<number>}
   */
  async aggregate(aggregateFunction, column, conditions = {}) {
    try {
      const { whereClause, params } = this._buildWhereClause(conditions);
      
      const query = `
        SELECT ${aggregateFunction}(${column}) as result
        FROM ${this.tableName}
        ${whereClause}
      `;

      const [rows] = await db.pool.execute(query, params);
      return rows[0].result || 0;
    } catch (error) {
      throw new Error(`Error in aggregate: ${error.message}`);
    }
  }

  /**
   * Group by query with aggregation
   * @param {Object} options - Query options
   * @param {string} options.groupBy - Column to group by
   * @param {Object} options.select - Columns and aggregates to select
   * @param {Object} options.conditions - WHERE conditions
   * @param {string} options.having - HAVING clause
   * @returns {Promise<Array>}
   */
  async groupBy(options) {
    try {
      const { groupBy, select, conditions = {}, having = null } = options;
      
      const { whereClause, params } = this._buildWhereClause(conditions);
      
      const selectClause = Object.entries(select)
        .map(([alias, expr]) => `${expr} as ${alias}`)
        .join(', ');

      let query = `
        SELECT ${selectClause}
        FROM ${this.tableName}
        ${whereClause}
        GROUP BY ${groupBy}
      `;

      if (having) {
        query += ` HAVING ${having}`;
      }

      const [rows] = await db.pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in groupBy: ${error.message}`);
    }
  }

  /**
   * Paginate query results
   * @param {Object} conditions - WHERE conditions
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} - { data, pagination }
   */
  async paginate(conditions = {}, options = {}) {
    try {
      const { page = 1, limit = 10, orderBy = `${this.primaryKey} DESC` } = options;
      const offset = (page - 1) * limit;

      // Get total count
      const total = await this.count(conditions);

      // Get paginated data
      const data = await this.findAll(conditions, {
        ...options,
        limit,
        offset,
        orderBy
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      };
    } catch (error) {
      throw new Error(`Error in paginate: ${error.message}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Build WHERE clause from conditions
   * @param {Object} conditions - WHERE conditions
   * @param {boolean} withTrashed - Include soft deleted
   * @returns {Object} - { whereClause, params }
   * @private
   */
  _buildWhereClause(conditions, withTrashed = false) {
    const whereParts = [];
    const params = [];

    // Add soft delete filter
    if (this.model.softDelete && !withTrashed) {
      whereParts.push(`${this.tableName}.deleted_at IS NULL`);
    }

    // Process conditions
    for (const [key, value] of Object.entries(conditions)) {
      if (value === null) {
        whereParts.push(`${key} IS NULL`);
      } else if (Array.isArray(value)) {
        const placeholders = value.map(() => '?').join(',');
        whereParts.push(`${key} IN (${placeholders})`);
        params.push(...value);
      } else if (typeof value === 'object' && value.operator) {
        whereParts.push(`${key} ${value.operator} ?`);
        params.push(value.value);
      } else {
        whereParts.push(`${key} = ?`);
        params.push(value);
      }
    }

    const whereClause = whereParts.length > 0 
      ? `WHERE ${whereParts.join(' AND ')}` 
      : '';

    return { whereClause, params };
  }

  /**
   * Build SELECT query
   * @param {Array<string>} columns - Columns to select
   * @returns {string} - SQL query
   * @private
   */
  _buildSelectQuery(columns) {
    const selectClause = columns.join(', ');
    return `
      SELECT ${selectClause}
      FROM ${this.tableName}
      WHERE ${this.primaryKey} = ?
    `;
  }

  /**
   * Load relations for a record
   * @param {Object} record - Record to load relations for
   * @param {Array<string>} relations - Relations to load
   * @returns {Promise<Object>}
   * @private
   */
  async _loadRelations(record, relations) {
    // This is a placeholder for relation loading
    // Implement based on your specific relation loading strategy
    // Could integrate with a relation loader service
    return record;
  }
}

module.exports = BaseRepository;
