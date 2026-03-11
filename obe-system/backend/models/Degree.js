const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Degree extends BaseModel {
  constructor() {
    super('degrees');
  }

  /**
   * Get the department this degree belongs to
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Object|null>} Department object with faculty
   */
  async getDepartment(degreeId) {
    const query = `
      SELECT d.*, f.name as faculty_name, f.short_name as faculty_short_name
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      INNER JOIN degrees deg ON deg.department_id = d.id
      WHERE deg.id = ?
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all Program Learning Outcomes (PLOs) for this degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of PLOs
   */
  async getPLOs(degreeId) {
    const query = `
      SELECT * FROM program_learning_outcomes
      WHERE degree_id = ?
      ORDER BY plo_code ASC
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows;
  }

  /**
   * Get all Program Educational Objectives (PEOs) for this degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of PEOs
   */
  async getPEOs(degreeId) {
    const query = `
      SELECT * FROM program_educational_objectives
      WHERE degree_id = ?
      ORDER BY peo_code ASC
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows;
  }

  /**
   * Get all students enrolled in this degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Array of students with user info
   */
  async getStudents(degreeId) {
    const query = `
      SELECT s.*, u.name, u.email, u.username
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.degree_id = ? AND u.deleted_at IS NULL
      ORDER BY s.student_id ASC
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows;
  }

  /**
   * Find degree by ID with department relationship
   * @param {number} id - Degree ID
   * @returns {Promise<Object|null>} Degree with department and faculty
   */
  async findByIdWithDepartment(id) {
    const query = `
      SELECT deg.*, 
             d.name as department_name, d.dept_code as department_short_name, d.code as department_code,
             f.name as faculty_name, f.short_name as faculty_short_name
      FROM degrees deg
      LEFT JOIN departments d ON deg.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE deg.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find degree by ID with all relationships
   * @param {number} id - Degree ID
   * @returns {Promise<Object|null>} Degree with department, PLOs, PEOs, and students
   */
  async findByIdWithRelations(id) {
    const degree = await this.findByIdWithDepartment(id);
    if (!degree) return null;

    degree.plos = await this.getPLOs(id);
    degree.peos = await this.getPEOs(id);
    degree.students = await this.getStudents(id);
    
    return degree;
  }

  /**
   * Get all active degrees
   * @returns {Promise<Array>} Array of active degrees
   */
  async getActive() {
    const query = `
      SELECT deg.*, 
             d.name as department_name, d.dept_code as department_short_name,
             f.name as faculty_name
      FROM degrees deg
      LEFT JOIN departments d ON deg.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE deg.is_active = true
      ORDER BY deg.name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Find degree by short name
   * @param {string} shortName - Degree short name
   * @returns {Promise<Object|null>} Degree object
   */
  async findByShortName(shortName) {
    const query = `SELECT * FROM ${this.tableName} WHERE short_name = ?`;
    const [rows] = await db.execute(query, [shortName]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Search degrees by name, short name, or degree type
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching degrees
   */
  async search(searchTerm) {
    const query = `
      SELECT deg.*, 
             d.name as department_name, d.dept_code as department_short_name,
             f.name as faculty_name
      FROM degrees deg
      LEFT JOIN departments d ON deg.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE deg.name LIKE ? 
         OR deg.short_name LIKE ? 
         OR deg.degree_type LIKE ?
      ORDER BY deg.name ASC
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
    return rows;
  }

  /**
   * Get all degrees by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Array of degrees
   */
  async getByDepartmentId(departmentId) {
    const query = `
      SELECT deg.*, d.name as department_name, d.dept_code as department_short_name
      FROM degrees deg
      LEFT JOIN departments d ON deg.department_id = d.id
      WHERE deg.department_id = ?
      ORDER BY deg.name ASC
    `;
    const [rows] = await db.execute(query, [departmentId]);
    return rows;
  }

  /**
   * Get degrees by type
   * @param {string} degreeType - Degree type (bachelors, masters, phd)
   * @returns {Promise<Array>} Array of degrees
   */
  async getByType(degreeType) {
    const query = `
      SELECT deg.*, 
             d.name as department_name, d.dept_code as department_short_name,
             f.name as faculty_name
      FROM degrees deg
      LEFT JOIN departments d ON deg.department_id = d.id
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE deg.degree_type = ?
      ORDER BY deg.name ASC
    `;
    const [rows] = await db.execute(query, [degreeType]);
    return rows;
  }

  /**
   * Count PLOs in degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<number>} Count of PLOs
   */
  async countPLOs(degreeId) {
    const query = `SELECT COUNT(*) as count FROM program_learning_outcomes WHERE degree_id = ?`;
    const [rows] = await db.execute(query, [degreeId]);
    return rows[0].count;
  }

  /**
   * Count PEOs in degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<number>} Count of PEOs
   */
  async countPEOs(degreeId) {
    const query = `SELECT COUNT(*) as count FROM program_educational_objectives WHERE degree_id = ?`;
    const [rows] = await db.execute(query, [degreeId]);
    return rows[0].count;
  }

  /**
   * Count students enrolled in degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<number>} Count of students
   */
  async countStudents(degreeId) {
    const query = `
      SELECT COUNT(*) as count 
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.degree_id = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await db.execute(query, [degreeId]);
    return rows[0].count;
  }

  /**
   * Check if degree is active
   * @param {number} degreeId - Degree ID
   * @returns {Promise<boolean>} True if active
   */
  async isActive(degreeId) {
    const query = `SELECT is_active FROM ${this.tableName} WHERE id = ?`;
    const [rows] = await db.execute(query, [degreeId]);
    return rows.length > 0 && rows[0].is_active === 1;
  }

  /**
   * Validate that department exists and is active
   * @param {number} departmentId - Department ID
   * @returns {Promise<boolean>} True if department exists and is active
   */
  async validateDepartmentExists(departmentId) {
    const query = `SELECT id, is_active FROM departments WHERE id = ?`;
    const [rows] = await db.execute(query, [departmentId]);
    return rows.length > 0 && rows[0].is_active === 1;
  }

  /**
   * Validate degree duration (must be between 1 and 10 years)
   * @param {number} durationYears - Duration in years
   * @returns {boolean} True if valid
   */
  validateDuration(durationYears) {
    return durationYears >= 1 && durationYears <= 10;
  }

  /**
   * Validate total credits (must be positive)
   * @param {number} totalCredits - Total credit hours
   * @returns {boolean} True if valid
   */
  validateTotalCredits(totalCredits) {
    return totalCredits > 0;
  }
}

module.exports = new Degree();
