const BaseController = require('./BaseController');
const MarksService = require('../services/MarksService');
const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../utils/AppError');

/**
 * Marks Controller
 * Handles HTTP requests for Student Assessment Marks
 */
class MarksController extends BaseController {
  constructor() {
    super(MarksService);
  }

  /**
   * Validation rules for entering marks
   */
  validateEnterMarks() {
    return [
      body('assessment_component_id')
        .isInt({ min: 1 })
        .withMessage('Assessment component ID must be a positive integer'),
      body('student_id')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
      body('marks_obtained')
        .isFloat({ min: 0 })
        .withMessage('Marks obtained must be a non-negative number'),
      body('is_absent')
        .optional()
        .isBoolean()
        .withMessage('is_absent must be a boolean'),
      body('remarks')
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage('Remarks must not exceed 1000 characters'),
      body('entered_by')
        .isInt({ min: 1 })
        .withMessage('Entered by (user ID) must be a positive integer')
    ];
  }

  /**
   * Validation rules for bulk marks entry
   */
  validateBulkEnterMarks() {
    return [
      body('assessment_component_id')
        .isInt({ min: 1 })
        .withMessage('Assessment component ID must be a positive integer'),
      body('entered_by')
        .isInt({ min: 1 })
        .withMessage('Entered by (user ID) must be a positive integer'),
      body('marks_data')
        .isArray({ min: 1 })
        .withMessage('Marks data must be a non-empty array'),
      body('marks_data.*.student_id')
        .isInt({ min: 1 })
        .withMessage('Each student ID must be a positive integer'),
      body('marks_data.*.marks_obtained')
        .isFloat({ min: 0 })
        .withMessage('Each marks obtained must be a non-negative number'),
      body('marks_data.*.is_absent')
        .optional()
        .isBoolean()
        .withMessage('is_absent must be a boolean'),
      body('marks_data.*.remarks')
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage('Remarks must not exceed 1000 characters')
    ];
  }

  /**
   * Validation rules for updating marks
   */
  validateUpdateMarks() {
    return [
      body('marks_obtained')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Marks obtained must be a non-negative number'),
      body('is_absent')
        .optional()
        .isBoolean()
        .withMessage('is_absent must be a boolean'),
      body('remarks')
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage('Remarks must not exceed 1000 characters')
    ];
  }

  /**
   * Enter marks for a single student
   * POST /api/v1/marks
   */
  enterMarks = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const result = await this.service.enterMarks(req.body);
    res.status(201).json(result);
  });

  /**
   * Bulk enter marks for multiple students
   * POST /api/v1/marks/bulk
   */
  bulkEnterMarks = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const result = await this.service.bulkEnterMarks(req.body);
    res.status(201).json(result);
  });

  /**
   * Get all marks for an assessment
   * GET /api/v1/assessments/:id/marks
   */
  getMarksByAssessment = asyncHandler(async (req, res) => {
    const assessmentId = parseInt(req.params.id);
    const options = {
      includeAbsent: req.query.include_absent !== 'false',
      orderBy: req.query.order_by || 'student_id ASC'
    };

    const result = await this.service.getMarksByAssessment(assessmentId, options);
    res.status(200).json(result);
  });

  /**
   * Get all marks for a student in a course offering
   * GET /api/v1/students/:studentId/marks?course_offering_id=123
   */
  getMarksByStudent = asyncHandler(async (req, res) => {
    const studentId = parseInt(req.params.studentId);
    const courseOfferingId = parseInt(req.query.course_offering_id);

    if (!courseOfferingId) {
      throw new ValidationError('course_offering_id query parameter is required');
    }

    const result = await this.service.getMarksByStudent(studentId, courseOfferingId);
    res.status(200).json(result);
  });

  /**
   * Update marks for a student
   * PUT /api/v1/marks/:id
   */
  updateMarks = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const markId = parseInt(req.params.id);
    const result = await this.service.updateMarks(markId, req.body);
    res.status(200).json(result);
  });

  /**
   * Delete marks entry
   * DELETE /api/v1/marks/:id
   */
  deleteMarks = asyncHandler(async (req, res) => {
    const markId = parseInt(req.params.id);
    const result = await this.service.deleteMarks(markId);
    res.status(200).json(result);
  });

  /**
   * Get mark entry by ID
   * GET /api/v1/marks/:id
   */
  getMarkById = asyncHandler(async (req, res) => {
    const markId = parseInt(req.params.id);
    const mark = await this.service.model.findById(markId);
    
    if (!mark) {
      throw new NotFoundError('Mark entry not found');
    }

    res.status(200).json({
      success: true,
      data: mark
    });
  });
}

module.exports = new MarksController();
