const BaseModel = require('./BaseModel');
const db = require('../config/database');

class Department extends BaseModel {
  constructor() {
    super('departments');
  }

  /**
   * Get the faculty this department belongs to
   * @param {number} departmentId - Department ID
   * @returns {Promise<Object|null>} Faculty object
   */
  async getFaculty(departmentId) {
    const query = `
      SELECT f.* 
      FROM faculties f
      INNER JOIN departments d ON d.faculty_id = f.id
      WHERE d.id = ?
    `;
    const [rows] = await db.execute(query, [departmentId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all courses in this department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Array of courses
   */
  async getCourses(departmentId) {
    const query = `
      SELECT * FROM courses
      WHERE department_id = ?
      ORDER BY code ASC
    `;
    const [rows] = await db.execute(query, [departmentId]);
    return rows;
  }

  /**
   * Get all teachers in this department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Array of teachers with user info
   */
  async getTeachers(departmentId) {
    const query = `
      SELECT t.*, u.name, u.email, u.username
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.department_id = ? AND u.deleted_at IS NULL
      ORDER BY u.name ASC
    `;
    const [rows] = await db.execute(query, [departmentId]);
    return rows;
  }

  /**
   * Find department by ID with faculty relationship
   * @param {number} id - Department ID
   * @returns {Promise<Object|null>} Department with faculty
   */
  async findByIdWithFaculty(id) {
    const query = `
      SELECT d.*, f.name as faculty_name, f.short_name as faculty_short_name
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE d.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find department by ID with all relationships
   * @param {number} id - Department ID
   * @returns {Promise<Object|null>} Department with faculty, courses, and teachers
   */
  async findByIdWithRelations(id) {
    const department = await this.findByIdWithFaculty(id);
    if (!department) return null;

    department.courses = await this.getCourses(id);
    department.teachers = await this.getTeachers(id);
    
    return department;
  }

  /**
   * Get all active departments
   * @returns {Promise<Array>} Array of active departments
   */
  async getActive() {
    const query = `
      SELECT d.*, f.name as faculty_name, f.short_name as faculty_short_name
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE d.is_active = true
      ORDER BY d.name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Find department by short name
   * @param {string} shortName - Department short name
   * @returns {Promise<Object|null>} Department object
   */
  async findByShortName(shortName) {
    const query = `SELECT * FROM ${this.tableName} WHERE short_name = ?`;
    const [rows] = await db.execute(query, [shortName]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find department by code
   * @param {string} code - Department code
   * @returns {Promise<Object|null>} Department object
   */
  async findByCode(code) {
    const query = `SELECT * FROM ${this.tableName} WHERE code = ?`;
    const [rows] = await db.execute(query, [code]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Search departments by name, short name, or code
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching departments
   */
  async search(searchTerm) {
    const query = `
      SELECT d.*, f.name as faculty_name, f.short_name as faculty_short_name
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      WHERE d.name LIKE ? OR d.dept_code LIKE ? OR d.code LIKE ?
      ORDER BY d.name ASC
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
    return rows;
  }

  /**
   * Get departments by faculty ID
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Array>} Array of departments
   */
  async getByFacultyId(facultyId) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE faculty_id = ?
      ORDER BY name ASC
    `;
    const [rows] = await db.execute(query, [facultyId]);
    return rows;
  }

  /**
   * Count courses in department
   * @param {number} departmentId - Department ID
   * @returns {Promise<number>} Number of courses
   */
  async countCourses(departmentId) {
    const query = `SELECT COUNT(*) as count FROM courses WHERE department_id = ?`;
    const [rows] = await db.execute(query, [departmentId]);
    return rows[0].count;
  }

  /**
   * Count teachers in department
   * @param {number} departmentId - Department ID
   * @returns {Promise<number>} Number of teachers
   */
  async countTeachers(departmentId) {
    const query = `
      SELECT COUNT(*) as count FROM teachers t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.department_id = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await db.execute(query, [departmentId]);
    return rows[0].count;
  }

  /**
   * Count students in department
   * @param {number} departmentId - Department ID
   * @returns {Promise<number>} Number of students
   */
  async countStudents(departmentId) {
    const query = `
      SELECT COUNT(*) as count FROM students s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.department_id = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await db.execute(query, [departmentId]);
    return rows[0].count;
  }

  /**
   * Check if department is active
   * @param {number} departmentId - Department ID
   * @returns {Promise<boolean>} True if active
   */
  async isActive(departmentId) {
    const department = await this.findById(departmentId);
    return department ? department.is_active : false;
  }

  /**
   * Validate that faculty exists
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<boolean>} True if faculty exists
   */
  async validateFacultyExists(facultyId) {
    const query = `SELECT id FROM faculties WHERE id = ?`;
    const [rows] = await db.execute(query, [facultyId]);
    return rows.length > 0;
  }
}

module.exports = new Department();
