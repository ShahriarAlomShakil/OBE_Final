/**
 * BaseModel - Abstract base class for all database models
 * Provides common CRUD operations, pagination, soft deletes, and query building utilities
 * 
 * @author OBE System Team
 * @version 1.0.0
 */

const db = require('../config/database');

class BaseModel {
  /**
   * Constructor
   * @param {string} tableName - Name of the database table
   * @param {string} primaryKey - Primary key column name (default: 'id')
   */
  constructor(tableName, primaryKey = 'id') {
    if (this.constructor === BaseModel) {
      throw new Error('BaseModel is an abstract class and cannot be instantiated directly');
    }
    
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.softDelete = true; // Enable soft deletes by default
    this.timestamps = true; // Enable created_at/updated_at by default
    this.fillable = []; // Fields that can be mass-assigned
    this.hidden = []; // Fields to hide in JSON responses
  }

  /**
   * Find all records with pagination and filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Records per page (default: 10)
   * @param {Object} options.where - WHERE conditions
   * @param {string|Array} options.select - Columns to select
   * @param {string|Array} options.orderBy - Order by columns
   * @param {boolean} options.withTrashed - Include soft deleted records
   * @param {Object} options.join - Join configuration
   * @returns {Promise<Object>} - Paginated results with metadata
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        where = {},
        select = '*',
        orderBy = `${this.primaryKey} DESC`,
        withTrashed = false,
        join = null
      } = options;

      // Ensure page and limit are integers
      const pageInt = parseInt(page) || 1;
      const limitInt = parseInt(limit) || 10;
      const offset = (pageInt - 1) * limitInt;

      // Build SELECT clause
      const selectClause = Array.isArray(select) ? select.join(', ') : select;

      // Build WHERE clause
      const whereConditions = [];
      const whereParams = [];

      // Add soft delete filter
      if (this.softDelete && !withTrashed) {
        whereConditions.push(`${this.tableName}.deleted_at IS NULL`);
      }

      // Add custom WHERE conditions
      for (const [key, value] of Object.entries(where)) {
        if (value === null) {
          whereConditions.push(`${key} IS NULL`);
        } else if (Array.isArray(value)) {
          const placeholders = value.map(() => '?').join(', ');
          whereConditions.push(`${key} IN (${placeholders})`);
          whereParams.push(...value);
        } else if (typeof value === 'object' && value.operator) {
          whereConditions.push(`${key} ${value.operator} ?`);
          whereParams.push(value.value);
        } else {
          whereConditions.push(`${key} = ?`);
          whereParams.push(value);
        }
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Build JOIN clause
      let joinClause = '';
      if (join) {
        if (Array.isArray(join)) {
          joinClause = join.map(j => 
            `${j.type || 'LEFT'} JOIN ${j.table} ON ${j.on}`
          ).join(' ');
        } else {
          joinClause = `${join.type || 'LEFT'} JOIN ${join.table} ON ${join.on}`;
        }
      }

      // Build ORDER BY clause
      const orderByClause = Array.isArray(orderBy) 
        ? `ORDER BY ${orderBy.join(', ')}` 
        : `ORDER BY ${orderBy}`;

      // Count total records
      if (!this.tableName) {
        console.error('ERROR: tableName is undefined! Model:', this.constructor.name);
        throw new Error(`Table name is undefined for model: ${this.constructor.name}`);
      }
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM ${this.tableName}
        ${joinClause}
        ${whereClause}
      `;
      const [countResult] = await db.query(countQuery, whereParams);
      const total = countResult[0].total;

      // Fetch paginated records
      const dataQuery = `
        SELECT ${selectClause}
        FROM ${this.tableName}
        ${joinClause}
        ${whereClause}
        ${orderByClause}
        LIMIT ? OFFSET ?
      `;
      const [rows] = await db.query(dataQuery, [...whereParams, limitInt, parseInt(offset)]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limitInt);
      const hasNextPage = pageInt < totalPages;
      const hasPrevPage = pageInt > 1;

      return {
        data: this._hideFields(rows),
        pagination: {
          page: pageInt,
          limit: limitInt,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageInt + 1 : null,
          prevPage: hasPrevPage ? pageInt - 1 : null
        }
      };
    } catch (error) {
      throw new Error(`Error in findAll: ${error.message}`);
    }
  }

  /**
   * Find a single record by primary key
   * @param {number|string} id - Primary key value
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - Record or null if not found
   */
  async findById(id, options = {}) {
    try {
      const {
        select = '*',
        withTrashed = false
      } = options;

      const selectClause = Array.isArray(select) ? select.join(', ') : select;
      const whereClause = this.softDelete && !withTrashed
        ? `WHERE ${this.primaryKey} = ? AND deleted_at IS NULL`
        : `WHERE ${this.primaryKey} = ?`;

      const query = `
        SELECT ${selectClause}
        FROM ${this.tableName}
        ${whereClause}
        LIMIT 1
      `;

      const [rows] = await db.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      return this._hideFields([rows[0]])[0];
    } catch (error) {
      throw new Error(`Error in findById: ${error.message}`);
    }
  }

