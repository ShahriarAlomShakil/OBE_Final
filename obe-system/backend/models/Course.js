const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * Course Model
 * Represents courses offered by departments
 * Table: courses
 */
class Course extends BaseModel {
  constructor() {
    super('courses');
  }

  /**
   * Get department this course belongs to
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Department with faculty info
   */
  async getDepartment(courseId) {
    const [rows] = await db.execute(
      `SELECT d.*, f.name as faculty_name, f.short_name as faculty_short_name
       FROM departments d
       INNER JOIN faculties f ON d.faculty_id = f.id
       WHERE d.id = (SELECT department_id FROM courses WHERE id = ?)`,
      [courseId]
    );
    return rows[0] || null;
  }

  /**
   * Get all Course Learning Outcomes (CLOs) for this course
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Array of CLOs
   */
  async getCLOs(courseId) {
    const [rows] = await db.execute(
      `SELECT clo.*, btl.name as bloom_level_name, btl.level_number as bloom_level_number
       FROM course_learning_outcomes clo
       LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
       WHERE clo.course_id = ?
       ORDER BY clo.clo_code`,
      [courseId]
    );
    return rows;
  }

  /**
   * Get all Course Objectives for this course
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Array of objectives
   */
  async getObjectives(courseId) {
    const [rows] = await db.execute(
      `SELECT * FROM course_objectives
       WHERE course_id = ?
       ORDER BY objective_number`,
      [courseId]
    );
    return rows;
  }

  /**
   * Get all Course Offerings for this course
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Array of course offerings
   */
  async getOfferings(courseId) {
    const [rows] = await db.execute(
      `SELECT co.*, 
              s.name as semester_name, 
              s.year as semester_year,
              CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
              u.email as teacher_email
       FROM course_offerings co
       INNER JOIN semesters s ON co.semester_id = s.id
       LEFT JOIN teachers t ON co.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE co.course_id = ?
       ORDER BY s.year DESC, s.name DESC`,
      [courseId]
    );
    return rows;
  }

  /**
   * Find course by ID with department relationship
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Course with department
   */
  async findByIdWithDepartment(id) {
    const [rows] = await db.execute(
      `SELECT c.*, 
              d.name as department_name, 
              d.dept_code as department_short_name,
              f.name as faculty_name
       FROM courses c
       INNER JOIN departments d ON c.department_id = d.id
       INNER JOIN faculties f ON d.faculty_id = f.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find course by ID with all relationships
   * @param {number} id - Course ID
   * @returns {Promise<Object>} Course with department, CLOs, objectives, offerings
   */
  async findByIdWithRelations(id) {
    const course = await this.findByIdWithDepartment(id);
    if (!course) return null;

    course.clos = await this.getCLOs(id);
    course.objectives = await this.getObjectives(id);
    course.offerings = await this.getOfferings(id);

    return course;
  }

  /**
   * Get all active courses
   * @returns {Promise<Array>} Active courses
   */
  async getActive() {
    const [rows] = await db.execute(
      `SELECT c.*, 
              d.name as department_name, 
              d.dept_code as department_short_name
       FROM courses c
       INNER JOIN departments d ON c.department_id = d.id
       WHERE c.is_active = 1
       ORDER BY c.course_code`
    );
    return rows;
  }

  /**
   * Find course by code
   * @param {string} code - Course code
   * @returns {Promise<Object>} Course or null
   */
  async findByCode(code) {
    const [rows] = await db.execute(
      'SELECT * FROM courses WHERE course_code = ?',
      [code]
    );
    return rows[0] || null;
  }

  /**
   * Search courses by code or title
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching courses
   */
  async search(searchTerm) {
    const [rows] = await db.execute(
      `SELECT c.*, 
              d.name as department_name, 
              d.dept_code as department_short_name
       FROM courses c
       INNER JOIN departments d ON c.department_id = d.id
       WHERE c.course_code LIKE ? OR c.course_title LIKE ?
       ORDER BY c.course_code`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  /**
   * Get courses by department ID
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Courses in department
   */
  async getByDepartmentId(departmentId) {
    const [rows] = await db.execute(
      `SELECT * FROM courses 
       WHERE department_id = ?
       ORDER BY course_code`,
      [departmentId]
    );
    return rows;
  }

  /**
   * Get courses by credit hours
   * @param {number} creditHours - Credit hours
   * @returns {Promise<Array>} Courses with specified credit hours
   */
  async getByCreditHours(creditHours) {
    const [rows] = await db.execute(
      `SELECT c.*, 
              d.name as department_name
       FROM courses c
       INNER JOIN departments d ON c.department_id = d.id
       WHERE c.credit = ?
       ORDER BY c.course_code`,
      [creditHours]
    );
    return rows;
  }

  /**
   * Count CLOs for a course
   * @param {number} courseId - Course ID
   * @returns {Promise<number>} CLO count
   */
  async countCLOs(courseId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM course_learning_outcomes WHERE course_id = ?',
      [courseId]
    );
    return rows[0].count;
  }

  /**
   * Count objectives for a course
   * @param {number} courseId - Course ID
   * @returns {Promise<number>} Objective count
   */
  async countObjectives(courseId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM course_objectives WHERE course_id = ?',
      [courseId]
    );
    return rows[0].count;
  }

  /**
   * Count offerings for a course
   * @param {number} courseId - Course ID
   * @returns {Promise<number>} Offering count
   */
  async countOfferings(courseId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM course_offerings WHERE course_id = ?',
      [courseId]
    );
    return rows[0].count;
  }

  /**
   * Count enrollments across all offerings of a course
   * @param {number} courseId - Course ID
   * @returns {Promise<number>} Total enrollment count
   */
  async countEnrollments(courseId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM course_enrollments ce
       INNER JOIN course_offerings co ON ce.course_offering_id = co.id
       WHERE co.course_id = ?`,
      [courseId]
    );
    return rows[0].count;
  }

