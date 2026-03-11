const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * Course Offering Model
 * Represents course offerings per semester with sections and enrollment management
 * Table: course_offerings
 */
class CourseOffering extends BaseModel {
  constructor() {
    super('course_offerings');
    this.fillable = [
      'course_id',
      'semester_id',
      'section',
      'max_students',
      'enrolled_count',
      'classroom',
      'schedule',
      'status'
    ];
  }

  /**
   * Get course this offering belongs to
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Object|null>} Course object with department info
   */
  async getCourse(offeringId) {
    const [rows] = await db.execute(
      `SELECT c.*, 
              d.name as department_name, 
              d.dept_code as department_short_name,
              f.name as faculty_name, 
              f.short_name as faculty_short_name
       FROM courses c
       INNER JOIN departments d ON c.department_id = d.id
       INNER JOIN faculties f ON d.faculty_id = f.id
       WHERE c.id = (SELECT course_id FROM course_offerings WHERE id = ?)`,
      [offeringId]
    );
    return rows[0] || null;
  }

  /**
   * Get semester this offering belongs to
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Object|null>} Semester object with academic session info
   */
  async getSemester(offeringId) {
    const [rows] = await db.execute(
      `SELECT s.*, 
              acs.year as session_year,
              acs.name as session_name
       FROM semesters s
       INNER JOIN academic_sessions acs ON s.academic_session_id = acs.id
       WHERE s.id = (SELECT semester_id FROM course_offerings WHERE id = ?)`,
      [offeringId]
    );
    return rows[0] || null;
  }

  /**
   * Get primary teacher (instructor) for this offering
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Object|null>} Teacher object with user info
   */
  async getTeacher(offeringId) {
    const [rows] = await db.execute(
      `SELECT t.*, 
              u.first_name,
              u.last_name,
              u.email,
              u.phone,
              tc.role as teaching_role
       FROM teacher_course tc
       INNER JOIN teachers t ON tc.teacher_id = t.id
       INNER JOIN users u ON t.user_id = u.id
       WHERE tc.course_offering_id = ? AND tc.role = 'instructor'
       LIMIT 1`,
      [offeringId]
    );
    return rows[0] || null;
  }

  /**
   * Get all teachers assigned to this offering (instructors, co-instructors, TAs)
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Array>} Array of teachers with their roles
   */
  async getTeachers(offeringId) {
    const [rows] = await db.execute(
      `SELECT t.*, 
              u.first_name,
              u.last_name,
              u.email,
              u.phone,
              tc.role as teaching_role,
              tc.lessons
       FROM teacher_course tc
       INNER JOIN teachers t ON tc.teacher_id = t.id
       INNER JOIN users u ON t.user_id = u.id
       WHERE tc.course_offering_id = ?
       ORDER BY 
         CASE tc.role
           WHEN 'instructor' THEN 1
           WHEN 'co_instructor' THEN 2
           WHEN 'lab_instructor' THEN 3
           WHEN 'teaching_assistant' THEN 4
         END`,
      [offeringId]
    );
    return rows;
  }

  /**
   * Get all enrolled students for this offering
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Array>} Array of enrolled students
   */
  async getEnrollments(offeringId) {
    const [rows] = await db.execute(
      `SELECT ce.*, 
              s.roll_number,
              s.registration_number,
              u.first_name,
              u.last_name,
              u.email,
              gp.letter_grade,
              gp.grade_point
       FROM course_enrollments ce
       INNER JOIN students s ON ce.student_id = s.id
       INNER JOIN users u ON s.user_id = u.id
       LEFT JOIN grade_points gp ON ce.grade_id = gp.id
       WHERE ce.course_offering_id = ? AND ce.deleted_at IS NULL
       ORDER BY s.roll_number`,
      [offeringId]
    );
    return rows;
  }

  /**
   * Get assessment components for this offering
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Array>} Array of assessment components with type info
   */
  async getAssessments(offeringId) {
    const [rows] = await db.execute(
      `SELECT ac.*, 
              at.name as assessment_type_name,
              at.category as assessment_category
       FROM assessment_components ac
       INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
       WHERE ac.course_offering_id = ?
       ORDER BY ac.weightage DESC, ac.name`,
      [offeringId]
    );
    return rows;
  }

  /**
   * Get CLO attainment summary for this offering
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Array>} Array of CLO attainment data
   */
  async getCLOAttainmentSummary(offeringId) {
    const [rows] = await db.execute(
      `SELECT clo.id as clo_id,
              clo.clo_code,
              clo.description as clo_description,
              COUNT(DISTINCT scm.student_id) as students_assessed,
              AVG(scm.clo_marks_obtained / scm.clo_total_marks * 100) as avg_attainment_percent,
              btl.name as bloom_level_name,
              btl.level_number as bloom_level_number
       FROM course_learning_outcomes clo
       LEFT JOIN student_clo_attainment scm ON clo.id = scm.clo_id AND scm.course_offering_id = ?
       LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
       WHERE clo.course_id = (SELECT course_id FROM course_offerings WHERE id = ?)
       GROUP BY clo.id, clo.clo_code, clo.description, btl.name, btl.level_number
       ORDER BY clo.clo_code`,
      [offeringId, offeringId]
    );
    return rows;
  }

