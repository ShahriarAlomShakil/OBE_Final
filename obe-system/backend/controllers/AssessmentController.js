const BaseController = require('./BaseController');
const AssessmentService = require('../services/AssessmentService');
const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Assessment Controller
 * Handles HTTP requests for Assessment Components
 */
class AssessmentController extends BaseController {
  constructor() {
    super(AssessmentService);
  }

  /**
   * Validation rules for creating an assessment component
   */
  validateCreate() {
    return [
      body('course_offering_id')
        .isInt({ min: 1 })
        .withMessage('Course offering ID must be a positive integer'),
      body('assessment_type_id')
        .isInt({ min: 1 })
        .withMessage('Assessment type ID must be a positive integer'),
      body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Assessment name must be between 3 and 255 characters'),
      body('total_marks')
        .isFloat({ min: 0.01 })
        .withMessage('Total marks must be a positive number'),
      body('weight_percentage')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Weight percentage must be between 0 and 100'),
      body('scheduled_date')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Scheduled date must be a valid date (YYYY-MM-DD)'),
      body('duration_minutes')
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage('Duration must be a positive integer'),
      body('instructions')
        .optional({ nullable: true })
        .isLength({ max: 5000 })
        .withMessage('Instructions must not exceed 5000 characters'),
      body('is_published')
        .optional()
        .isBoolean()
        .withMessage('is_published must be a boolean')
    ];
  }

  /**
   * Validation rules for updating an assessment component
   */
  validateUpdate() {
    return [
      body('assessment_type_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Assessment type ID must be a positive integer'),
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Assessment name must be between 3 and 255 characters'),
      body('total_marks')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Total marks must be a positive number'),
      body('weight_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Weight percentage must be between 0 and 100'),
      body('scheduled_date')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Scheduled date must be a valid date (YYYY-MM-DD)'),
      body('duration_minutes')
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage('Duration must be a positive integer'),
      body('instructions')
        .optional({ nullable: true })
        .isLength({ max: 5000 })
        .withMessage('Instructions must not exceed 5000 characters'),
      body('is_published')
        .optional()
        .isBoolean()
        .withMessage('is_published must be a boolean')
    ];
  }

  /**
   * Validation rules for CLO mapping
   */
  validateCLOMapping() {
    return [
      body('clo_id')
        .isInt({ min: 1 })
        .withMessage('CLO ID must be a positive integer'),
      body('marks_allocated')
        .isFloat({ min: 0.01 })
        .withMessage('Marks allocated must be a positive number'),
      body('weightage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Weightage must be between 0 and 100')
    ];
  }

