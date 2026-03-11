const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * StudentMark Model
 * Represents student marks for assessment components
 */
class StudentMark extends BaseModel {
  constructor() {
    super('student_assessment_marks');
    this.fillable = [
      'student_id',
      'assessment_component_id',
      'marks_obtained',
      'marks_total',
      'percentage',
      'is_absent',
      'remarks',
      'entered_by',
      'entered_at'
    ];
  }

  /**
   * Get student details for a mark entry
   * @param {number} markId - Mark ID
   * @returns {Promise<Object|null>}
   */
  async getStudent(markId) {
    const query = `
      SELECT s.*, u.name as student_name, u.email
      FROM students s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.id = (
        SELECT student_id 
        FROM student_assessment_marks 
        WHERE id = ? AND deleted_at IS NULL
      )
    `;
    const [rows] = await db.query(query, [markId]);
    return rows[0] || null;
  }

  /**
   * Get assessment component details for a mark entry
   * @param {number} markId - Mark ID
   * @returns {Promise<Object|null>}
   */
  async getAssessmentComponent(markId) {
    const query = `
      SELECT ac.*, 
             at.name as assessment_type_name,
             co.course_id, 
             c.course_code, 
             c.course_name
      FROM assessment_components ac
      INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
      INNER JOIN course_offerings co ON ac.course_offering_id = co.id
      INNER JOIN courses c ON co.course_id = c.id
      WHERE ac.id = (
        SELECT assessment_component_id 
        FROM student_assessment_marks 
        WHERE id = ? AND deleted_at IS NULL
      )
    `;
    const [rows] = await db.query(query, [markId]);
    return rows[0] || null;
  }

  /**
   * Get all marks for a specific assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getByAssessmentComponent(assessmentComponentId, options = {}) {
    const { includeAbsent = true, orderBy = 'student_id ASC' } = options;
    
    let query = `
      SELECT sam.*,
             s.roll_number, s.cgpa,
             u.name as student_name, u.email,
             ue.name as entered_by_name
      FROM student_assessment_marks sam
      INNER JOIN students s ON sam.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      LEFT JOIN users ue ON sam.entered_by = ue.id
      WHERE sam.assessment_component_id = ? 
        AND sam.deleted_at IS NULL
    `;

    if (!includeAbsent) {
      query += ' AND sam.is_absent = FALSE';
    }

    query += ` ORDER BY ${orderBy}`;

    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows;
  }

  /**
   * Get all marks for a specific student in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Array>}
   */
  async getByStudentAndCourseOffering(studentId, courseOfferingId) {
    const query = `
      SELECT sam.*,
             ac.name as assessment_name,
             ac.total_marks as assessment_total_marks,
             ac.weight_percentage,
             ac.scheduled_date,
             at.name as assessment_type_name
      FROM student_assessment_marks sam
      INNER JOIN assessment_components ac ON sam.assessment_component_id = ac.id
      INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
      WHERE sam.student_id = ? 
        AND ac.course_offering_id = ?
        AND sam.deleted_at IS NULL
        AND ac.deleted_at IS NULL
      ORDER BY ac.scheduled_date ASC, ac.id ASC
    `;
    const [rows] = await db.query(query, [studentId, courseOfferingId]);
    return rows;
  }