  /**
   * Get offering with all relationships
   * @param {number} id - Course offering ID
   * @returns {Promise<Object|null>} Course offering with related data
   */
  async findByIdWithRelations(id) {
    const [rows] = await db.execute(
      `SELECT co.*,
              c.course_code as course_code,
              c.course_title as course_title,
              c.credit as credit_hours,
              s.name as semester_name,
              s.semester_type,
              s.start_date as semester_start,
              s.end_date as semester_end,
              acs.session_name as session_year,
              d.name as department_name
       FROM course_offerings co
       INNER JOIN courses c ON co.course_id = c.id
       INNER JOIN semesters s ON co.semester_id = s.id
       INNER JOIN academic_sessions acs ON s.academic_session_id = acs.id
       INNER JOIN departments d ON c.department_id = d.id
       WHERE co.id = ? AND co.deleted_at IS NULL`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }

    const offering = rows[0];
    
    // Attach teachers
    offering.teachers = await this.getTeachers(id);
    offering.primary_teacher = offering.teachers.find(t => t.teaching_role === 'instructor') || null;
    
    return offering;
  }

  /**
   * Get offerings by semester ID
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Array>} Array of course offerings
   */
  async getBySemesterId(semesterId) {
    const [rows] = await db.execute(
      `SELECT co.*,
              c.course_code as course_code,
              c.course_title as course_title,
              c.credit as credit_hours,
              COUNT(DISTINCT ce.id) as enrollment_count
       FROM course_offerings co
       INNER JOIN courses c ON co.course_id = c.id
       LEFT JOIN course_enrollments ce ON co.id = ce.course_offering_id AND ce.deleted_at IS NULL
       WHERE co.semester_id = ? AND co.deleted_at IS NULL
       GROUP BY co.id
       ORDER BY c.course_code, co.section`,
      [semesterId]
    );
    return rows;
  }

  /**
   * Get offerings by course ID
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Array of course offerings
   */
  async getByCourseId(courseId) {
    const [rows] = await db.execute(
      `SELECT co.*,
              s.name as semester_name,
              s.semester_type,
              s.start_date as semester_start,
              s.end_date as semester_end
       FROM course_offerings co
       INNER JOIN semesters s ON co.semester_id = s.id
       WHERE co.course_id = ? AND co.deleted_at IS NULL
       ORDER BY s.start_date DESC, co.section`,
      [courseId]
    );
    return rows;
  }

  /**
   * Get active offerings (status: open or ongoing)
   * @returns {Promise<Array>} Array of active course offerings
   */
  async getActive() {
    const [rows] = await db.execute(
      `SELECT co.*,
              c.course_code as course_code,
              c.course_title as course_title,
              s.name as semester_name
       FROM course_offerings co
       INNER JOIN courses c ON co.course_id = c.id
       INNER JOIN semesters s ON co.semester_id = s.id
       WHERE co.status IN ('open', 'ongoing') 
       AND co.deleted_at IS NULL
       AND s.is_active = TRUE
       ORDER BY c.course_code, co.section`
    );
    return rows;
  }

  /**
   * Assign teacher to course offering
   * @param {number} offeringId - Course offering ID
   * @param {number} teacherId - Teacher ID
   * @param {string} role - Teaching role (instructor, co_instructor, lab_instructor, teaching_assistant)
   * @returns {Promise<Object>} Assignment result
   */
  async assignTeacher(offeringId, teacherId, role = 'instructor') {
    const [result] = await db.execute(
      `INSERT INTO teacher_course (teacher_id, course_offering_id, role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role)`,
      [teacherId, offeringId, role]
    );
    return { id: result.insertId, teacher_id: teacherId, course_offering_id: offeringId, role };
  }

  /**
   * Remove teacher from course offering
   * @param {number} offeringId - Course offering ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<boolean>} Success status
   */
  async removeTeacher(offeringId, teacherId) {
    const [result] = await db.execute(
      `DELETE FROM teacher_course 
       WHERE course_offering_id = ? AND teacher_id = ?`,
      [offeringId, teacherId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update enrollment count for offering
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<number>} Updated enrollment count
   */
  async updateEnrollmentCount(offeringId) {
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM course_enrollments 
       WHERE course_offering_id = ? AND deleted_at IS NULL`,
      [offeringId]
    );
    
    const count = countResult[0].count;
    
    await db.execute(
      `UPDATE course_offerings 
       SET enrolled_count = ? 
       WHERE id = ?`,
      [count, offeringId]
    );
    
    return count;
  }

  /**
   * Check if offering has capacity for more students
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<boolean>} True if has capacity
   */
  async hasCapacity(offeringId) {
    const [rows] = await db.execute(
      `SELECT max_students, enrolled_count 
       FROM course_offerings 
       WHERE id = ?`,
      [offeringId]
    );
    
    if (rows.length === 0) {
      return false;
    }
    
    const { max_students, enrolled_count } = rows[0];
    return enrolled_count < max_students;
  }

  /**
   * Get offering statistics
   * @param {number} offeringId - Course offering ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(offeringId) {
    const [stats] = await db.execute(
      `SELECT 
         co.max_students,
         co.enrolled_count,
         COUNT(DISTINCT ce.id) as actual_enrollment,
         COUNT(DISTINCT ac.id) as assessment_count,
         COUNT(DISTINCT tc.teacher_id) as teacher_count,
         AVG(CASE WHEN sam.marks_obtained IS NOT NULL 
             THEN (sam.marks_obtained / sam.total_marks * 100) 
             END) as avg_performance
       FROM course_offerings co
       LEFT JOIN course_enrollments ce ON co.id = ce.course_offering_id AND ce.deleted_at IS NULL
       LEFT JOIN assessment_components ac ON co.id = ac.course_offering_id
       LEFT JOIN teacher_course tc ON co.id = tc.course_offering_id
       LEFT JOIN student_assessment_marks sam ON ce.id = sam.enrollment_id
       WHERE co.id = ?
       GROUP BY co.id, co.max_students, co.enrolled_count`,
      [offeringId]
    );
    
    return stats[0] || null;
  }
}

module.exports = new CourseOffering();
