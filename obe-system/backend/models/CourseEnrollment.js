const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * CourseEnrollment Model
 * Represents student enrollments in course offerings
 */
class CourseEnrollment extends BaseModel {
  constructor() {
    super('course_enrollments');
  }

  /**
   * Get course offering details for an enrollment
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Course offering with course details
   */
  async getCourseOffering(enrollmentId) {
    const [rows] = await db.execute(
      `SELECT co.*, 
              c.course_code, c.course_title as course_title, c.credit,
              c.theory_hours, c.lab_hours, c.tutorial_hours,
              s.name as semester_name, s.year as semester_year, s.type as semester_type,
              d.name as department_name
       FROM course_offerings co
       INNER JOIN courses c ON co.course_id = c.id
       INNER JOIN semesters s ON co.semester_id = s.id
       INNER JOIN departments d ON co.department_id = d.id
       INNER JOIN course_enrollments ce ON ce.course_offering_id = co.id
       WHERE ce.id = ? AND co.deleted_at IS NULL`,
      [enrollmentId]
    );
    return rows[0] || null;
  }

  /**
   * Get student details for an enrollment
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Student with user details
   */
  async getStudent(enrollmentId) {
    const [rows] = await db.execute(
      `SELECT s.*, 
              u.name as student_name, u.email,
              d.name as department_name,
              deg.name as degree_name, deg.short_name as degree_short_name
       FROM students s
       INNER JOIN users u ON s.user_id = u.id
       INNER JOIN departments d ON s.department_id = d.id
       INNER JOIN degrees deg ON s.degree_id = deg.id
       INNER JOIN course_enrollments ce ON ce.student_id = s.id
       WHERE ce.id = ? AND s.deleted_at IS NULL AND u.deleted_at IS NULL`,
      [enrollmentId]
    );
    return rows[0] || null;
  }

  /**
   * Get all enrollments for a specific course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Array>} Array of enrollments with student details
   */
  async getByCourseOffering(courseOfferingId) {
    const [rows] = await db.execute(
      `SELECT ce.*, 
              s.student_id as roll_number, s.batch, s.section as student_section,
              u.name as student_name, u.email
       FROM course_enrollments ce
       INNER JOIN students s ON ce.student_id = s.id
       INNER JOIN users u ON s.user_id = u.id
       WHERE ce.course_offering_id = ? 
         AND ce.deleted_at IS NULL 
         AND s.deleted_at IS NULL 
         AND u.deleted_at IS NULL
       ORDER BY u.name ASC`,
      [courseOfferingId]
    );
    return rows;
  }

  /**
   * Get all enrollments for a specific student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Array of enrollments with course offering details
   */
  async getByStudent(studentId) {
    const [rows] = await db.execute(
      `SELECT ce.*, 
              co.section, co.max_students,
              c.course_code, c.course_title as course_title, c.credit,
              s.name as semester_name, s.year as semester_year, s.type as semester_type,
              u.name as teacher_name
       FROM course_enrollments ce
       INNER JOIN course_offerings co ON ce.course_offering_id = co.id
       INNER JOIN courses c ON co.course_id = c.id
       INNER JOIN semesters s ON co.semester_id = s.id
       LEFT JOIN teachers t ON co.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE ce.student_id = ? 
         AND ce.deleted_at IS NULL 
         AND co.deleted_at IS NULL
       ORDER BY s.year DESC, s.id DESC`,
      [studentId]
    );
    return rows;
  }

  /**
   * Check if a student is already enrolled in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} True if enrolled, false otherwise
   */
  async isEnrolled(courseOfferingId, studentId) {
    const [rows] = await db.execute(
      `SELECT id FROM course_enrollments 
       WHERE course_offering_id = ? 
         AND student_id = ? 
         AND deleted_at IS NULL`,
      [courseOfferingId, studentId]
    );
    return rows.length > 0;
  }

  /**
   * Get enrollment count for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<number>} Number of enrolled students
   */
  async getEnrollmentCount(courseOfferingId) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM course_enrollments 
       WHERE course_offering_id = ? 
         AND deleted_at IS NULL`,
      [courseOfferingId]
    );
    return rows[0]?.count || 0;
  }

  /**
   * Get enrollment by course offering and student
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object|null>} Enrollment record or null
   */
  async getByOfferingAndStudent(courseOfferingId, studentId) {
    const [rows] = await db.execute(
      `SELECT * FROM course_enrollments 
       WHERE course_offering_id = ? 
         AND student_id = ? 
         AND deleted_at IS NULL`,
      [courseOfferingId, studentId]
    );
    return rows[0] || null;
  }

  /**
   * Get active enrollments by student and semester
   * @param {number} studentId - Student ID
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Array>} Array of active enrollments
   */
  async getByStudentAndSemester(studentId, semesterId) {
    const [rows] = await db.execute(
      `SELECT ce.*, 
              co.section,
              c.course_code, c.course_title as course_title, c.credit
       FROM course_enrollments ce
       INNER JOIN course_offerings co ON ce.course_offering_id = co.id
       INNER JOIN courses c ON co.course_id = c.id
       WHERE ce.student_id = ? 
         AND co.semester_id = ?
         AND ce.status = 'active'
         AND ce.deleted_at IS NULL 
         AND co.deleted_at IS NULL
       ORDER BY c.course_code ASC`,
      [studentId, semesterId]
    );
    return rows;
  }

  /**
   * Get enrollments with assessment marks
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Array>} Array of enrollments with marks
   */
  async getWithMarks(courseOfferingId) {
    const [rows] = await db.execute(
      `SELECT ce.*, 
              s.student_id as roll_number,
              u.name as student_name, u.email,
              (SELECT COUNT(*) FROM student_assessment_marks sam
               INNER JOIN assessment_components ac ON sam.assessment_component_id = ac.id
               WHERE sam.student_id = ce.student_id 
                 AND ac.course_offering_id = ce.course_offering_id
                 AND sam.deleted_at IS NULL) as total_assessments,
              (SELECT SUM(sam.marks_obtained) FROM student_assessment_marks sam
               INNER JOIN assessment_components ac ON sam.assessment_component_id = ac.id
               WHERE sam.student_id = ce.student_id 
                 AND ac.course_offering_id = ce.course_offering_id
                 AND sam.deleted_at IS NULL) as total_marks
       FROM course_enrollments ce
       INNER JOIN students s ON ce.student_id = s.id
       INNER JOIN users u ON s.user_id = u.id
       WHERE ce.course_offering_id = ? 
         AND ce.deleted_at IS NULL 
         AND s.deleted_at IS NULL 
         AND u.deleted_at IS NULL
       ORDER BY u.name ASC`,
      [courseOfferingId]
    );
    return rows;
  }
}

module.exports = new CourseEnrollment();