  /**
   * Check if course is active
   * @param {number} courseId - Course ID
   * @returns {Promise<boolean>} True if active
   */
  async isActive(courseId) {
    const course = await this.findById(courseId);
    return course ? course.is_active === 1 : false;
  }

  /**
   * Validate department exists and is active
   * @param {number} departmentId - Department ID
   * @returns {Promise<boolean>} True if valid
   */
  async validateDepartmentExists(departmentId) {
    const [rows] = await db.execute(
      'SELECT id FROM departments WHERE id = ? AND is_active = 1',
      [departmentId]
    );
    return rows.length > 0;
  }

  /**
   * Validate credit hours calculation
   * @param {number} creditHours - Total credit hours
   * @param {number} theoryHours - Theory hours per week
   * @param {number} labHours - Lab hours per week
   * @returns {boolean} True if valid
   */
  validateCreditHours(creditHours, theoryHours, labHours) {
    // Common formula: Credit Hours = Theory Hours + (Lab Hours / 2)
    const calculatedCredits = theoryHours + (labHours / 2);
    return Math.abs(creditHours - calculatedCredits) < 0.1; // Allow small floating point differences
  }

  /**
   * Get course prerequisites
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Array of prerequisite courses
   */
  async getPrerequisites(courseId) {
    const [rows] = await db.execute(
      `SELECT c.* 
       FROM courses c
       INNER JOIN course_prerequisites cp ON c.id = cp.prerequisite_course_id
       WHERE cp.course_id = ?`,
      [courseId]
    );
    return rows;
  }

  /**
   * Get courses that have this as a prerequisite
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Array of courses requiring this as prerequisite
   */
  async getDependentCourses(courseId) {
    const [rows] = await db.execute(
      `SELECT c.* 
       FROM courses c
       INNER JOIN course_prerequisites cp ON c.id = cp.course_id
       WHERE cp.prerequisite_course_id = ?`,
      [courseId]
    );
    return rows;
  }

  /**
   * Get statistics for a course
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(courseId) {
    const [cloCount] = await db.execute(
      'SELECT COUNT(*) as count FROM course_learning_outcomes WHERE course_id = ?',
      [courseId]
    );
    const [objectiveCount] = await db.execute(
      'SELECT COUNT(*) as count FROM course_objectives WHERE course_id = ?',
      [courseId]
    );
    const [offeringCount] = await db.execute(
      'SELECT COUNT(*) as count FROM course_offerings WHERE course_id = ?',
      [courseId]
    );
    const [enrollmentCount] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM course_enrollments ce
       INNER JOIN course_offerings co ON ce.course_offering_id = co.id
       WHERE co.course_id = ?`,
      [courseId]
    );

    return {
      clo_count: cloCount[0].count,
      objective_count: objectiveCount[0].count,
      offering_count: offeringCount[0].count,
      total_enrollments: enrollmentCount[0].count
    };
  }
}

module.exports = new Course();
