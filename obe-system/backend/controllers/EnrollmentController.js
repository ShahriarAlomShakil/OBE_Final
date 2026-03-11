const BaseController = require('./BaseController');
const EnrollmentService = require('../services/EnrollmentService');
const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const responseHelper = require('../utils/responseHelper');

/**
 * EnrollmentController
 * Handles HTTP requests for course enrollment management
 */
class EnrollmentController extends BaseController {
  constructor() {
    super(EnrollmentService);
  }

  /**
   * Validation rules for creating an enrollment
   */
  createValidationRules() {
    return [
      body('course_offering_id')
        .notEmpty().withMessage('Course offering ID is required')
        .isInt({ min: 1 }).withMessage('Course offering ID must be a positive integer'),
      body('student_id')
        .notEmpty().withMessage('Student ID is required')
        .isInt({ min: 1 }).withMessage('Student ID must be a positive integer'),
      body('enrollment_date')
        .optional()
        .isISO8601().withMessage('Enrollment date must be a valid date')
        .custom((value) => {
          if (new Date(value) > new Date()) {
            throw new Error('Enrollment date cannot be in the future');
          }
          return true;
        }),
      body('status')
        .optional()
        .isIn(['active', 'dropped', 'completed', 'withdrawn'])
        .withMessage('Status must be one of: active, dropped, completed, withdrawn')
    ];
  }

