const { body, param, query, validationResult } = require('express-validator');
const responseHelper = require('../utils/responseHelper');
const AttainmentCalculationService = require('../services/AttainmentCalculationService');

/**
 * Attainment Controller
 * Handles HTTP requests for CLO and PLO attainment calculations
 */
class AttainmentController {
  /**
   * Calculate CLO attainment for a single student
   * POST /api/v1/attainment/calculate/student-clo
   */
  async calculateStudentCLO(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { studentId, courseOfferingId } = req.body;

      // Calculate attainment
      const attainment = await AttainmentCalculationService.calculateStudentCLOAttainment(
        studentId,
        courseOfferingId
      );

      return responseHelper.success(
        res,
        attainment,
        'Student CLO attainment calculated successfully'
      );
    } catch (error) {
      console.error('Calculate Student CLO Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to calculate student CLO attainment'
      );
    }
  }

  /**
   * Calculate CLO attainment for all students in a course offering
   * POST /api/v1/attainment/calculate/course-clo
   */
  async calculateCourseCLO(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseOfferingId } = req.body;

      // Calculate attainment
      const attainment = await AttainmentCalculationService.calculateCourseCLOAttainment(
        courseOfferingId
      );

      return responseHelper.success(
        res,
        attainment,
        'Course CLO attainment calculated successfully'
      );
    } catch (error) {
      console.error('Calculate Course CLO Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to calculate course CLO attainment'
      );
    }
  }

  /**
   * Calculate PLO attainment for a single student
   * POST /api/v1/attainment/calculate/student-plo
   */
  async calculateStudentPLO(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { studentId, degreeId } = req.body;

      // Calculate attainment
      const attainment = await AttainmentCalculationService.calculateStudentPLOAttainment(
        studentId,
        degreeId
      );

      return responseHelper.success(
        res,
        attainment,
        'Student PLO attainment calculated successfully'
      );
    } catch (error) {
      console.error('Calculate Student PLO Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to calculate student PLO attainment'
      );
    }
  }

  /**
   * Calculate PLO attainment for a program/batch
   * POST /api/v1/attainment/calculate/program-plo
   */
  async calculateProgramPLO(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { degreeId, batchYear } = req.body;

      // Calculate attainment
      const attainment = await AttainmentCalculationService.calculateProgramPLOAttainment(
        degreeId,
        batchYear
      );

      return responseHelper.success(
        res,
        attainment,
        'Program PLO attainment calculated successfully'
      );
    } catch (error) {
      console.error('Calculate Program PLO Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to calculate program PLO attainment'
      );
    }
  }

  /**
   * Get student's CLO attainment for a course
   * GET /api/v1/attainment/student/:studentId/clo?courseOfferingId=X
   */
  async getStudentCLOAttainment(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { studentId } = req.params;
      const { courseOfferingId } = req.query;

      // Get attainment
      const attainment = await AttainmentCalculationService.getStudentCLOAttainment(
        parseInt(studentId),
        parseInt(courseOfferingId)
      );

      if (!attainment || attainment.length === 0) {
        return responseHelper.notFound(
          res,
          'CLO attainment not found. Please calculate attainment first.'
        );
      }

      return responseHelper.success(
        res,
        attainment,
        'Student CLO attainment retrieved successfully'
      );
    } catch (error) {
      console.error('Get Student CLO Attainment Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to retrieve student CLO attainment'
      );
    }
  }

  /**
   * Get course CLO attainment summary
   * GET /api/v1/attainment/course/:courseOfferingId/clo
   */
  async getCourseCLOAttainmentSummary(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { courseOfferingId } = req.params;

      // Get attainment summary
      const attainment = await AttainmentCalculationService.getCourseCLOAttainmentSummary(
        parseInt(courseOfferingId)
      );

      if (!attainment || attainment.length === 0) {
        return responseHelper.notFound(
          res,
          'Course CLO attainment summary not found. Please calculate attainment first.'
        );
      }

      return responseHelper.success(
        res,
        attainment,
        'Course CLO attainment summary retrieved successfully'
      );
    } catch (error) {
      console.error('Get Course CLO Attainment Summary Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to retrieve course CLO attainment summary'
      );
    }
  }

  /**
   * Get student's PLO attainment
   * GET /api/v1/attainment/student/:studentId/plo
   */
  async getStudentPLOAttainment(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { studentId } = req.params;
      const { degreeId } = req.query;

      // Get attainment
      const attainment = await AttainmentCalculationService.getStudentPLOAttainment(
        parseInt(studentId),
        degreeId ? parseInt(degreeId) : null
      );

      if (!attainment || attainment.length === 0) {
        return responseHelper.notFound(
          res,
          'PLO attainment not found. Please calculate attainment first.'
        );
      }

      return responseHelper.success(
        res,
        attainment,
        'Student PLO attainment retrieved successfully'
      );
    } catch (error) {
      console.error('Get Student PLO Attainment Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to retrieve student PLO attainment'
      );
    }
  }

  /**
   * Get program PLO attainment summary
   * GET /api/v1/attainment/program/:degreeId/plo?batch=2023
   */
  async getProgramPLOAttainmentSummary(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.validationError(res, 'Validation failed', errors.array());
      }

      const { degreeId } = req.params;
      const { batch } = req.query;

      // Get attainment summary
      const attainment = await AttainmentCalculationService.getProgramPLOAttainmentSummary(
        parseInt(degreeId),
        batch ? parseInt(batch) : null
      );

      if (!attainment || attainment.length === 0) {
        return responseHelper.notFound(
          res,
          'Program PLO attainment summary not found. Please calculate attainment first.'
        );
      }

      return responseHelper.success(
        res,
        attainment,
        'Program PLO attainment summary retrieved successfully'
      );
    } catch (error) {
      console.error('Get Program PLO Attainment Summary Error:', error);
      return responseHelper.error(
        res,
        error.message || 'Failed to retrieve program PLO attainment summary'
      );
    }
  }

  /**
   * Validation rules for calculating student CLO attainment
   */
  validateCalculateStudentCLO() {
    return [
      body('studentId')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
      body('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course Offering ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for calculating course CLO attainment
   */
  validateCalculateCourseCLO() {
    return [
      body('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course Offering ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for calculating student PLO attainment
   */
  validateCalculateStudentPLO() {
    return [
      body('studentId')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
      body('degreeId')
        .isInt({ min: 1 })
        .withMessage('Degree ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for calculating program PLO attainment
   */
  validateCalculateProgramPLO() {
    return [
      body('degreeId')
        .isInt({ min: 1 })
        .withMessage('Degree ID must be a positive integer'),
      body('batchYear')
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Batch year must be a valid year')
    ];
  }

  /**
   * Validation rules for getting student CLO attainment
   */
  validateGetStudentCLO() {
    return [
      param('studentId')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
      query('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course Offering ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getting course CLO attainment summary
   */
  validateGetCourseCLO() {
    return [
      param('courseOfferingId')
        .isInt({ min: 1 })
        .withMessage('Course Offering ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getting student PLO attainment
   */
  validateGetStudentPLO() {
    return [
      param('studentId')
        .isInt({ min: 1 })
        .withMessage('Student ID must be a positive integer'),
      query('degreeId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Degree ID must be a positive integer')
    ];
  }

  /**
   * Validation rules for getting program PLO attainment summary
   */
  validateGetProgramPLO() {
    return [
      param('degreeId')
        .isInt({ min: 1 })
        .withMessage('Degree ID must be a positive integer'),
      query('batch')
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Batch must be a valid year')
    ];
  }
}

module.exports = new AttainmentController();
