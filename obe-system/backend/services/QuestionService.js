const BaseService = require('./BaseService');
const Question = require('../models/Question');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

/**
 * QuestionService
 * Business logic for managing questions in assessment components
 * Handles question-level CLO mapping for detailed attainment calculation
 */
class QuestionService extends BaseService {
  constructor() {
    const questionModel = Question;
    super(questionModel, 'Question');

    // Define validation schemas
    this.schemas = {
      create: Joi.object({
        assessment_component_id: Joi.number().integer().required()
          .messages({
            'number.base': 'Assessment component ID must be a number',
            'any.required': 'Assessment component ID is required'
          }),
        question_number: Joi.number().integer().min(1).required()
          .messages({
            'number.base': 'Question number must be a number',
            'number.min': 'Question number must be at least 1',
            'any.required': 'Question number is required'
          }),
        question_text: Joi.string().required()
          .messages({
            'string.empty': 'Question text cannot be empty',
            'any.required': 'Question text is required'
          }),
        marks: Joi.number().positive().required()
          .messages({
            'number.base': 'Marks must be a number',
            'number.positive': 'Marks must be positive',
            'any.required': 'Marks is required'
          }),
        clo_id: Joi.number().integer().allow(null)
          .messages({
            'number.base': 'CLO ID must be a number'
          }),
        bloom_taxonomy_level_id: Joi.number().integer().allow(null),
        difficulty_level: Joi.string().valid('easy', 'medium', 'hard').allow(null),
        time_allocation_minutes: Joi.number().integer().min(0).allow(null),
        question_type: Joi.string().valid('mcq', 'true_false', 'short_answer', 'essay', 'practical', 'case_study').allow(null),
        correct_answer: Joi.string().allow(null, ''),
        options: Joi.string().allow(null, ''), // JSON string for MCQ options
        rubric_id: Joi.number().integer().allow(null),
        is_active: Joi.boolean().default(true)
      }),

      update: Joi.object({
        assessment_component_id: Joi.number().integer(),
        question_number: Joi.number().integer().min(1),
        question_text: Joi.string(),
        marks: Joi.number().positive(),
        clo_id: Joi.number().integer().allow(null),
        bloom_taxonomy_level_id: Joi.number().integer().allow(null),
        difficulty_level: Joi.string().valid('easy', 'medium', 'hard').allow(null),
        time_allocation_minutes: Joi.number().integer().min(0).allow(null),
        question_type: Joi.string().valid('mcq', 'true_false', 'short_answer', 'essay', 'practical', 'case_study').allow(null),
        correct_answer: Joi.string().allow(null, ''),
        options: Joi.string().allow(null, ''),
        rubric_id: Joi.number().integer().allow(null),
        is_active: Joi.boolean()
      }).min(1),

      bulkCreate: Joi.array().items(
        Joi.object({
          assessment_component_id: Joi.number().integer().required(),
          question_number: Joi.number().integer().min(1).required(),
          question_text: Joi.string().required(),
          marks: Joi.number().positive().required(),
          clo_id: Joi.number().integer().allow(null),
          bloom_taxonomy_level_id: Joi.number().integer().allow(null),
          difficulty_level: Joi.string().valid('easy', 'medium', 'hard').allow(null),
          time_allocation_minutes: Joi.number().integer().min(0).allow(null),
          question_type: Joi.string().valid('mcq', 'true_false', 'short_answer', 'essay', 'practical', 'case_study').allow(null),
          correct_answer: Joi.string().allow(null, ''),
          options: Joi.string().allow(null, ''),
          rubric_id: Joi.number().integer().allow(null),
          is_active: Joi.boolean().default(true)
        })
      ).min(1).required()
    };
  }

