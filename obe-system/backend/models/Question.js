const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * Question Model
 * Represents individual questions within assessment components
 * Enables question-level CLO mapping for detailed attainment calculation
 */
class Question extends BaseModel {
  constructor() {
    super('questions');
    this.fillable = [
      'assessment_component_id',
      'question_number',
      'question_text',
      'marks',
      'clo_id',
      'bloom_taxonomy_level_id',
      'difficulty_level',
      'time_allocation_minutes',
      'question_type',
      'correct_answer',
      'options',
      'rubric_id',
      'is_active'
    ];
  }

  /**
   * Get the assessment component this question belongs to
   * @param {number} questionId - Question ID
   * @returns {Promise<Object|null>}
   */
  async getAssessmentComponent(questionId) {
    const query = `
      SELECT ac.*, 
             at.name as assessment_type_name,
             at.code as assessment_type_code
      FROM assessment_components ac
      LEFT JOIN assessment_types at ON ac.assessment_type_id = at.id
      WHERE ac.id = (
        SELECT assessment_component_id 
        FROM questions 
        WHERE id = ? AND deleted_at IS NULL
      )
      AND ac.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [questionId]);
    return rows[0] || null;
  }

  /**
   * Get the CLO mapped to this question
   * @param {number} questionId - Question ID
   * @returns {Promise<Object|null>}
   */
  async getCLO(questionId) {
    const query = `
      SELECT clo.*, 
             c.course_code, c.course_name
      FROM course_learning_outcomes clo
      LEFT JOIN courses c ON clo.course_id = c.id
      WHERE clo.id = (
        SELECT clo_id 
        FROM questions 
        WHERE id = ? AND deleted_at IS NULL
      )
      AND clo.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [questionId]);
    return rows[0] || null;
  }

  /**
   * Get the Bloom's Taxonomy level for this question
   * @param {number} questionId - Question ID
   * @returns {Promise<Object|null>}
   */
  async getBloomLevel(questionId) {
    const query = `
      SELECT btl.*
      FROM bloom_taxonomy_levels btl
      WHERE btl.id = (
        SELECT bloom_taxonomy_level_id 
        FROM questions 
        WHERE id = ? AND deleted_at IS NULL
      )
      AND btl.deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [questionId]);
    return rows[0] || null;
  }

  /**
   * Get all questions for an assessment component
   * @param {number} assessmentComponentId - Assessment Component ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getByAssessmentComponent(assessmentComponentId, options = {}) {
    const {
      includeCLO = false,
      includeBloomLevel = false,
      orderBy = 'question_number ASC'
    } = options;

    let query = `
      SELECT q.*
      ${includeCLO ? `, 
        clo.clo_code, clo.description as clo_description` : ''}
      ${includeBloomLevel ? `,
        btl.level_name as bloom_level_name, 
        btl.level_number as bloom_level_number` : ''}
      FROM questions q
      ${includeCLO ? 'LEFT JOIN course_learning_outcomes clo ON q.clo_id = clo.id' : ''}
      ${includeBloomLevel ? 'LEFT JOIN bloom_taxonomy_levels btl ON q.bloom_taxonomy_level_id = btl.id' : ''}
      WHERE q.assessment_component_id = ?
      AND q.deleted_at IS NULL
      ORDER BY ${orderBy}
    `;

    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows;
  }

  /**
   * Get questions by CLO
   * @param {number} cloId - CLO ID
   * @param {number} assessmentComponentId - Optional: Filter by assessment component
   * @returns {Promise<Array>}
   */
  async getByCLO(cloId, assessmentComponentId = null) {
    let query = `
      SELECT q.*, 
             ac.name as assessment_name,
             ac.total_marks as assessment_total_marks
      FROM questions q
      LEFT JOIN assessment_components ac ON q.assessment_component_id = ac.id
      WHERE q.clo_id = ?
      AND q.deleted_at IS NULL
    `;

    const params = [cloId];

    if (assessmentComponentId) {
      query += ' AND q.assessment_component_id = ?';
      params.push(assessmentComponentId);
    }

    query += ' ORDER BY q.question_number ASC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  /**
   * Calculate total marks for an assessment component
   * @param {number} assessmentComponentId - Assessment Component ID
   * @returns {Promise<number>}
   */
  async calculateTotalMarks(assessmentComponentId) {
    const query = `
      SELECT COALESCE(SUM(marks), 0) as total_marks
      FROM questions
      WHERE assessment_component_id = ?
      AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [assessmentComponentId]);
    return rows[0]?.total_marks || 0;
  }

  /**
   * Get CLO-wise marks distribution for an assessment
   * @param {number} assessmentComponentId - Assessment Component ID
   * @returns {Promise<Array>}
   */
  async getCLOMarksDistribution(assessmentComponentId) {
    const query = `
      SELECT 
        clo.id as clo_id,
        clo.clo_code,
        clo.description as clo_description,
        COUNT(q.id) as question_count,
        COALESCE(SUM(q.marks), 0) as total_marks,
        ROUND((COALESCE(SUM(q.marks), 0) / ac.total_marks * 100), 2) as marks_percentage
      FROM course_learning_outcomes clo
      LEFT JOIN questions q ON clo.id = q.clo_id 
        AND q.assessment_component_id = ?
        AND q.deleted_at IS NULL
      CROSS JOIN assessment_components ac
      WHERE ac.id = ?
      AND clo.deleted_at IS NULL
      GROUP BY clo.id, clo.clo_code, clo.description, ac.total_marks
      HAVING question_count > 0
      ORDER BY clo.clo_code
    `;
    const [rows] = await db.query(query, [assessmentComponentId, assessmentComponentId]);
    return rows;
  }

  /**
   * Get student marks for questions
   * @param {number} assessmentComponentId - Assessment Component ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>}
   */
  async getStudentMarks(assessmentComponentId, studentId) {
    const query = `
      SELECT 
        q.id as question_id,
        q.question_number,
        q.question_text,
        q.marks as max_marks,
        sqm.marks_obtained,
        sqm.feedback,
        clo.clo_code,
        clo.description as clo_description
      FROM questions q
      LEFT JOIN student_question_marks sqm ON q.id = sqm.question_id 
        AND sqm.student_id = ?
      LEFT JOIN course_learning_outcomes clo ON q.clo_id = clo.id
      WHERE q.assessment_component_id = ?
      AND q.deleted_at IS NULL
      ORDER BY q.question_number
    `;
    const [rows] = await db.query(query, [studentId, assessmentComponentId]);
    return rows;
  }

  /**
   * Validate question data
   * @param {Object} data - Question data
   * @returns {Promise<boolean>}
   */
  async validate(data) {
    // Validate assessment component exists
    if (data.assessment_component_id) {
      const [components] = await db.query(
        'SELECT id FROM assessment_components WHERE id = ? AND deleted_at IS NULL',
        [data.assessment_component_id]
      );
      if (components.length === 0) {
        throw new Error('Assessment component not found');
      }
    }

    // Validate CLO exists and belongs to the same course
    if (data.clo_id) {
      const [clos] = await db.query(
        'SELECT id FROM course_learning_outcomes WHERE id = ? AND deleted_at IS NULL',
        [data.clo_id]
      );
      if (clos.length === 0) {
        throw new Error('CLO not found');
      }
    }

    // Validate marks is positive
    if (data.marks && data.marks <= 0) {
      throw new Error('Marks must be greater than 0');
    }

    return true;
  }

  /**
   * Bulk create questions
   * @param {Array} questionsData - Array of question objects
   * @returns {Promise<Array>}
   */
  async bulkCreate(questionsData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const createdQuestions = [];
      for (const questionData of questionsData) {
        await this.validate(questionData);
        
        const [result] = await connection.query(
          `INSERT INTO questions SET ?, created_at = NOW(), updated_at = NOW()`,
          [questionData]
        );
        
        const [question] = await connection.query(
          'SELECT * FROM questions WHERE id = ?',
          [result.insertId]
        );
        
        createdQuestions.push(question[0]);
      }

      await connection.commit();
      return createdQuestions;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new Question();
