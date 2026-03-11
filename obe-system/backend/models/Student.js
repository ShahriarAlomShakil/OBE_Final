const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * Student Model
 * Represents students in the OBE system with academic and enrollment information
 */
class Student extends BaseModel {
  constructor() {
    super('students');
  }

  /**
   * Get user account associated with this student
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} User object with profile data
   */
  async getUser(studentId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.username, u.role, u.status,
              u.email_verified_at, u.profile_picture, u.created_at
       FROM users u
       INNER JOIN students s ON s.user_id = u.id
       WHERE s.id = ? AND u.deleted_at IS NULL`,
      [studentId]
    );
    return rows[0] || null;
  }

  /**
   * Get department with faculty info
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Department with faculty
   */
  async getDepartment(studentId) {
    const [rows] = await db.execute(
      `SELECT d.*, f.id as faculty_id, f.name as faculty_name, 
              f.short_name as faculty_short_name
       FROM departments d
       INNER JOIN faculties f ON d.faculty_id = f.id
       INNER JOIN students s ON s.department_id = d.id
       WHERE s.id = ?`,
      [studentId]
    );
    return rows[0] || null;
  }

  /**
   * Get degree program information
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Degree with department info
   */
  async getDegree(studentId) {
    const [rows] = await db.execute(
      `SELECT deg.*, d.name as department_name, d.dept_code as department_short_name
       FROM degrees deg
       INNER JOIN departments d ON deg.department_id = d.id
       INNER JOIN students s ON s.degree_id = deg.id
       WHERE s.id = ?`,
      [studentId]
    );
    return rows[0] || null;
  }

  /**
   * Get all course enrollments for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Array of enrollments with course and offering details
   */
  async getEnrollments(studentId) {
    const [rows] = await db.execute(
      `SELECT ce.*, co.section, co.semester_id,
              c.course_code, c.course_title as course_title, c.credit,
              s.name as semester_name, s.year as semester_year,
              u.name as teacher_name
       FROM course_enrollments ce
       INNER JOIN course_offerings co ON ce.course_offering_id = co.id
       INNER JOIN courses c ON co.course_id = c.id
       INNER JOIN semesters s ON co.semester_id = s.id
       LEFT JOIN teachers t ON co.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE ce.student_id = ?
       ORDER BY s.year DESC, s.semester_number DESC`,
      [studentId]
    );
    return rows;
  }

  /**
   * Get all assessment results/marks for a student
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Optional course offering filter
   * @returns {Promise<Array>} Array of marks with assessment details
   */
  async getResults(studentId, courseOfferingId = null) {
    let query = `
      SELECT sam.*, ac.name as assessment_name, ac.total_marks, ac.weightage,
             ac.date as assessment_date,
             at.name as assessment_type,
             c.course_code, c.course_title as course_title,
             co.section, s.name as semester_name
      FROM student_assessment_marks sam
      INNER JOIN assessment_components ac ON sam.assessment_component_id = ac.id
      INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
      INNER JOIN course_offerings co ON ac.course_offering_id = co.id
      INNER JOIN courses c ON co.course_id = c.id
      INNER JOIN semesters s ON co.semester_id = s.id
      WHERE sam.student_id = ?`;
    
    const params = [studentId];
    
    if (courseOfferingId) {
      query += ` AND co.id = ?`;
      params.push(courseOfferingId);
    }
    
    query += ` ORDER BY ac.date DESC`;
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Get CLO attainments for a student
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Optional course offering filter
   * @returns {Promise<Array>} Array of CLO attainments
   */
  async getCLOAttainments(studentId, courseOfferingId = null) {
    let query = `
      SELECT sca.*, clo.clo_code, clo.description as clo_description,
             c.course_code, c.course_title as course_title,
             co.section, s.name as semester_name,
             btl.name as bloom_level
      FROM student_clo_attainment sca
      INNER JOIN course_learning_outcomes clo ON sca.clo_id = clo.id
      INNER JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
      INNER JOIN courses c ON clo.course_id = c.id
      INNER JOIN course_offerings co ON sca.course_offering_id = co.id
      INNER JOIN semesters s ON co.semester_id = s.id
      WHERE sca.student_id = ?`;
    
    const params = [studentId];
    
    if (courseOfferingId) {
      query += ` AND co.id = ?`;
      params.push(courseOfferingId);
    }
    
    query += ` ORDER BY c.course_code, clo.clo_code`;
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Get PLO attainments for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Array of PLO attainments
   */
  async getPLOAttainments(studentId) {
    const [rows] = await db.execute(
      `SELECT spa.*, plo.plo_code, plo.description as plo_description,
              plo.plo_domain,
              deg.name as degree_name, deg.short_name as degree_short_name
       FROM student_plo_attainment spa
       INNER JOIN program_learning_outcomes plo ON spa.plo_id = plo.id
       INNER JOIN degrees deg ON plo.degree_id = deg.id
       WHERE spa.student_id = ?
       ORDER BY plo.plo_code`,
      [studentId]
    );
    return rows;
  }

  /**
   * Find student by ID with user and academic info
   * @param {number} id - Student ID
   * @returns {Promise<Object|null>} Student with relations
   */
  async findByIdWithRelations(id) {
    const [rows] = await db.execute(
      `SELECT s.*, 
              u.name as user_name, u.email, u.username,
              d.name as department_name, d.dept_code as department_short_name,
              deg.name as degree_name, deg.short_name as degree_short_name,
              f.name as faculty_name
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN departments d ON s.department_id = d.id
       INNER JOIN degrees deg ON s.degree_id = deg.id
       INNER JOIN faculties f ON d.faculty_id = f.id
       WHERE s.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find student by student_id (roll number)
   * @param {string} studentId - Student roll number
   * @returns {Promise<Object|null>} Student record
   */
  async findByStudentId(studentId) {
    const [rows] = await db.execute(
      `SELECT s.*, u.name as user_name, u.email
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.student_id = ? AND u.deleted_at IS NULL`,
      [studentId]
    );
    return rows[0] || null;
  }

  /**
   * Find student by user_id
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Student record
   */
  async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT s.* FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ? AND u.deleted_at IS NULL`,
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Get all active students
   * @returns {Promise<Array>} Array of active students
   */
  async getActive() {
    const [rows] = await db.execute(
      `SELECT s.*, u.name as user_name, u.email,
              d.name as department_name, deg.name as degree_name
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN departments d ON s.department_id = d.id
       INNER JOIN degrees deg ON s.degree_id = deg.id
       WHERE u.status = 'active' AND u.deleted_at IS NULL
       ORDER BY s.student_id`
    );
    return rows;
  }

  /**
   * Get student statistics (counts by status)
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    const [totalRows] = await db.execute(
      `SELECT COUNT(*) as total FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE u.deleted_at IS NULL`
    );

    const [statusRows] = await db.execute(
      `SELECT 
         s.status,
         COUNT(*) as count
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE u.deleted_at IS NULL
       GROUP BY s.status`
    );

    const [activeRows] = await db.execute(
      `SELECT COUNT(*) as active FROM students s
       INNER JOIN users u ON s.user_id = u.id
       WHERE s.status = 'active' AND u.deleted_at IS NULL`
    );

    const stats = {
      total: totalRows[0].total,
      active: activeRows[0].active,
      byStatus: {}
    };

    // Convert status rows to object
    statusRows.forEach(row => {
      stats.byStatus[row.status] = row.count;
    });

    return stats;
  }

  /**
   * Search students by name, student_id, or email
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching students
   */
  async search(searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await db.execute(
      `SELECT s.*, u.name as user_name, u.email,
              d.name as department_name, deg.name as degree_name
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN departments d ON s.department_id = d.id
       INNER JOIN degrees deg ON s.degree_id = deg.id
       WHERE (u.name LIKE ? OR s.student_id LIKE ? OR u.email LIKE ?)
         AND u.deleted_at IS NULL
       ORDER BY s.student_id
       LIMIT 50`,
      [searchPattern, searchPattern, searchPattern]
    );
    return rows;
  }

  /**
   * Get students by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Students in department
   */
  async getByDepartmentId(departmentId) {
    const [rows] = await db.execute(
      `SELECT s.*, u.name as user_name, u.email,
              deg.name as degree_name
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN degrees deg ON s.degree_id = deg.id
       WHERE s.department_id = ? AND u.deleted_at IS NULL
       ORDER BY s.batch DESC, s.student_id`,
      [departmentId]
    );
    return rows;
  }

  /**
   * Get students by degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Students in degree
   */
  async getByDegreeId(degreeId) {
    const [rows] = await db.execute(
      `SELECT s.*, u.name as user_name, u.email,
              d.name as department_name
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN departments d ON s.department_id = d.id
       WHERE s.degree_id = ? AND u.deleted_at IS NULL
       ORDER BY s.batch DESC, s.student_id`,
      [degreeId]
    );
    return rows;
  }

  /**
   * Get students by batch
   * @param {string} batch - Batch year (e.g., "2023")
   * @param {number} departmentId - Optional department filter
   * @returns {Promise<Array>} Students in batch
   */
  async getByBatch(batch, departmentId = null) {
    let query = `
      SELECT s.*, u.name as user_name, u.email,
             d.name as department_name, deg.name as degree_name
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN departments d ON s.department_id = d.id
      INNER JOIN degrees deg ON s.degree_id = deg.id
      WHERE s.batch = ? AND u.deleted_at IS NULL`;
    
    const params = [batch];
    
    if (departmentId) {
      query += ` AND s.department_id = ?`;
      params.push(departmentId);
    }
    
    query += ` ORDER BY s.student_id`;
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Get students by section
   * @param {string} section - Section (e.g., "A", "B")
   * @param {string} batch - Batch year
   * @param {number} departmentId - Optional department filter
   * @returns {Promise<Array>} Students in section
   */
  async getBySection(section, batch, departmentId = null) {
    let query = `
      SELECT s.*, u.name as user_name, u.email,
             d.name as department_name, deg.name as degree_name
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      INNER JOIN departments d ON s.department_id = d.id
      INNER JOIN degrees deg ON s.degree_id = deg.id
      WHERE s.section = ? AND s.batch = ? AND u.deleted_at IS NULL`;
    
    const params = [section, batch];
    
    if (departmentId) {
      query += ` AND s.department_id = ?`;
      params.push(departmentId);
    }
    
    query += ` ORDER BY s.student_id`;
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Count enrollments for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<number>} Enrollment count
   */
  async countEnrollments(studentId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count
       FROM course_enrollments
       WHERE student_id = ?`,
      [studentId]
    );
    return rows[0].count;
  }

  /**
   * Count completed courses for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<number>} Completed course count
   */
  async countCompletedCourses(studentId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count
       FROM course_enrollments
       WHERE student_id = ? AND status = 'completed'`,
      [studentId]
    );
    return rows[0].count;
  }

  /**
   * Get statistics for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Student statistics
   */
  async getStatistics(studentId) {
    const [enrollmentStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_enrollments,
         SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END) as active_enrollments,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_courses,
         SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) as dropped_courses
       FROM course_enrollments
       WHERE student_id = ?`,
      [studentId]
    );

    const [cloStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_clos_assessed,
         SUM(CASE WHEN is_attained = 1 THEN 1 ELSE 0 END) as clos_attained,
         AVG(attainment_percentage) as avg_clo_attainment
       FROM student_clo_attainment
       WHERE student_id = ?`,
      [studentId]
    );

    const [ploStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_plos,
         AVG(attainment_percentage) as avg_plo_attainment
       FROM student_plo_attainment
       WHERE student_id = ?`,
      [studentId]
    );

    return {
      enrollments: enrollmentStats[0],
      clo_attainment: cloStats[0],
      plo_attainment: ploStats[0]
    };
  }

  /**
   * Validate that user exists and has student role
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If user doesn't exist or isn't a student
   */
  async validateUserExists(userId) {
    const [rows] = await db.execute(
      `SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL`,
      [userId]
    );
    
    if (rows.length === 0) {
      throw new Error('User not found');
    }
    
    if (rows[0].role !== 'student') {
      throw new Error('User must have student role');
    }
    
    return true;
  }

  /**
   * Validate that department exists and is active
   * @param {number} departmentId - Department ID
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If department doesn't exist
   */
  async validateDepartmentExists(departmentId) {
    const [rows] = await db.execute(
      `SELECT id, is_active FROM departments WHERE id = ?`,
      [departmentId]
    );
    
    if (rows.length === 0) {
      throw new Error('Department not found');
    }
    
    return true;
  }

  /**
   * Validate that degree exists and is active
   * @param {number} degreeId - Degree ID
   * @returns {Promise<boolean>} True if valid
   * @throws {Error} If degree doesn't exist
   */
  async validateDegreeExists(degreeId) {
    const [rows] = await db.execute(
      `SELECT id, is_active FROM degrees WHERE id = ?`,
      [degreeId]
    );
    
    if (rows.length === 0) {
      throw new Error('Degree not found');
    }
    
    return true;
  }

  /**
   * Validate admission date (cannot be future)
   * @param {string} admissionDate - Admission date
   * @returns {boolean} True if valid
   * @throws {Error} If date is invalid
   */
  validateAdmissionDate(admissionDate) {
    const date = new Date(admissionDate);
    const now = new Date();
    
    if (date > now) {
      throw new Error('Admission date cannot be in the future');
    }
    
    return true;
  }
}

module.exports = new Student();
