const BaseModel = require('./BaseModel');
const db = require('../config/database');

/**
 * AssessmentComponent Model
 * Represents an assessment component (quiz, exam, assignment, etc.) for a course offering
 */
class AssessmentComponent extends BaseModel {
  constructor() {
    super('assessment_components');
    this.fillable = [
      'course_offering_id',
      'assessment_type_id',
      'name',
      'total_marks',
      'weight_percentage',
      'scheduled_date',
      'duration_minutes',
      'instructions',
      'is_published'
    ];
  }

  /**
   * Get the course offering this assessment belongs to
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Object|null>}
   */
  async getCourseOffering(assessmentId) {
    const query = `
      SELECT co.*, 
             c.course_code, c.course_name, c.credit_hours,
             d.name as department_name, d.dept_code as department_short_name,
             s.name as semester_name, s.year,
             acs.name as academic_session_name
      FROM course_offerings co
      INNER JOIN courses c ON co.course_id = c.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN semesters s ON co.semester_id = s.id
      LEFT JOIN academic_sessions acs ON s.academic_session_id = acs.id
      WHERE co.id = (
        SELECT course_offering_id 
        FROM assessment_components 
        WHERE id = ? AND deleted_at IS NULL
      )
    `;
    const [rows] = await db.query(query, [assessmentId]);
    return rows[0] || null;
  }

  /**
   * Get the assessment type
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Object|null>}
   */
  async getAssessmentType(assessmentId) {
    const query = `
      SELECT at.*
      FROM assessment_types at
      WHERE at.id = (
        SELECT assessment_type_id 
        FROM assessment_components 
        WHERE id = ? AND deleted_at IS NULL
      )
    `;
    const [rows] = await db.query(query, [assessmentId]);
    return rows[0] || null;
  }

  /**
   * Get all CLO mappings for this assessment
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Array>}
   */
  async getCLOMappings(assessmentId) {
    const query = `
      SELECT 
        clo.id, clo.clo_code, clo.description,
        acm.marks_allocated,
        acm.weightage as clo_weightage,
        btl.level_number, btl.level_name, btl.cognitive_domain,
        c.course_code, c.course_name
      FROM course_learning_outcomes clo
      INNER JOIN assessment_clo_mapping acm ON clo.id = acm.clo_id
      LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
      LEFT JOIN courses c ON clo.course_id = c.id
      WHERE acm.assessment_component_id = ? 
        AND clo.deleted_at IS NULL
      ORDER BY clo.clo_code
    `;
    const [rows] = await db.query(query, [assessmentId]);
    return rows;
  }

  /**
   * Get all questions for this assessment
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Array>}
   */
  async getQuestions(assessmentId) {
    const query = `
      SELECT 
        q.id, q.question_text, q.question_type, q.marks,
        q.difficulty_level, q.solution, q.keywords,
        btl.level_number, btl.level_name,
        GROUP_CONCAT(DISTINCT clo.clo_code ORDER BY clo.clo_code SEPARATOR ', ') as mapped_clos
      FROM questions q
      LEFT JOIN bloom_taxonomy_levels btl ON q.bloom_level_id = btl.id
      LEFT JOIN question_clo_mapping qcm ON q.id = qcm.question_id
      LEFT JOIN course_learning_outcomes clo ON qcm.clo_id = clo.id
      WHERE q.assessment_component_id = ? 
        AND q.deleted_at IS NULL
      GROUP BY q.id
      ORDER BY q.id
    `;
    const [rows] = await db.query(query, [assessmentId]);
    return rows;
  }

  /**
   * Get all student marks for this assessment
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Array>}
   */
  async getStudentMarks(assessmentId) {
    const query = `
      SELECT 
        sam.id, sam.student_id, sam.obtained_marks, 
        sam.percentage, sam.grade, sam.remarks,
        sam.submitted_at, sam.evaluated_at,
        s.student_code, s.first_name, s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        u.email as student_email
      FROM student_assessment_marks sam
      INNER JOIN students s ON sam.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE sam.assessment_component_id = ?
        AND s.deleted_at IS NULL
      ORDER BY s.student_code
    `;
    const [rows] = await db.query(query, [assessmentId]);
    return rows;
  }

  /**
   * Get detailed student marks including per-question breakdown
   * @param {number} assessmentId - Assessment ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object|null>}
   */
  async getStudentDetailedMarks(assessmentId, studentId) {
    // Get overall marks
    const overallQuery = `
      SELECT 
        sam.*, 
        s.student_code, s.first_name, s.last_name,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        u.email as student_email
      FROM student_assessment_marks sam
      INNER JOIN students s ON sam.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE sam.assessment_component_id = ? 
        AND sam.student_id = ?
        AND s.deleted_at IS NULL
    `;
    const [overallRows] = await db.query(overallQuery, [assessmentId, studentId]);
    
    if (overallRows.length === 0) {
      return null;
    }

    const result = overallRows[0];

    // Get per-question marks
    const questionsQuery = `
      SELECT 
        sqm.id, sqm.question_id, sqm.obtained_marks,
        sqm.feedback, sqm.correct_answer,
        q.question_text, q.question_type, q.marks as total_marks,
        q.difficulty_level,
        GROUP_CONCAT(DISTINCT clo.clo_code ORDER BY clo.clo_code SEPARATOR ', ') as mapped_clos
      FROM student_question_marks sqm
      INNER JOIN questions q ON sqm.question_id = q.id
      LEFT JOIN question_clo_mapping qcm ON q.id = qcm.question_id
      LEFT JOIN course_learning_outcomes clo ON qcm.clo_id = clo.id
      WHERE sqm.student_assessment_mark_id = ?
        AND q.deleted_at IS NULL
      GROUP BY sqm.id, sqm.question_id, sqm.obtained_marks, sqm.feedback, 
               sqm.correct_answer, q.question_text, q.question_type, 
               q.marks, q.difficulty_level
      ORDER BY q.id
    `;
    const [questionRows] = await db.query(questionsQuery, [result.id]);
    result.question_marks = questionRows;

    return result;
  }