  /**
   * Get all questions with pagination and filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async findAll(options = {}) {
    try {
      const {
        assessment_component_id,
        clo_id,
        question_type,
        difficulty_level,
        is_active,
        ...paginationOptions
      } = options;

      // Build where conditions
      const where = {};
      if (assessment_component_id) where.assessment_component_id = assessment_component_id;
      if (clo_id) where.clo_id = clo_id;
      if (question_type) where.question_type = question_type;
      if (difficulty_level) where.difficulty_level = difficulty_level;
      if (is_active !== undefined) where.is_active = is_active;

      const result = await this.model.findAll({
        ...paginationOptions,
        where,
        orderBy: 'question_number ASC'
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get question by ID with relations
   * @param {number} id - Question ID
   * @param {Object} options - Include options
   * @returns {Promise<Object>}
   */
  async findById(id, options = {}) {
    try {
      const question = await this.model.findById(id);
      
      if (!question) {
        throw new NotFoundError(`${this.resourceName} not found`);
      }

      // Include related data if requested
      if (options.includeAssessmentComponent) {
        question.assessment_component = await this.model.getAssessmentComponent(id);
      }

      if (options.includeCLO) {
        question.clo = await this.model.getCLO(id);
      }

      if (options.includeBloomLevel) {
        question.bloom_level = await this.model.getBloomLevel(id);
      }

      return question;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get questions by assessment component
   * @param {number} assessmentComponentId - Assessment Component ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getByAssessmentComponent(assessmentComponentId, options = {}) {
    try {
      const questions = await this.model.getByAssessmentComponent(assessmentComponentId, options);
      return questions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get questions by CLO
   * @param {number} cloId - CLO ID
   * @param {number} assessmentComponentId - Optional: Filter by assessment component
   * @returns {Promise<Array>}
   */
  async getByCLO(cloId, assessmentComponentId = null) {
    try {
      const questions = await this.model.getByCLO(cloId, assessmentComponentId);
      return questions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CLO-wise marks distribution for an assessment
   * @param {number} assessmentComponentId - Assessment Component ID
   * @returns {Promise<Array>}
   */
  async getCLOMarksDistribution(assessmentComponentId) {
    try {
      const distribution = await this.model.getCLOMarksDistribution(assessmentComponentId);
      return distribution;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate total marks for an assessment component
   * @param {number} assessmentComponentId - Assessment Component ID
   * @returns {Promise<number>}
   */
  async calculateTotalMarks(assessmentComponentId) {
    try {
      const totalMarks = await this.model.calculateTotalMarks(assessmentComponentId);
      return totalMarks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get student marks for questions
   * @param {number} assessmentComponentId - Assessment Component ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>}
   */
  async getStudentMarks(assessmentComponentId, studentId) {
    try {
      const marks = await this.model.getStudentMarks(assessmentComponentId, studentId);
      return marks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk create questions
   * @param {Array} questionsData - Array of question objects
   * @returns {Promise<Object>}
   */
  async bulkCreate(questionsData) {
    try {
      // Validate the bulk data
      const { error, value } = this.schemas.bulkCreate.validate(questionsData);
      if (error) {
        throw new ValidationError(error.details[0].message);
      }

      // Check for duplicate question numbers within the same assessment
      const assessmentGroups = {};
      for (const question of value) {
        if (!assessmentGroups[question.assessment_component_id]) {
          assessmentGroups[question.assessment_component_id] = [];
        }
        assessmentGroups[question.assessment_component_id].push(question.question_number);
      }

      for (const [assessmentId, questionNumbers] of Object.entries(assessmentGroups)) {
        const duplicates = questionNumbers.filter((num, index) => questionNumbers.indexOf(num) !== index);
        if (duplicates.length > 0) {
          throw new ValidationError(
            `Duplicate question numbers found for assessment ${assessmentId}: ${duplicates.join(', ')}`
          );
        }
      }

      const createdQuestions = await this.model.bulkCreate(value);

      return {
        success: true,
        count: createdQuestions.length,
        questions: createdQuestions
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lifecycle hook: Before creating a question
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async beforeCreate(data) {
    // Validate question data
    await this.model.validate(data);

    // Check for duplicate question number in the same assessment
    const existing = await this.model.findAll({
      where: {
        assessment_component_id: data.assessment_component_id,
        question_number: data.question_number
      },
      limit: 1
    });

    if (existing.data && existing.data.length > 0) {
      throw new ValidationError(
        `Question number ${data.question_number} already exists for this assessment component`
      );
    }

    return data;
  }

  /**
   * Lifecycle hook: Before updating a question
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async beforeUpdate(id, data) {
    // If updating question number, check for duplicates
    if (data.question_number) {
      const question = await this.model.findById(id);
      if (!question) {
        throw new NotFoundError(`${this.resourceName} not found`);
      }

      const existing = await this.model.findAll({
        where: {
          assessment_component_id: data.assessment_component_id || question.assessment_component_id,
          question_number: data.question_number
        },
        limit: 1
      });

      if (existing.data && existing.data.length > 0 && existing.data[0].id !== id) {
        throw new ValidationError(
          `Question number ${data.question_number} already exists for this assessment component`
        );
      }
    }

    return data;
  }

  /**
   * Lifecycle hook: Before deleting a question
   * @param {number} id
   * @returns {Promise<void>}
   */
  async beforeDelete(id) {
    // Check if question has student marks
    const question = await this.model.findById(id);
    if (!question) {
      throw new NotFoundError(`${this.resourceName} not found`);
    }

    // Could add logic here to prevent deletion if marks are recorded
    // For now, we'll allow deletion (soft delete)
  }
}

module.exports = new QuestionService();
