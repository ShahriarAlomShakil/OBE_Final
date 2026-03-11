const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * Faculty Model
 * Represents a faculty within the university (e.g., Engineering, Science, Arts)
 * 
 * @extends BaseModel
 */
class Faculty extends BaseModel {
  constructor() {
    super('faculties');
    
    // Define fillable fields
    this.fillable = [
      'name',
      'short_name',
      'description',
      'established_date',
      'is_active'
    ];
    
    // Hidden fields in JSON responses
    this.hidden = ['deleted_at'];
  }

  /**
   * Get all departments belonging to a faculty
   * 
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Array>} Array of department records
   */
  async getDepartmentsByFacultyId(facultyId) {
    try {
      const Department = require('./Department');
      const result = await Department.findAll({ where: { faculty_id: facultyId, is_active: true } });
      return result.data || [];
    } catch (error) {
      // If Department model doesn't exist yet, return empty array
      return [];
    }
  }

  /**
   * Get faculty by ID with related departments
   * 
   * @param {number} id - Faculty ID
   * @returns {Promise<Object|null>} Faculty with departments or null
   */
  async findByIdWithDepartments(id) {
    const faculty = await this.findById(id);
    if (!faculty) {
      return null;
    }

    const departments = await this.getDepartmentsByFacultyId(id);
    return {
      ...faculty,
      departments
    };
  }

  /**
   * Get all active faculties
   * 
   * @returns {Promise<Array>} Array of active faculties
   */
  async getActive() {
    const result = await this.findAll({ where: { is_active: true } });
    return result.data || [];
  }

  /**
   * Check if faculty is active
   * 
   * @param {Object} faculty - Faculty object
   * @returns {boolean} True if faculty is active
   */
  isActive(faculty) {
    return faculty.is_active === 1 || faculty.is_active === true;
  }

  /**
   * Get faculty by short name
   * 
   * @param {string} shortName - Short name of the faculty
   * @returns {Promise<Object|null>} Faculty object or null
   */
  async findByShortName(shortName) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE short_name = ? AND deleted_at IS NULL
        LIMIT 1
      `;
      const [rows] = await db.execute(query, [shortName]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search faculties by name or short name
   * 
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching faculties
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT * FROM ${this.tableName}
        WHERE (name LIKE ? OR short_name LIKE ?)
        AND deleted_at IS NULL
        ORDER BY name ASC
      `;
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await db.execute(query, [searchPattern, searchPattern]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count total departments in a faculty
   * 
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<number>} Number of departments
   */
  async countDepartments(facultyId) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM departments 
        WHERE faculty_id = ? AND is_active = 1 AND deleted_at IS NULL
      `;
      const [results] = await db.execute(query, [facultyId]);
      return results[0].count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate establishment date
   * 
   * @param {Date|string} date - Date to validate
   * @returns {boolean} True if valid
   */
  validateEstablishedDate(date) {
    if (!date) return true; // Optional field
    const establishedDate = new Date(date);
    const today = new Date();
    return establishedDate <= today;
  }
}

module.exports = new Faculty();