  /**
   * Get assessment with all relationships
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithRelations(assessmentId) {
    const assessment = await this.findById(assessmentId);
    if (!assessment) {
      return null;
    }

    // Attach relationships
    assessment.courseOffering = await this.getCourseOffering(assessmentId);
    assessment.assessmentType = await this.getAssessmentType(assessmentId);
    assessment.cloMappings = await this.getCLOMappings(assessmentId);
    assessment.questions = await this.getQuestions(assessmentId);

    return assessment;
  }

  /**
   * Get all assessments for a course offering
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<Array>}
   */
  async findByCourseOffering(courseOfferingId) {
    const query = `
      SELECT 
        ac.*,
        at.name as assessment_type_name,
        at.category as assessment_category,
        (SELECT COUNT(*) FROM questions WHERE assessment_component_id = ac.id AND deleted_at IS NULL) as question_count,
        (SELECT COUNT(*) FROM student_assessment_marks WHERE assessment_component_id = ac.id) as submission_count
      FROM assessment_components ac
      INNER JOIN assessment_types at ON ac.assessment_type_id = at.id
      WHERE ac.course_offering_id = ?
        AND ac.deleted_at IS NULL
      ORDER BY ac.scheduled_date ASC, ac.name ASC
    `;
    const [rows] = await db.query(query, [courseOfferingId]);
    return rows;
  }

  /**
   * Validate course offering exists
   * @param {number} courseOfferingId - Course Offering ID
   * @returns {Promise<boolean>}
   */
  async validateCourseOfferingExists(courseOfferingId) {
    const query = `
      SELECT id FROM course_offerings 
      WHERE id = ? AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [courseOfferingId]);
    if (rows.length === 0) {
      throw new Error(`Course offering with ID ${courseOfferingId} not found`);
    }
    return true;
  }

  /**
   * Validate assessment type exists
   * @param {number} assessmentTypeId - Assessment Type ID
   * @returns {Promise<boolean>}
   */
  async validateAssessmentTypeExists(assessmentTypeId) {
    const query = `
      SELECT id FROM assessment_types 
      WHERE id = ? AND is_active = TRUE
    `;
    const [rows] = await db.query(query, [assessmentTypeId]);
    if (rows.length === 0) {
      throw new Error(`Assessment type with ID ${assessmentTypeId} not found or inactive`);
    }
    return true;
  }

  /**
   * Get assessment statistics
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Object>}
   */
  async getStatistics(assessmentId) {
    const query = `
      SELECT 
        COUNT(sam.id) as total_submissions,
        AVG(sam.obtained_marks) as average_marks,
        MAX(sam.obtained_marks) as highest_marks,
        MIN(sam.obtained_marks) as lowest_marks,
        AVG(sam.percentage) as average_percentage,
        COUNT(CASE WHEN sam.grade IN ('A', 'A+', 'A-') THEN 1 END) as a_grade_count,
        COUNT(CASE WHEN sam.grade IN ('B', 'B+', 'B-') THEN 1 END) as b_grade_count,
        COUNT(CASE WHEN sam.grade IN ('C', 'C+', 'C-') THEN 1 END) as c_grade_count,
        COUNT(CASE WHEN sam.grade IN ('D', 'D+') THEN 1 END) as d_grade_count,
        COUNT(CASE WHEN sam.grade = 'F' THEN 1 END) as f_grade_count,
        ac.total_marks
      FROM assessment_components ac
      LEFT JOIN student_assessment_marks sam ON ac.id = sam.assessment_component_id
      WHERE ac.id = ? AND ac.deleted_at IS NULL
      GROUP BY ac.id, ac.total_marks
    `;
    const [rows] = await db.query(query, [assessmentId]);
    return rows[0] || null;
  }

  /**
   * Get CLO-wise performance for an assessment
   * @param {number} assessmentId - Assessment ID
   * @returns {Promise<Array>}
   */
  async getCLOPerformance(assessmentId) {
    const query = `
      SELECT 
        clo.id, clo.clo_code, clo.description,
        acm.marks_allocated,
        COUNT(DISTINCT sqm.id) as total_attempts,
        AVG(sqm.obtained_marks) as average_marks,
        (AVG(sqm.obtained_marks) / q.marks * 100) as achievement_percentage,
        btl.level_name as bloom_level
      FROM course_learning_outcomes clo
      INNER JOIN assessment_clo_mapping acm ON clo.id = acm.clo_id
      LEFT JOIN question_clo_mapping qcm ON clo.id = qcm.clo_id
      LEFT JOIN questions q ON qcm.question_id = q.id AND q.assessment_component_id = ?
      LEFT JOIN student_question_marks sqm ON q.id = sqm.question_id
      LEFT JOIN bloom_taxonomy_levels btl ON clo.bloom_level_id = btl.id
      WHERE acm.assessment_component_id = ?
        AND clo.deleted_at IS NULL
      GROUP BY clo.id, clo.clo_code, clo.description, acm.marks_allocated, 
               q.marks, btl.level_name
      ORDER BY clo.clo_code
    `;
    const [rows] = await db.query(query, [assessmentId, assessmentId]);
    return rows;
  }
}

module.exports = new AssessmentComponent();
