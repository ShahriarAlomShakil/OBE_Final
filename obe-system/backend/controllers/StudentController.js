const BaseController = require('./BaseController');
const StudentService = require('../services/StudentService');
const { body, param, query, validationResult } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const responseHelper = require('../utils/responseHelper');

/**
 * StudentController
 * Handles HTTP requests for student management
 */
class StudentController extends BaseController {
  constructor() {
    super(StudentService);
  }

  /**
   * Validation rules for creating a student
   */
  createValidationRules() {
    return [
      body('user_id')
        .notEmpty().withMessage('User ID is required')
        .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
      body('student_id')
        .notEmpty().withMessage('Student ID (roll number) is required')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Student ID must be between 3 and 50 characters'),
      body('department_id')
        .notEmpty().withMessage('Department ID is required')
        .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
      body('degree_id')
        .notEmpty().withMessage('Degree ID is required')
        .isInt({ min: 1 }).withMessage('Degree ID must be a positive integer'),
      body('batch')
        .notEmpty().withMessage('Batch is required')
        .matches(/^\d{4}$/).withMessage('Batch must be a 4-digit year (e.g., 2023)'),
      body('section')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 10 }).withMessage('Section cannot exceed 10 characters'),
      body('admission_date')
        .notEmpty().withMessage('Admission date is required')
        .isISO8601().withMessage('Admission date must be a valid date')
        .custom((value) => {
          if (new Date(value) > new Date()) {
            throw new Error('Admission date cannot be in the future');
          }
          return true;
        }),
      body('cgpa')
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 4 }).withMessage('CGPA must be between 0 and 4.0'),
      body('credits_completed')
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage('Credits completed cannot be negative')
    ];
  }

  /**
   * Validation rules for updating a student
   */
  updateValidationRules() {
    return [
      param('id')
        .isInt({ min: 1 }).withMessage('Invalid student ID'),
      body('student_id')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Student ID must be between 3 and 50 characters'),
      body('department_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Department ID must be a positive integer'),
      body('degree_id')
        .optional()
        .isInt({ min: 1 }).withMessage('Degree ID must be a positive integer'),
      body('batch')
        .optional()
        .matches(/^\d{4}$/).withMessage('Batch must be a 4-digit year (e.g., 2023)'),
      body('section')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 10 }).withMessage('Section cannot exceed 10 characters'),
      body('admission_date')
        .optional()
        .isISO8601().withMessage('Admission date must be a valid date')
        .custom((value) => {
          if (new Date(value) > new Date()) {
            throw new Error('Admission date cannot be in the future');
          }
          return true;
        }),
      body('cgpa')
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 4 }).withMessage('CGPA must be between 0 and 4.0'),
      body('credits_completed')
        .optional({ nullable: true })
        .isInt({ min: 0 }).withMessage('Credits completed cannot be negative')
    ];
  }

  /**
   * GET /api/v1/students/:id/relations
   * Get student with all relations (user, department, degree)
   */
  getWithRelations = asyncHandler(async (req, res) => {
    const student = await this.service.getWithRelations(req.params.id);
    
    if (!student) {
      return responseHelper.notFound(res, 'Student not found');
    }

    return responseHelper.success(res, student, 'Student retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/user
   * Get student with user info
   */
  getWithUser = asyncHandler(async (req, res) => {
    const student = await this.service.getWithUser(req.params.id);
    
    if (!student) {
      return responseHelper.notFound(res, 'Student not found');
    }

    return responseHelper.success(res, student, 'Student with user info retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/department
   * Get student with department info
   */
  getWithDepartment = asyncHandler(async (req, res) => {
    const student = await this.service.getWithDepartment(req.params.id);
    
    if (!student) {
      return responseHelper.notFound(res, 'Student not found');
    }

    return responseHelper.success(res, student, 'Student with department retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/degree
   * Get student with degree info
   */
  getWithDegree = asyncHandler(async (req, res) => {
    const student = await this.service.getWithDegree(req.params.id);
    
    if (!student) {
      return responseHelper.notFound(res, 'Student not found');
    }

    return responseHelper.success(res, student, 'Student with degree retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/enrollments
   * Get all course enrollments for a student
   */
  getEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await this.service.getEnrollments(req.params.id);
    
    return responseHelper.success(res, enrollments, 'Student enrollments retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/results
   * Get all results/marks for a student
   */
  getResults = asyncHandler(async (req, res) => {
    const { courseOfferingId } = req.query;
    const results = await this.service.getResults(req.params.id, courseOfferingId);
    
    return responseHelper.success(res, results, 'Student results retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/clo-attainments
   * Get CLO attainments for a student
   */
  getCLOAttainments = asyncHandler(async (req, res) => {
    const { courseOfferingId } = req.query;
    const attainments = await this.service.getCLOAttainments(req.params.id, courseOfferingId);
    
    return responseHelper.success(res, attainments, 'Student CLO attainments retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/plo-attainments
   * Get PLO attainments for a student
   */
  getPLOAttainments = asyncHandler(async (req, res) => {
    const attainments = await this.service.getPLOAttainments(req.params.id);
    
    return responseHelper.success(res, attainments, 'Student PLO attainments retrieved successfully');
  });

  /**
   * GET /api/v1/students/stats
   * Get student statistics
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await this.service.getStats();
    
    return responseHelper.success(res, stats, 'Student statistics retrieved successfully');
  });

  /**
   * GET /api/v1/students/active
   * Get all active students
   */
  getActive = asyncHandler(async (req, res) => {
    const students = await this.service.getActive();
    
    return responseHelper.success(res, students, 'Active students retrieved successfully', {
      count: students.length
    });
  });

  /**
   * GET /api/v1/students/search?q=term
   * Search students
   */
  search = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
      return responseHelper.badRequest(res, 'Search query parameter "q" is required');
    }

    const students = await this.service.search(q);
    
    return responseHelper.success(res, students, 'Search results retrieved successfully', {
      count: students.length,
      query: q
    });
  });

  /**
   * GET /api/v1/students/by-department?departmentId=X
   * Get students by department
   */
  getByDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    
    if (!departmentId) {
      return responseHelper.badRequest(res, 'Department ID is required');
    }

    const students = await this.service.getByDepartmentId(departmentId);
    
    return responseHelper.success(res, students, 'Students retrieved successfully', {
      count: students.length,
      departmentId: parseInt(departmentId)
    });
  });

  /**
   * GET /api/v1/students/by-degree?degreeId=X
   * Get students by degree
   */
  getByDegree = asyncHandler(async (req, res) => {
    const { degreeId } = req.query;
    
    if (!degreeId) {
      return responseHelper.badRequest(res, 'Degree ID is required');
    }

    const students = await this.service.getByDegreeId(degreeId);
    
    return responseHelper.success(res, students, 'Students retrieved successfully', {
      count: students.length,
      degreeId: parseInt(degreeId)
    });
  });

  /**
   * GET /api/v1/students/by-batch?batch=2023&departmentId=X
   * Get students by batch
   */
  getByBatch = asyncHandler(async (req, res) => {
    const { batch, departmentId } = req.query;
    
    if (!batch) {
      return responseHelper.badRequest(res, 'Batch is required');
    }

    const students = await this.service.getByBatch(batch, departmentId);
    
    return responseHelper.success(res, students, 'Students retrieved successfully', {
      count: students.length,
      batch,
      departmentId: departmentId ? parseInt(departmentId) : null
    });
  });

  /**
   * GET /api/v1/students/by-section?section=A&batch=2023&departmentId=X
   * Get students by section
   */
  getBySection = asyncHandler(async (req, res) => {
    const { section, batch, departmentId } = req.query;
    
    if (!section || !batch) {
      return responseHelper.badRequest(res, 'Section and batch are required');
    }

    const students = await this.service.getBySection(section, batch, departmentId);
    
    return responseHelper.success(res, students, 'Students retrieved successfully', {
      count: students.length,
      section,
      batch,
      departmentId: departmentId ? parseInt(departmentId) : null
    });
  });

  /**
   * GET /api/v1/students/by-user?userId=X
   * Get student by user ID
   */
  getByUser = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
      return responseHelper.badRequest(res, 'User ID is required');
    }

    const student = await this.service.getByUserId(userId);
    
    if (!student) {
      return responseHelper.notFound(res, 'Student not found for this user');
    }

    return responseHelper.success(res, student, 'Student retrieved successfully');
  });

  /**
   * GET /api/v1/students/by-student-id?studentId=XXX
   * Get student by student ID (roll number)
   */
  getByStudentId = asyncHandler(async (req, res) => {
    const { studentId } = req.query;
    
    if (!studentId) {
      return responseHelper.badRequest(res, 'Student ID is required');
    }

    const student = await this.service.getByStudentId(studentId);
    
    if (!student) {
      return responseHelper.notFound(res, 'Student not found');
    }

    return responseHelper.success(res, student, 'Student retrieved successfully');
  });

  /**
   * GET /api/v1/students/:id/statistics
   * Get statistics for a student
   */
  getStatistics = asyncHandler(async (req, res) => {
    const statistics = await this.service.getStatistics(req.params.id);
    
    return responseHelper.success(res, statistics, 'Student statistics retrieved successfully');
  });

  /**
   * PATCH /api/v1/students/:id/cgpa
   * Update student CGPA
   */
  updateCGPA = asyncHandler(async (req, res) => {
    const { cgpa } = req.body;
    
    if (cgpa === undefined || cgpa === null) {
      return responseHelper.badRequest(res, 'CGPA is required');
    }

    const student = await this.service.updateCGPA(req.params.id, parseFloat(cgpa));
    
    return responseHelper.success(res, student, 'CGPA updated successfully');
  });

  /**
   * PATCH /api/v1/students/:id/credits
   * Update student credits completed
   */
  updateCredits = asyncHandler(async (req, res) => {
    const { credits } = req.body;
    
    if (credits === undefined || credits === null) {
      return responseHelper.badRequest(res, 'Credits are required');
    }

    const student = await this.service.updateCreditsCompleted(req.params.id, parseInt(credits));
    
    return responseHelper.success(res, student, 'Credits completed updated successfully');
  });
}

module.exports = new StudentController();