  /**
   * Get marks summary for a student in a course offering
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>}
   */
  async getStudentSummary(studentId, courseOfferingId) {
    const query = `
      SELECT 
        COUNT(DISTINCT sam.assessment_component_id) as total_assessments,
        COUNT(DISTINCT CASE WHEN sam.is_absent = FALSE THEN sam.assessment_component_id END) as completed_assessments,
        COUNT(DISTINCT CASE WHEN sam.is_absent = TRUE THEN sam.assessment_component_id END) as absent_count,
        SUM(CASE WHEN sam.is_absent = FALSE THEN (sam.marks_obtained / sam.marks_total) * ac.weight_percentage ELSE 0 END) as weighted_total,
        SUM(ac.weight_percentage) as total_weight,
        AVG(CASE WHEN sam.is_absent = FALSE THEN sam.percentage END) as average_percentage
      FROM student_assessment_marks sam
      INNER JOIN assessment_components ac ON sam.assessment_component_id = ac.id
      WHERE sam.student_id = ? 
        AND ac.course_offering_id = ?
        AND sam.deleted_at IS NULL
        AND ac.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [studentId, courseOfferingId]);
    return rows[0] || null;
  }

  /**
   * Check if marks already exist for a student and assessment
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<boolean>}
   */
  async marksExist(studentId, assessmentComponentId) {
    const query = `
      SELECT COUNT(*) as count
      FROM student_assessment_marks
      WHERE student_id = ? 
        AND assessment_component_id = ?
        AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [studentId, assessmentComponentId]);
    return rows[0].count > 0;
  }

  /**
   * Get mark entry by student and assessment (for updates)
   * @param {number} studentId - Student ID
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object|null>}
   */
  async findByStudentAndAssessment(studentId, assessmentComponentId) {
    const query = `
      SELECT * FROM student_assessment_marks
      WHERE student_id = ? 
        AND assessment_component_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await db.query(query, [studentId, assessmentComponentId]);
    return rows[0] || null;
  }

  /**
   * Get assessment component total marks
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<number|null>}
   */
  async getAssessmentTotalMarks(assessmentComponentId) {
    const query = `
      SELECT total_marks
      FROM assessment_components
      WHERE id = ? AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows[0]?.total_marks || null;
  }

  /**
   * Get statistics for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Object>}
   */
  async getAssessmentStatistics(assessmentComponentId) {
    const query = `
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN is_absent = TRUE THEN 1 END) as absent_count,
        COUNT(CASE WHEN is_absent = FALSE THEN 1 END) as present_count,
        AVG(CASE WHEN is_absent = FALSE THEN percentage END) as average_percentage,
        MAX(CASE WHEN is_absent = FALSE THEN marks_obtained END) as highest_marks,
        MIN(CASE WHEN is_absent = FALSE THEN marks_obtained END) as lowest_marks,
        STD(CASE WHEN is_absent = FALSE THEN percentage END) as std_deviation
      FROM student_assessment_marks
      WHERE assessment_component_id = ?
        AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows[0] || null;
  }

  /**
   * Get marks distribution for an assessment component
   * @param {number} assessmentComponentId - Assessment component ID
   * @returns {Promise<Array>}
   */
  async getMarksDistribution(assessmentComponentId) {
    const query = `
      SELECT 
        CASE 
          WHEN percentage >= 90 THEN 'A+'
          WHEN percentage >= 85 THEN 'A'
          WHEN percentage >= 80 THEN 'A-'
          WHEN percentage >= 75 THEN 'B+'
          WHEN percentage >= 70 THEN 'B'
          WHEN percentage >= 65 THEN 'B-'
          WHEN percentage >= 60 THEN 'C+'
          WHEN percentage >= 55 THEN 'C'
          WHEN percentage >= 50 THEN 'C-'
          WHEN percentage >= 45 THEN 'D'
          ELSE 'F'
        END as grade,
        COUNT(*) as count
      FROM student_assessment_marks
      WHERE assessment_component_id = ?
        AND deleted_at IS NULL
        AND is_absent = FALSE
      GROUP BY grade
      ORDER BY 
        CASE grade
          WHEN 'A+' THEN 1
          WHEN 'A' THEN 2
          WHEN 'A-' THEN 3
          WHEN 'B+' THEN 4
          WHEN 'B' THEN 5
          WHEN 'B-' THEN 6
          WHEN 'C+' THEN 7
          WHEN 'C' THEN 8
          WHEN 'C-' THEN 9
          WHEN 'D' THEN 10
          WHEN 'F' THEN 11
        END
    `;
    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows;
  }
}

module.exports = new StudentMark();
