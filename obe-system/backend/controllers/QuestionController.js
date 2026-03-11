const BaseController = require('./BaseController');
const QuestionService = require('../services/QuestionService');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError, NotFoundError } = require('../utils/AppError');

/**
 * QuestionController
 * Handles HTTP requests for question management
 * Provides endpoints for CRUD operations and question-level CLO mapping
 */
class QuestionController extends BaseController {
  constructor() {
    super(QuestionService);
  }

  /**
   * Get all questions
   * GET /api/v1/questions
   * Query params: page, limit, assessment_component_id, clo_id, question_type, difficulty_level, is_active
   */
  index = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      assessment_component_id: req.query.assessment_component_id,
      clo_id: req.query.clo_id,
      question_type: req.query.question_type,
      difficulty_level: req.query.difficulty_level,
      is_active: req.query.is_active
    };

    const result = await this.service.findAll(options);

    return this.successResponse(
      res,
      result.data,
      'Questions retrieved successfully',
      {
        pagination: result.pagination,
        filters: {
          assessment_component_id: options.assessment_component_id,
          clo_id: options.clo_id,
          question_type: options.question_type,
          difficulty_level: options.difficulty_level
        }
      }
    );
  });

  /**
   * Get question by ID
   * GET /api/v1/questions/:id
   */
  show = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const includeRelations = req.query.include === 'relations';

    const options = {
      includeAssessmentComponent: includeRelations || req.query.includeAssessmentComponent === 'true',
      includeCLO: includeRelations || req.query.includeCLO === 'true',
      includeBloomLevel: includeRelations || req.query.includeBloomLevel === 'true'
    };

    const question = await this.service.findById(id, options);

    return this.successResponse(res, question, 'Question retrieved successfully');
  });

  /**
   * Create a new question
   * POST /api/v1/questions
   */
  store = asyncHandler(async (req, res) => {
    const questionData = req.body;

    const question = await this.service.create(questionData);

    return this.successResponse(
      res,
      question,
      'Question created successfully',
      {},
      201
    );
  });

  /**
   * Update a question
   * PUT /api/v1/questions/:id
   */
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const question = await this.service.update(id, updateData);

    return this.successResponse(res, question, 'Question updated successfully');
  });

  /**
   * Delete a question
   * DELETE /api/v1/questions/:id
   */
  destroy = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await this.service.delete(id);

    return this.successResponse(res, null, 'Question deleted successfully');
  });

  /**
   * Get questions by assessment component
   * GET /api/v1/questions/assessment/:assessmentComponentId
   */
  getByAssessmentComponent = asyncHandler(async (req, res) => {
    const { assessmentComponentId } = req.params;
    const options = {
      includeCLO: req.query.includeCLO === 'true',
      includeBloomLevel: req.query.includeBloomLevel === 'true',
      orderBy: req.query.orderBy || 'question_number ASC'
    };

    const questions = await this.service.getByAssessmentComponent(
      assessmentComponentId,
      options
    );

    return this.successResponse(
      res,
      questions,
      'Questions retrieved successfully',
      { count: questions.length }
    );
  });

  /**
   * Get questions by CLO
   * GET /api/v1/questions/clo/:cloId
   */
  getByCLO = asyncHandler(async (req, res) => {
    const { cloId } = req.params;
    const { assessment_component_id } = req.query;

    const questions = await this.service.getByCLO(cloId, assessment_component_id);

    return this.successResponse(
      res,
      questions,
      'Questions retrieved successfully',
      { count: questions.length }
    );
  });

  /**
   * Get CLO-wise marks distribution for an assessment
   * GET /api/v1/questions/assessment/:assessmentComponentId/clo-distribution
   */
  getCLOMarksDistribution = asyncHandler(async (req, res) => {
    const { assessmentComponentId } = req.params;

    const distribution = await this.service.getCLOMarksDistribution(assessmentComponentId);

    return this.successResponse(
      res,
      distribution,
      'CLO marks distribution retrieved successfully'
    );
  });

  /**
   * Calculate total marks for an assessment component
   * GET /api/v1/questions/assessment/:assessmentComponentId/total-marks
   */
  calculateTotalMarks = asyncHandler(async (req, res) => {
    const { assessmentComponentId } = req.params;

    const totalMarks = await this.service.calculateTotalMarks(assessmentComponentId);

    return this.successResponse(
      res,
      { total_marks: totalMarks },
      'Total marks calculated successfully'
    );
  });

  /**
   * Get student marks for questions
   * GET /api/v1/questions/assessment/:assessmentComponentId/student/:studentId/marks
   */
  getStudentMarks = asyncHandler(async (req, res) => {
    const { assessmentComponentId, studentId } = req.params;

    const marks = await this.service.getStudentMarks(assessmentComponentId, studentId);

    return this.successResponse(
      res,
      marks,
      'Student marks retrieved successfully',
      { count: marks.length }
    );
  });

  /**
   * Bulk create questions
   * POST /api/v1/questions/bulk
   * Body: { questions: [ {question1}, {question2}, ... ] }
   */
  bulkCreate = asyncHandler(async (req, res) => {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      throw new ValidationError('Questions array is required');
    }

    if (questions.length === 0) {
      throw new ValidationError('Questions array cannot be empty');
    }

    const result = await this.service.bulkCreate(questions);

    return this.successResponse(
      res,
      result,
      `${result.count} questions created successfully`,
      {},
      201
    );
  });

  /**
   * Reorder questions in an assessment
   * PUT /api/v1/questions/assessment/:assessmentComponentId/reorder
   * Body: { questionOrders: [{id: 1, question_number: 1}, {id: 2, question_number: 2}] }
   */
  reorderQuestions = asyncHandler(async (req, res) => {
    const { assessmentComponentId } = req.params;
    const { questionOrders } = req.body;

    if (!questionOrders || !Array.isArray(questionOrders)) {
      throw new ValidationError('Question orders array is required');
    }

    // Update each question's number
    const updatePromises = questionOrders.map(order =>
      this.service.update(order.id, { question_number: order.question_number })
    );

    await Promise.all(updatePromises);

    const updatedQuestions = await this.service.getByAssessmentComponent(assessmentComponentId);

    return this.successResponse(
      res,
      updatedQuestions,
      'Questions reordered successfully'
    );
  });

  /**
   * Copy questions from one assessment to another
   * POST /api/v1/questions/copy
   * Body: { source_assessment_id, target_assessment_id, question_ids }
   */
  copyQuestions = asyncHandler(async (req, res) => {
    const { source_assessment_id, target_assessment_id, question_ids } = req.body;

    if (!source_assessment_id || !target_assessment_id) {
      throw new ValidationError('Source and target assessment IDs are required');
    }

    // Get source questions
    const sourceQuestions = await this.service.getByAssessmentComponent(source_assessment_id);

    // Filter by question_ids if provided
    let questionsToopy = sourceQuestions;
    if (question_ids && Array.isArray(question_ids)) {
      questionsToCopy = sourceQuestions.filter(q => question_ids.includes(q.id));
    }

    // Get the highest question number in target assessment
    const targetQuestions = await this.service.getByAssessmentComponent(target_assessment_id);
    let maxQuestionNumber = targetQuestions.length > 0
      ? Math.max(...targetQuestions.map(q => q.question_number))
      : 0;

    // Prepare new questions
    const newQuestions = questionsToCopy.map(q => ({
      assessment_component_id: target_assessment_id,
      question_number: ++maxQuestionNumber,
      question_text: q.question_text,
      marks: q.marks,
      clo_id: q.clo_id,
      bloom_taxonomy_level_id: q.bloom_taxonomy_level_id,
      difficulty_level: q.difficulty_level,
      time_allocation_minutes: q.time_allocation_minutes,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      options: q.options,
      rubric_id: q.rubric_id,
      is_active: q.is_active
    }));

    const result = await this.service.bulkCreate(newQuestions);

    return this.successResponse(
      res,
      result,
      `${result.count} questions copied successfully`,
      {},
      201
    );
  });
}

module.exports = new QuestionController();