  /**
   * Find records matching WHERE conditions
   * @param {Object} conditions - WHERE conditions
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of records
   */
  async findWhere(conditions = {}, options = {}) {
    try {
      const {
        select = '*',
        orderBy = `${this.primaryKey} DESC`,
        limit = null,
        withTrashed = false
      } = options;

      const selectClause = Array.isArray(select) ? select.join(', ') : select;
      
      const whereConditions = [];
      const whereParams = [];

      // Add soft delete filter
      if (this.softDelete && !withTrashed) {
        whereConditions.push('deleted_at IS NULL');
      }

      // Add custom WHERE conditions
      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          whereConditions.push(`${key} IS NULL`);
        } else if (Array.isArray(value)) {
          const placeholders = value.map(() => '?').join(', ');
          whereConditions.push(`${key} IN (${placeholders})`);
          whereParams.push(...value);
        } else {
          whereConditions.push(`${key} = ?`);
          whereParams.push(value);
        }
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const orderByClause = Array.isArray(orderBy) 
        ? `ORDER BY ${orderBy.join(', ')}` 
        : `ORDER BY ${orderBy}`;

      const limitClause = limit ? `LIMIT ${limit}` : '';

      const query = `
        SELECT ${selectClause}
        FROM ${this.tableName}
        ${whereClause}
        ${orderByClause}
        ${limitClause}
      `;

      const [rows] = await db.query(query, whereParams);
      return this._hideFields(rows);
    } catch (error) {
      throw new Error(`Error in findWhere: ${error.message}`);
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Data to insert
   * @param {Object} connection - Database connection (for transactions)
   * @returns {Promise<Object>} - Created record
   */
  async create(data, connection = null) {
    try {
      const conn = connection || db;

      // Filter data based on fillable fields
      const filteredData = this._filterFillable(data);

      // Add timestamps
      if (this.timestamps) {
        filteredData.created_at = new Date();
        filteredData.updated_at = new Date();
      }

      const columns = Object.keys(filteredData);
      const values = Object.values(filteredData);
      const placeholders = columns.map(() => '?').join(', ');

      const query = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
      `;

      const [result] = await conn.query(query, values);
      const insertId = result.insertId;

      // Fetch and return the created record
      return await this.findById(insertId);
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Update a record by primary key
   * @param {number|string} id - Primary key value
   * @param {Object} data - Data to update
   * @param {Object} connection - Database connection (for transactions)
   * @returns {Promise<Object|null>} - Updated record or null if not found
   */
  async update(id, data, connection = null) {
    try {
      const conn = connection || db;

      // Check if record exists
      const existingRecord = await this.findById(id);
      if (!existingRecord) {
        return null;
      }

      // Filter data based on fillable fields
      const filteredData = this._filterFillable(data);

      // Add updated timestamp
      if (this.timestamps) {
        filteredData.updated_at = new Date();
      }

      const columns = Object.keys(filteredData);
      const values = Object.values(filteredData);
      const setClause = columns.map(col => `${col} = ?`).join(', ');

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE ${this.primaryKey} = ?
      `;

      await conn.query(query, [...values, id]);

      // Fetch and return the updated record
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Soft delete or hard delete a record
   * @param {number|string} id - Primary key value
   * @param {boolean} force - Force hard delete
   * @param {Object} connection - Database connection (for transactions)
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(id, force = false, connection = null) {
    try {
      const conn = connection || db;

      // Check if record exists
      const existingRecord = await this.findById(id, { withTrashed: true });
      if (!existingRecord) {
        return false;
      }

      if (this.softDelete && !force) {
        // Soft delete
        const query = `
          UPDATE ${this.tableName}
          SET deleted_at = ?, updated_at = ?
          WHERE ${this.primaryKey} = ?
        `;
        await conn.query(query, [new Date(), new Date(), id]);
      } else {
        // Hard delete
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        await conn.query(query, [id]);
      }

      return true;
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }

  /**
   * Restore a soft deleted record
   * @param {number|string} id - Primary key value
   * @param {Object} connection - Database connection (for transactions)
   * @returns {Promise<Object|null>} - Restored record or null if not found
   */
  async restore(id, connection = null) {
    try {
      if (!this.softDelete) {
        throw new Error('Soft delete is not enabled for this model');
      }

      const conn = connection || db;

      // Check if record exists and is soft deleted
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE ${this.primaryKey} = ? AND deleted_at IS NOT NULL
        LIMIT 1
      `;
      const [rows] = await conn.query(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      // Restore the record
      const updateQuery = `
        UPDATE ${this.tableName}
        SET deleted_at = NULL, updated_at = ?
        WHERE ${this.primaryKey} = ?
      `;
      await conn.query(updateQuery, [new Date(), id]);

      // Fetch and return the restored record
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error in restore: ${error.message}`);
    }
  }

  /**
   * Count records matching conditions
   * @param {Object} conditions - WHERE conditions
   * @param {boolean} withTrashed - Include soft deleted records
   * @returns {Promise<number>} - Count of records
   */
  async count(conditions = {}, withTrashed = false) {
    try {
      const whereConditions = [];
      const whereParams = [];

      // Add soft delete filter
      if (this.softDelete && !withTrashed) {
        whereConditions.push('deleted_at IS NULL');
      }

      // Add custom WHERE conditions
      for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
          whereConditions.push(`${key} IS NULL`);
        } else if (Array.isArray(value)) {
          const placeholders = value.map(() => '?').join(', ');
          whereConditions.push(`${key} IN (${placeholders})`);
          whereParams.push(...value);
        } else {
          whereConditions.push(`${key} = ?`);
          whereParams.push(value);
        }
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const query = `
        SELECT COUNT(*) as total
        FROM ${this.tableName}
        ${whereClause}
      `;

      const [rows] = await db.query(query, whereParams);
      return rows[0].total;
    } catch (error) {
      throw new Error(`Error in count: ${error.message}`);
    }
  }

  /**
   * Query Builder: Start a custom query
   * @returns {QueryBuilder} - QueryBuilder instance
   */
  query() {
    return new QueryBuilder(this.tableName, db, this.softDelete);
  }

  /**
   * Execute raw SQL query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} - Query results
   */
  async raw(query, params = []) {
    try {
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error in raw query: ${error.message}`);
    }
  }

  /**
   * Begin a database transaction
   * @returns {Promise<Connection>} - Database connection with transaction
   */
  async beginTransaction() {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();
      return connection;
    } catch (error) {
      throw new Error(`Error beginning transaction: ${error.message}`);
    }
  }

  /**
   * Commit a database transaction
   * @param {Connection} connection - Database connection
   */
  async commit(connection) {
    try {
      await connection.commit();
      connection.release();
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw new Error(`Error committing transaction: ${error.message}`);
    }
  }

  /**
   * Rollback a database transaction
   * @param {Connection} connection - Database connection
   */
  async rollback(connection) {
    try {
      await connection.rollback();
      connection.release();
    } catch (error) {
      connection.release();
      throw new Error(`Error rolling back transaction: ${error.message}`);
    }
  }

  /**
   * Filter data based on fillable fields
   * @private
   * @param {Object} data - Data to filter
   * @returns {Object} - Filtered data
   */
  _filterFillable(data) {
    if (this.fillable.length === 0) {
      return data; // No fillable restriction
    }

    const filtered = {};
    for (const key of this.fillable) {
      if (data.hasOwnProperty(key)) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }

  /**
   * Hide fields from result set
   * @private
   * @param {Array} rows - Result rows
   * @returns {Array} - Rows with hidden fields removed
   */
  _hideFields(rows) {
    if (this.hidden.length === 0) {
      return rows;
    }

    return rows.map(row => {
      const filtered = { ...row };
      for (const field of this.hidden) {
        delete filtered[field];
      }
      return filtered;
    });
  }
}

/**
 * QueryBuilder - Fluent query builder for complex queries
 */
class QueryBuilder {
  constructor(tableName, db, softDelete = true) {
    this.tableName = tableName;
    this.db = db;
    this.softDelete = softDelete;
    this._select = '*';
    this._where = [];
    this._whereParams = [];
    this._joins = [];
    this._orderBy = [];
    this._groupBy = [];
    this._having = [];
    this._havingParams = [];
    this._limit = null;
    this._offset = null;
    
    // Apply soft delete filter by default
    if (this.softDelete) {
      this._where.push(`${this.tableName}.deleted_at IS NULL`);
    }
  }

  select(columns) {
    this._select = Array.isArray(columns) ? columns.join(', ') : columns;
    return this;
  }

  where(column, operator, value = null) {
    if (value === null) {
      value = operator;
      operator = '=';
    }
    this._where.push(`${column} ${operator} ?`);
    this._whereParams.push(value);
    return this;
  }

  whereIn(column, values) {
    const placeholders = values.map(() => '?').join(', ');
    this._where.push(`${column} IN (${placeholders})`);
    this._whereParams.push(...values);
    return this;
  }

  whereNull(column) {
    this._where.push(`${column} IS NULL`);
    return this;
  }

  whereNotNull(column) {
    this._where.push(`${column} IS NOT NULL`);
    return this;
  }

  whereBetween(column, min, max) {
    this._where.push(`${column} BETWEEN ? AND ?`);
    this._whereParams.push(min, max);
    return this;
  }

  whereLike(column, pattern) {
    this._where.push(`${column} LIKE ?`);
    this._whereParams.push(pattern);
    return this;
  }

  join(table, firstColumn, operator, secondColumn) {
    this._joins.push(`INNER JOIN ${table} ON ${firstColumn} ${operator} ${secondColumn}`);
    return this;
  }

  leftJoin(table, firstColumn, operator, secondColumn) {
    this._joins.push(`LEFT JOIN ${table} ON ${firstColumn} ${operator} ${secondColumn}`);
    return this;
  }

  rightJoin(table, firstColumn, operator, secondColumn) {
    this._joins.push(`RIGHT JOIN ${table} ON ${firstColumn} ${operator} ${secondColumn}`);
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this._orderBy.push(`${column} ${direction}`);
    return this;
  }

  groupBy(columns) {
    this._groupBy = Array.isArray(columns) ? columns : [columns];
    return this;
  }

  having(column, operator, value) {
    this._having.push(`${column} ${operator} ?`);
    this._havingParams.push(value);
    return this;
  }

  limit(count) {
    this._limit = count;
    return this;
  }

  offset(count) {
    this._offset = count;
    return this;
  }

  withTrashed() {
    // Remove soft delete filter
    this._where = this._where.filter(w => !w.includes('deleted_at IS NULL'));
    return this;
  }

  async get() {
    const query = this._buildQuery();
    const params = [...this._whereParams, ...this._havingParams];
    const [rows] = await this.db.query(query, params);
    return rows;
  }

  async first() {
    this._limit = 1;
    const rows = await this.get();
    return rows.length > 0 ? rows[0] : null;
  }

  async count() {
    this._select = 'COUNT(*) as total';
    const result = await this.first();
    return result ? result.total : 0;
  }

  _buildQuery() {
    let query = `SELECT ${this._select} FROM ${this.tableName}`;

    if (this._joins.length > 0) {
      query += ` ${this._joins.join(' ')}`;
    }

    if (this._where.length > 0) {
      query += ` WHERE ${this._where.join(' AND ')}`;
    }

    if (this._groupBy.length > 0) {
      query += ` GROUP BY ${this._groupBy.join(', ')}`;
    }

    if (this._having.length > 0) {
      query += ` HAVING ${this._having.join(' AND ')}`;
    }

    if (this._orderBy.length > 0) {
      query += ` ORDER BY ${this._orderBy.join(', ')}`;
    }

    if (this._limit !== null) {
      query += ` LIMIT ${this._limit}`;
    }

    if (this._offset !== null) {
      query += ` OFFSET ${this._offset}`;
    }

    return query;
  }
}

module.exports = BaseModel;
