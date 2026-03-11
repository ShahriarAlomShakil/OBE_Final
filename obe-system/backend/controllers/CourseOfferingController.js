const BaseController = require('./BaseController');
const CourseOfferingService = require('../services/CourseOfferingService');
const { body, param, query } = require('express-validator');

/**
 * Course Offering Controller
 * Handles HTTP requests for course offering management
 */
class CourseOfferingController extends BaseController {
  constructor() {
    super(new CourseOfferingService());
  }

  /**
   * Validation rules for creating a course offering
   */
  get createValidation() {
    return [
      body('course_id')
        .isInt({ min: 1 }).withMessage('Course ID must be a positive integer')
        .notEmpty().withMessage('Course ID is required'),
      body('semester_id')
        .isInt({ min: 1 }).withMessage('Semester ID must be a positive integer')
        .notEmpty().withMessage('Semester ID is required'),
      body('teacher_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Teacher ID must be a positive integer'),
      body('section')
        .trim()
        .notEmpty().withMessage('Section is required')
        .isLength({ max: 10 }).withMessage('Section must not exceed 10 characters')
        .toUpperCase(),
      body('max_students')
        .optional()
        .isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200')
        .toInt(),
      body('classroom')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Classroom must not exceed 100 characters'),
      body('schedule')
        .optional()
        .isObject().withMessage('Schedule must be a valid JSON object'),
      body('status')
        .optional()
        .isIn(['planning', 'open', 'ongoing', 'closed', 'completed'])
        .withMessage('Status must be one of: planning, open, ongoing, closed, completed')
    ];
  }

  /**
   * Validation rules for updating a course offering
   */
  get updateValidation() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid course offering ID'),
      body('course_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
      body('semester_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Semester ID must be a positive integer'),
      body('teacher_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Teacher ID must be a positive integer'),
      body('section')
        .optional()
        .trim()
        .isLength({ max: 10 }).withMessage('Section must not exceed 10 characters')
        .toUpperCase(),
      body('max_students')
        .optional()
        .isInt({ min: 1, max: 200 }).withMessage('Max students must be between 1 and 200')
        .toInt(),
      body('classroom')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Classroom must not exceed 100 characters'),
      body('schedule')
        .optional()
        .isObject().withMessage('Schedule must be a valid JSON object'),
      body('status')
        .optional()
        .isIn(['planning', 'open', 'ongoing', 'closed', 'completed'])
        .withMessage('Status must be one of: planning, open, ongoing, closed, completed')
    ];
  }

  /**
   * Validation rules for ID parameter
   */
  get idValidation() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid course offering ID')
    ];
  }

  /**
   * Validation rules for search
   */
  get searchValidation() {
    return [
      query('course_code')
        .optional()
        .trim(),
      query('semester_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Semester ID must be a positive integer'),
      query('status')
        .optional()
        .isIn(['planning', 'open', 'ongoing', 'closed', 'completed'])
        .withMessage('Invalid status'),
      query('section')
        .optional()
        .trim(),
      query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt()
    ];
  }

  /**
   * Validation rules for assigning teacher
   */
  get assignTeacherValidation() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid course offering ID'),
      body('teacher_id')
        .isInt({ min: 1 }).withMessage('Teacher ID must be a positive integer')
        .notEmpty().withMessage('Teacher ID is required'),
      body('role')
        .optional()
        .isIn(['instructor', 'co_instructor', 'lab_instructor', 'teaching_assistant'])
        .withMessage('Role must be one of: instructor, co_instructor, lab_instructor, teaching_assistant')
    ];
  }

  /**
   * Validation rules for removing teacher
   */
  get removeTeacherValidation() {
    return [
      param('id').isInt({ min: 1 }).withMessage('Invalid course offering ID'),
      param('teacherId').isInt({ min: 1 }).withMessage('Invalid teacher ID')
    ];
  }

  /**
   * Get offering with full details (course, semester, teachers)
   * GET /api/v1/course-offerings/:id/details
   */
  async getWithRelations(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.service.getWithRelations(id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offering with course details
   * GET /api/v1/course-offerings/:id/course
   */
  async getWithCourse(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.service.getWithCourse(id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offering with semester details
   * GET /api/v1/course-offerings/:id/semester
   */
  async getWithSemester(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.service.getWithSemester(id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get enrolled students for an offering
   * GET /api/v1/course-offerings/:id/students
   */
  async getStudents(req, res, next) {
    try {
      const { id } = req.params;
      const students = await this.service.getStudents(id);
      
      res.status(200).json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get assessment components for an offering
   * GET /api/v1/course-offerings/:id/assessments
   */
  async getAssessments(req, res, next) {
    try {
      const { id } = req.params;
      const assessments = await this.service.getAssessments(id);
      
      res.status(200).json({
        success: true,
        data: assessments,
        count: assessments.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get CLO attainment summary for an offering
   * GET /api/v1/course-offerings/:id/clo-attainment
   */
  async getCLOAttainment(req, res, next) {
    try {
      const { id } = req.params;
      const attainment = await this.service.getCLOAttainment(id);
      
      res.status(200).json({
        success: true,
        data: attainment,
        count: attainment.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offerings by semester
   * GET /api/v1/course-offerings/semester/:semesterId
   */
  async getBySemester(req, res, next) {
    try {
      const { semesterId } = req.params;
      const offerings = await this.service.getBySemester(semesterId);
      
      res.status(200).json({
        success: true,
        data: offerings,
        count: offerings.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offerings by course
   * GET /api/v1/course-offerings/course/:courseId
   */
  async getByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const offerings = await this.service.getByCourse(courseId);
      
      res.status(200).json({
        success: true,
        data: offerings,
        count: offerings.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active offerings
   * GET /api/v1/course-offerings/active
   */
  async getActive(req, res, next) {
    try {
      const offerings = await this.service.getActive();
      
      res.status(200).json({
        success: true,
        data: offerings,
        count: offerings.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search course offerings
   * GET /api/v1/course-offerings/search
   */
  async search(req, res, next) {
    try {
      const filters = req.query;
      const result = await this.service.search(filters);
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign teacher to offering
   * POST /api/v1/course-offerings/:id/teachers
   */
  async assignTeacher(req, res, next) {
    try {
      const { id } = req.params;
      const { teacher_id, role = 'instructor' } = req.body;
      
      const result = await this.service.assignTeacher(id, teacher_id, role);
      
      res.status(201).json({
        success: true,
        message: 'Teacher assigned successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove teacher from offering
   * DELETE /api/v1/course-offerings/:id/teachers/:teacherId
   */
  async removeTeacher(req, res, next) {
    try {
      const { id, teacherId } = req.params;
      
      await this.service.removeTeacher(id, teacherId);
      
      res.status(200).json({
        success: true,
        message: 'Teacher removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get offering statistics
   * GET /api/v1/course-offerings/:id/statistics
   */
  async getStatistics(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await this.service.getStatistics(id);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update enrollment count
   * PATCH /api/v1/course-offerings/:id/enrollment-count
   */
  async updateEnrollmentCount(req, res, next) {
    try {
      const { id } = req.params;
      const count = await this.service.updateEnrollmentCount(id);
      
      res.status(200).json({
        success: true,
        message: 'Enrollment count updated',
        data: { enrolled_count: count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check offering capacity
   * GET /api/v1/course-offerings/:id/capacity
   */
  async checkCapacity(req, res, next) {
    try {
      const { id } = req.params;
      const capacity = await this.service.checkCapacity(id);
      
      res.status(200).json({
        success: true,
        data: capacity
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseOfferingController();