  /**
   * Validation rules for bulk marks entry
   */
  validateBulkMarks() {
    return [
      body('marks')
        .isArray({ min: 1 })
        .withMessage('Marks must be a non-empty array'),
      body('marks.*.student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
      body('marks.*.obtained_marks')
        .isFloat({ min: 0 })
        .withMessage('Obtained marks must be a non-negative number'),
      body('marks.*.remarks')
        .optional({ nullable: true })
        .isLength({ max: 500 })
        .withMessage('Remarks must not exceed 500 characters'),
      body('marks.*.submitted_at')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Submitted at must be a valid date'),
      body('marks.*.evaluated_at')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('Evaluated at must be a valid date')
    ];
  }

  /**
   * GET /api/v1/assessments/:id/relations
   * Get assessment with all relationships
   */
  getWithRelations = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const assessment = await this.service.getWithRelations(id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment component not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: assessment,
      message: 'Assessment with relationships retrieved successfully'
    });
  });

  /**
   * GET /api/v1/assessments/course-offering/:courseOfferingId
   * Get all assessments for a course offering
   */
  getByCourseOffering = asyncHandler(async (req, res) => {
    const { courseOfferingId } = req.params;
    const assessments = await this.service.getByCourseOffering(courseOfferingId);

    return res.status(200).json({
      success: true,
      data: assessments,
      message: 'Assessments retrieved successfully',
      meta: {
        count: assessments.length
      }
    });
  });

  /**
   * GET /api/v1/assessments/:id/clo-mappings
   * Get CLO mappings for an assessment
   */
  getCLOMappings = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mappings = await this.service.getCLOMappings(id);

    return res.status(200).json({
      success: true,
      data: mappings,
      message: 'CLO mappings retrieved successfully',
      meta: {
        count: mappings.length
      }
    });
  });

  /**
   * GET /api/v1/assessments/:id/questions
   * Get questions for an assessment
   */
  getQuestions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const questions = await this.service.getQuestions(id);

    return res.status(200).json({
      success: true,
      data: questions,
      message: 'Questions retrieved successfully',
      meta: {
        count: questions.length
      }
    });
  });

  /**
   * GET /api/v1/assessments/:id/marks
   * Get all student marks for an assessment
   */
  getStudentMarks = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const marks = await this.service.getStudentMarks(id);

    return res.status(200).json({
      success: true,
      data: marks,
      message: 'Student marks retrieved successfully',
      meta: {
        count: marks.length
      }
    });
  });

  /**
   * GET /api/v1/assessments/:id/marks/:studentId
   * Get detailed marks for a specific student
   */
  getStudentDetailedMarks = asyncHandler(async (req, res) => {
    const { id, studentId } = req.params;
    const marks = await this.service.getStudentDetailedMarks(id, studentId);

    return res.status(200).json({
      success: true,
      data: marks,
      message: 'Student detailed marks retrieved successfully'
    });
  });

  /**
   * POST /api/v1/assessments/:id/map-clo
   * Map a CLO to an assessment
   */
  mapCLO = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.mapCLO(id, req.body);

    return res.status(201).json({
      success: true,
      data: result,
      message: 'CLO mapped to assessment successfully'
    });
  });

  /**
   * DELETE /api/v1/assessments/:id/unmap-clo/:cloId
   * Remove CLO mapping from an assessment
   */
  unmapCLO = asyncHandler(async (req, res) => {
    const { id, cloId } = req.params;
    const result = await this.service.unmapCLO(id, cloId);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'CLO mapping removed successfully'
    });
  });

  /**
   * POST /api/v1/assessments/:id/marks
   * Bulk entry of student marks
   */
  bulkEnterMarks = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.bulkEnterMarks(id, req.body);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Student marks entered successfully'
    });
  });

  /**
   * GET /api/v1/assessments/:id/statistics
   * Get assessment statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stats = await this.service.getStatistics(id);

    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Assessment statistics retrieved successfully'
    });
  });

  /**
   * GET /api/v1/assessments/:id/clo-performance
   * Get CLO-wise performance for an assessment
   */
  getCLOPerformance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const performance = await this.service.getCLOPerformance(id);

    return res.status(200).json({
      success: true,
      data: performance,
      message: 'CLO performance retrieved successfully',
      meta: {
        count: performance.length
      }
    });
  });

  /**
   * POST /api/v1/assessments/:id/publish
   * Publish assessment results
   */
  publishResults = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.publishResults(id);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Assessment results published successfully'
    });
  });

  /**
   * POST /api/v1/assessments/:id/unpublish
   * Unpublish assessment results
   */
  unpublishResults = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.service.unpublishResults(id);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Assessment results unpublished successfully'
    });
  });

  /**
   * Override base index method to handle filtering by course_offering_id
   */
  index = asyncHandler(async (req, res) => {
    const { course_offering_id } = req.query;

    // If filtering by course offering, use specialized method
    if (course_offering_id) {
      return this.getByCourseOffering(req, res);
    }

    // Otherwise, use default pagination
    const { page, limit, offset, sort, order } = this.getPaginationParams(req.query);
    
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.sort;
    delete filters.order;

    const result = await this.service.findAll({
      page,
      limit,
      offset,
      orderBy: `${sort} ${order}`,
      where: filters
    });

    const meta = this.buildPaginationMeta(result.total, page, limit);

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Assessments retrieved successfully',
      meta
    });
  });
}

module.exports = new AssessmentController();