  /**
   * Validation rules for updating an enrollment
   */
  updateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('Invalid enrollment ID'),
      body('status')
        .optional()
        .isIn(['active', 'dropped', 'completed', 'withdrawn'])
        .withMessage('Status must be one of: active, dropped, completed, withdrawn'),
      body('enrollment_date')
        .optional()
        .isISO8601().withMessage('Enrollment date must be a valid date')
        .custom((value) => {
          if (new Date(value) > new Date()) {
            throw new Error('Enrollment date cannot be in the future');
          }
          return true;
        })
    ];
  }

  /**
   * Validation rules for bulk enrollment
   */
  bulkEnrollValidationRules() {
    return [
      body('course_offering_id')
        .notEmpty().withMessage('Course offering ID is required')
        .isInt({ min: 1 }).withMessage('Course offering ID must be a positive integer'),
      body('student_ids')
        .notEmpty().withMessage('Student IDs are required')
        .isArray({ min: 1 }).withMessage('Student IDs must be a non-empty array')
        .custom((value) => {
          if (!value.every(id => Number.isInteger(id) && id > 0)) {
            throw new Error('All student IDs must be positive integers');
          }
          return true;
        }),
      body('enrollment_date')
        .optional()
        .isISO8601().withMessage('Enrollment date must be a valid date'),
      body('status')
        .optional()
        .isIn(['active', 'dropped', 'completed', 'withdrawn'])
        .withMessage('Status must be one of: active, dropped, completed, withdrawn')
    ];
  }

  /**
   * POST /api/v1/enrollments
   * Enroll a single student in a course offering
   */
  enrollStudent = asyncHandler(async (req, res) => {
    const { course_offering_id, student_id, enrollment_date, status } = req.body;

    const serviceInstance = new this.ServiceClass();
    const enrollment = await serviceInstance.enrollStudent(
      course_offering_id, 
      student_id,
      { enrollment_date, status }
    );

    responseHelper.success(res, enrollment, 'Student enrolled successfully', 201);
  });

  /**
   * POST /api/v1/enrollments/bulk
   * Enroll multiple students in a course offering
   */
  bulkEnroll = asyncHandler(async (req, res) => {
    const { course_offering_id, student_ids, enrollment_date, status } = req.body;

    const serviceInstance = new this.ServiceClass();
    const results = await serviceInstance.bulkEnroll(
      course_offering_id,
      student_ids,
      { enrollment_date, status }
    );

    const message = `Bulk enrollment completed. Success: ${results.success.length}, Failed: ${results.failed.length}`;
    responseHelper.success(res, results, message, 201);
  });

  /**
   * GET /api/v1/course-offerings/:id/enrollments
   * Get all students enrolled in a course offering
   */
  getStudentsByCourseOffering = asyncHandler(async (req, res) => {
    const courseOfferingId = parseInt(req.params.id);
    const { status, batch, section } = req.query;

    const serviceInstance = new this.ServiceClass();
    const enrollments = await serviceInstance.getStudentsByCourseOffering(
      courseOfferingId,
      { status, batch, section }
    );

    responseHelper.success(
      res,
      enrollments,
      `Found ${enrollments.length} enrolled student(s)`
    );
  });

  /**
   * GET /api/v1/course-offerings/:id/enrollments/with-marks
   * Get enrollments with assessment marks for a course offering
   */
  getEnrollmentsWithMarks = asyncHandler(async (req, res) => {
    const courseOfferingId = parseInt(req.params.id);

    const serviceInstance = new this.ServiceClass();
    const enrollments = await serviceInstance.getEnrollmentsWithMarks(courseOfferingId);

    responseHelper.success(
      res,
      enrollments,
      `Found ${enrollments.length} enrollment(s) with marks data`
    );
  });

  /**
   * GET /api/v1/students/:id/enrollments
   * Get all enrollments for a specific student
   */
  getEnrollmentsByStudent = asyncHandler(async (req, res) => {
    const studentId = parseInt(req.params.id);

    const serviceInstance = new this.ServiceClass();
    const enrollments = await serviceInstance.getEnrollmentsByStudent(studentId);

    responseHelper.success(
      res,
      enrollments,
      `Found ${enrollments.length} enrollment(s) for student`
    );
  });

  /**
   * GET /api/v1/enrollments/:id
   * Get enrollment details by ID
   */
  getEnrollmentDetails = asyncHandler(async (req, res) => {
    const enrollmentId = parseInt(req.params.id);

    const serviceInstance = new this.ServiceClass();
    const enrollment = await serviceInstance.getEnrollmentDetails(enrollmentId);

    responseHelper.success(res, enrollment, 'Enrollment details retrieved successfully');
  });

  /**
   * GET /api/v1/enrollments/check
   * Check if a student is enrolled in a course offering
   */
  checkEnrollmentStatus = asyncHandler(async (req, res) => {
    const { course_offering_id, student_id } = req.query;

    if (!course_offering_id || !student_id) {
      return responseHelper.error(
        res,
        'Course offering ID and student ID are required',
        400
      );
    }

    const serviceInstance = new this.ServiceClass();
    const status = await serviceInstance.checkEnrollmentStatus(
      parseInt(course_offering_id),
      parseInt(student_id)
    );

    responseHelper.success(res, status, 'Enrollment status checked successfully');
  });

  /**
   * PUT /api/v1/enrollments/:id/drop
   * Drop a student from a course (set status to 'dropped')
   */
  dropStudent = asyncHandler(async (req, res) => {
    const enrollmentId = parseInt(req.params.id);

    const serviceInstance = new this.ServiceClass();
    const enrollment = await serviceInstance.dropStudent(enrollmentId);

    responseHelper.success(res, enrollment, 'Student dropped from course successfully');
  });

  /**
   * DELETE /api/v1/enrollments/:id
   * Soft delete an enrollment
   */
  destroy = asyncHandler(async (req, res) => {
    const enrollmentId = parseInt(req.params.id);

    const serviceInstance = new this.ServiceClass();
    await serviceInstance.delete(enrollmentId);

    responseHelper.success(res, null, 'Enrollment deleted successfully');
  });

  /**
   * GET /api/v1/enrollments/by-status
   * Get enrollments filtered by status
   */
  getByStatus = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    if (!status) {
      return responseHelper.error(res, 'Status is required', 400);
    }

    const serviceInstance = new this.ServiceClass();
    const result = await serviceInstance.model.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      where: { status },
      orderBy: 'enrollment_date DESC'
    });

    responseHelper.paginated(
      res,
      result.data,
      result.pagination,
      `Found ${result.data.length} enrollment(s) with status: ${status}`
    );
  });

  /**
   * GET /api/v1/enrollments
   * Get all enrollments with pagination
   */
  index = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const serviceInstance = new this.ServiceClass();
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy: 'created_at DESC'
    };

    if (status) {
      options.where = { status };
    }

    const result = await serviceInstance.model.findAll(options);

    responseHelper.paginated(
      res,
      result.data,
      result.pagination,
      'Enrollments retrieved successfully'
    );
  });
}

// Create and export controller instance
const enrollmentController = new EnrollmentController();

module.exports = enrollmentController;
