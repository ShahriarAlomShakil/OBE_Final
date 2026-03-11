const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * StudentQuestionMark Model
 * Represents student marks for individual questions
 * Enables granular CLO attainment calculation at question level
 */
class StudentQuestionMark extends BaseModel {
  constructor() {
    super('student_question_marks');
    this.fillable = [
      'student_id',
      'question_id',
      'marks_obtained',
      'marks_total'
    ];
  }

  /**
   * Get student details for a question mark entry
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
        FROM student_question_marks 
        WHERE id = ? AND deleted_at IS NULL
      )
    `;
    const [rows] = await db.query(query, [markId]);
    return rows[0] || null;
  }

  /**
   * Get question details for a mark entry
   * @param {number} markId - Mark ID
   * @returns {Promise<Object|null>}
   */
  async getQuestion(markId) {
    const query = `
      SELECT q.*, 
             clo.clo_code, 
             clo.clo_description,
             btl.level_name as bloom_level,
             ac.name as assessment_name
      FROM questions q
      LEFT JOIN course_learning_outcomes clo ON q.clo_id = clo.id
      LEFT JOIN bloom_taxonomy_levels btl ON q.bloom_taxonomy_level_id = btl.id
      LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
      WHERE q.id = (
        SELECT question_id 
        FROM student_question_marks 
        WHERE id = ? AND deleted_at IS NULL
      )
      AND q.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [markId]);
    return rows[0] || null;
  }

  /**
   * Get all question marks for a student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getByStudent(studentId, options = {}) {
    const {
      assessmentComponentId = null,
      questionId = null
    } = options;

    let query = `
      SELECT sqm.*, 
             q.question_number,
             q.question_text,
             q.marks as question_total_marks,
             clo.clo_code,
             clo.clo_description,
             ac.name as assessment_name,
             ac.total_marks as assessment_total_marks
      FROM student_question_marks sqm
      INNER JOIN questions q ON sqm.question_id = q.id
      LEFT JOIN course_learning_outcomes clo ON q.clo_id = clo.id
      LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
      WHERE sqm.student_id = ? 
        AND sqm.deleted_at IS NULL
    `;
    
    const params = [studentId];

    if (assessmentComponentId) {
      query += ' AND q.assessment_component_id = ?';
      params.push(assessmentComponentId);
    }

    if (questionId) {
      query += ' AND sqm.question_id = ?';
      params.push(questionId);
    }

    query += ' ORDER BY q.question_number ASC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Get all question marks for a specific question
   * @param {number} questionId - Question ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getByQuestion(questionId, options = {}) {
    const query = `
      SELECT sqm.*, 
             s.roll_number,
             u.name as student_name,
             u.email as student_email
      FROM student_question_marks sqm
      INNER JOIN students s ON sqm.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE sqm.question_id = ? 
        AND sqm.deleted_at IS NULL
      ORDER BY s.roll_number ASC
    `;

    const [rows] = await db.query(query, [questionId]);
    return rows;
  }

  /**
   * Get question marks statistics for an assessment component
   * @param {number} assessmentComponentId - Assessment Component ID
   * @returns {Promise<Object>}
   */
  async getAssessmentStatistics(assessmentComponentId) {
    const query = `
      SELECT 
        q.id as question_id,
        q.question_number,
        q.marks as total_marks,
        COUNT(sqm.id) as students_attempted,
        AVG(sqm.marks_obtained) as average_marks,
        MAX(sqm.marks_obtained) as highest_marks,
        MIN(sqm.marks_obtained) as lowest_marks,
        STDDEV(sqm.marks_obtained) as std_deviation,
        SUM(CASE WHEN sqm.marks_obtained >= (q.marks * 0.5) THEN 1 ELSE 0 END) as passed_count
      FROM questions q
      LEFT JOIN student_question_marks sqm ON q.id = sqm.question_id AND sqm.deleted_at IS NULL
      WHERE q.assessment_component_id = ? 
        AND q.deleted_at IS NULL
      GROUP BY q.id, q.question_number, q.marks
      ORDER BY q.question_number ASC
    `;

    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows;
  }

  /**
   * Get CLO attainment for a student based on question-level marks
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>}
   */
  async getCLOAttainmentByStudent(studentId, courseOfferingId) {
    const query = `
      SELECT 
        clo.id as clo_id,
        clo.clo_code,
        clo.clo_description,
        SUM(sqm.marks_obtained) as marks_obtained,
        SUM(sqm.marks_total) as marks_total,
        (SUM(sqm.marks_obtained) / SUM(sqm.marks_total) * 100) as attainment_percentage,
        COUNT(DISTINCT q.id) as questions_count
      FROM student_question_marks sqm
      INNER JOIN questions q ON sqm.question_id = q.id
      INNER JOIN course_learning_outcomes clo ON q.clo_id = clo.id
      INNER JOIN assessment_components ac ON q.assessment_component_id = ac.id
      WHERE sqm.student_id = ? 
        AND ac.course_offering_id = ?
        AND sqm.deleted_at IS NULL
        AND q.deleted_at IS NULL
      GROUP BY clo.id, clo.clo_code, clo.clo_description
      ORDER BY clo.clo_code ASC
    `;

    const [rows] = await db.query(query, [studentId, courseOfferingId]);
    return rows;
  }

  /**
   * Get CLO attainment for entire class based on question-level marks
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>}
   */
  async getCLOAttainmentByCourse(courseOfferingId) {
    const query = `
      SELECT 
        clo.id as clo_id,
        clo.clo_code,
        clo.clo_description,
        COUNT(DISTINCT sqm.student_id) as students_count,
        AVG((sqm.marks_obtained / sqm.marks_total) * 100) as average_attainment_percentage,
        SUM(sqm.marks_obtained) as total_marks_obtained,
        SUM(sqm.marks_total) as total_marks_possible,
        COUNT(DISTINCT q.id) as questions_count
      FROM student_question_marks sqm
      INNER JOIN questions q ON sqm.question_id = q.id
      INNER JOIN course_learning_outcomes clo ON q.clo_id = clo.id
      INNER JOIN assessment_components ac ON q.assessment_component_id = ac.id
      WHERE ac.course_offering_id = ?
        AND sqm.deleted_at IS NULL
        AND q.deleted_at IS NULL
      GROUP BY clo.id, clo.clo_code, clo.clo_description
      ORDER BY clo.clo_code ASC
    `;

    const [rows] = await db.query(query, [courseOfferingId]);
    return rows;
  }

  /**
   * Find question mark by student and question
   * @param {number} studentId - Student ID
   * @param {number} questionId - Question ID
   * @returns {Promise<Object|null>}
   */
  async findByStudentAndQuestion(studentId, questionId) {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE student_id = ? 
        AND question_id = ? 
        AND deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await db.query(query, [studentId, questionId]);
    return rows[0] || null;
  }

  /**
   * Bulk insert question marks
   * @param {Array} marksData - Array of marks data
   * @returns {Promise<number>} - Number of records inserted
   */
  async bulkInsert(marksData) {
    if (!marksData || marksData.length === 0) {
      return 0;
    }

    const values = marksData.map(mark => [
      mark.student_id,
      mark.question_id,
      mark.marks_obtained,
      mark.marks_total
    ]);

    const query = `
      INSERT INTO ${this.tableName} 
      (student_id, question_id, marks_obtained, marks_total)
      VALUES ?
    `;

    const [result] = await db.query(query, [values]);
    return result.affectedRows;
  }

  /**
   * Delete all question marks for an assessment (used when regenerating)
   * @param {number} assessmentComponentId - Assessment Component ID
   * @returns {Promise<number>} - Number of records deleted
   */
  async deleteByAssessmentComponent(assessmentComponentId) {
    const query = `
      UPDATE ${this.tableName} sqm
      INNER JOIN questions q ON sqm.question_id = q.id
      SET sqm.deleted_at = NOW()
      WHERE q.assessment_component_id = ?
        AND sqm.deleted_at IS NULL
    `;

    const [result] = await db.query(query, [assessmentComponentId]);
    return result.affectedRows;
  }
}

module.exports = new StudentQuestionMark();
