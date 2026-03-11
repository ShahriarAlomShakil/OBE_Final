const BaseService = require('./BaseService');
const CourseEnrollment = require('../models/CourseEnrollment');
const Joi = require('joi');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/AppError');
const db = require('../config/database');

/**
 * EnrollmentService
 * Business logic for course enrollment management
 */
class EnrollmentService extends BaseService {
  constructor() {
    super(CourseEnrollment);
  }

  /**
   * Joi validation schema for creating an enrollment
   */
  getCreateValidationSchema() {
    return Joi.object({
      course_offering_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Course offering ID must be a number',
          'number.positive': 'Course offering ID must be positive',
          'any.required': 'Course offering ID is required'
        }),
      student_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Student ID must be a number',
          'number.positive': 'Student ID must be positive',
          'any.required': 'Student ID is required'
        }),
      enrollment_date: Joi.date().max('now').optional()
        .messages({
          'date.base': 'Enrollment date must be a valid date',
          'date.max': 'Enrollment date cannot be in the future'
        }),
      status: Joi.string().valid('active', 'dropped', 'completed', 'withdrawn').default('active')
        .messages({
          'string.base': 'Status must be a string',
          'any.only': 'Status must be one of: active, dropped, completed, withdrawn'
        })
    });
  }

  /**
   * Joi validation schema for updating an enrollment
   */
  getUpdateValidationSchema() {
    return Joi.object({
      status: Joi.string().valid('active', 'dropped', 'completed', 'withdrawn')
        .messages({
          'string.base': 'Status must be a string',
          'any.only': 'Status must be one of: active, dropped, completed, withdrawn'
        }),
      enrollment_date: Joi.date().max('now')
        .messages({
          'date.base': 'Enrollment date must be a valid date',
          'date.max': 'Enrollment date cannot be in the future'
        })
    });
  }

  /**
   * Enroll a student in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} studentId - Student ID
   * @param {Object} options - Additional enrollment options
   * @returns {Promise<Object>} Created enrollment
   */
  async enrollStudent(courseOfferingId, studentId, options = {}) {
    try {
      // Check if student exists
      const [students] = await db.execute(
        'SELECT id FROM students WHERE id = ? AND deleted_at IS NULL',
        [studentId]
      );

      if (students.length === 0) {
        throw new NotFoundError(`Student with ID ${studentId} not found`);
      }

      // Check if course offering exists
      const [offerings] = await db.execute(
        'SELECT id, max_students FROM course_offerings WHERE id = ? AND deleted_at IS NULL',
        [courseOfferingId]
      );

      if (offerings.length === 0) {
        throw new NotFoundError(`Course offering with ID ${courseOfferingId} not found`);
      }

      const offering = offerings[0];

      // Check if already enrolled
      const isEnrolled = await this.model.isEnrolled(courseOfferingId, studentId);
      if (isEnrolled) {
        throw new ConflictError('Student is already enrolled in this course offering');
      }

      // Check enrollment capacity
      const enrollmentCount = await this.model.getEnrollmentCount(courseOfferingId);
      if (offering.max_students && enrollmentCount >= offering.max_students) {
        throw new ConflictError('Course offering has reached maximum enrollment capacity');
      }

      // Create enrollment data
      const enrollmentData = {
        course_offering_id: courseOfferingId,
        student_id: studentId,
        enrollment_date: options.enrollment_date || new Date().toISOString().split('T')[0],
        status: options.status || 'active'
      };

      // Validate enrollment data
      const validationResult = this.getCreateValidationSchema().validate(enrollmentData);
      if (validationResult.error) {
        throw new ValidationError(validationResult.error.details[0].message);
      }

      // Create enrollment
      const enrollment = await this.model.create(enrollmentData);

      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Enroll multiple students in a course offering (bulk enrollment)
   * @param {number} courseOfferingId - Course offering ID
   * @param {Array<number>} studentIds - Array of student IDs
   * @param {Object} options - Additional enrollment options
   * @returns {Promise<Object>} Enrollment results
   */
  async bulkEnroll(courseOfferingId, studentIds, options = {}) {
    try {
      // Check if course offering exists
      const [offerings] = await db.execute(
        'SELECT id, max_students FROM course_offerings WHERE id = ? AND deleted_at IS NULL',
        [courseOfferingId]
      );

      if (offerings.length === 0) {
        throw new NotFoundError(`Course offering with ID ${courseOfferingId} not found`);
      }

      const offering = offerings[0];

      // Get current enrollment count
      const currentCount = await this.model.getEnrollmentCount(courseOfferingId);

      // Check if bulk enrollment would exceed capacity
      if (offering.max_students && (currentCount + studentIds.length) > offering.max_students) {
        throw new ConflictError(
          `Cannot enroll ${studentIds.length} students. ` +
          `Maximum capacity: ${offering.max_students}, Current: ${currentCount}, Available: ${offering.max_students - currentCount}`
        );
      }

      const results = {
        success: [],
        failed: [],
        total: studentIds.length
      };

      // Enroll each student
      for (const studentId of studentIds) {
        try {
          const enrollment = await this.enrollStudent(courseOfferingId, studentId, options);
          results.success.push({
            student_id: studentId,
            enrollment_id: enrollment.id
          });
        } catch (error) {
          results.failed.push({
            student_id: studentId,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all students enrolled in a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of enrollments with student details
   */
  async getStudentsByCourseOffering(courseOfferingId, options = {}) {
    try {
      // Check if course offering exists
      const [offerings] = await db.execute(
        'SELECT id FROM course_offerings WHERE id = ? AND deleted_at IS NULL',
        [courseOfferingId]
      );

      if (offerings.length === 0) {
        throw new NotFoundError(`Course offering with ID ${courseOfferingId} not found`);
      }

      // Build query with optional filters
      let query = `
        SELECT ce.id as enrollment_id, ce.enrollment_date, ce.status,
               s.id as student_id, s.student_id as roll_number, 
               s.batch, s.section as student_section, s.cgpa,
               u.id as user_id, u.name as student_name, u.email
        FROM course_enrollments ce
        INNER JOIN students s ON ce.student_id = s.id
        INNER JOIN users u ON s.user_id = u.id
        WHERE ce.course_offering_id = ? 
          AND ce.deleted_at IS NULL 
          AND s.deleted_at IS NULL 
          AND u.deleted_at IS NULL
      `;

      const params = [courseOfferingId];

      // Filter by status if provided
      if (options.status) {
        query += ' AND ce.status = ?';
        params.push(options.status);
      }

      // Filter by batch if provided
      if (options.batch) {
        query += ' AND s.batch = ?';
        params.push(options.batch);
      }

      // Filter by section if provided
      if (options.section) {
        query += ' AND s.section = ?';
        params.push(options.section);
      }

      query += ' ORDER BY u.name ASC';

      const [rows] = await db.execute(query, params);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Drop a student from a course (soft delete)
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Updated enrollment
   */
  async dropStudent(enrollmentId) {
    try {
      // Check if enrollment exists
      const enrollment = await this.model.findById(enrollmentId);
      
      if (!enrollment) {
        throw new NotFoundError(`Enrollment with ID ${enrollmentId} not found`);
      }

      // Check if already dropped
      if (enrollment.status === 'dropped') {
        throw new ConflictError('Student has already been dropped from this course');
      }

      // Update status to dropped
      const updatedEnrollment = await this.model.update(enrollmentId, {
        status: 'dropped'
      });

      return updatedEnrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollment by ID with full details
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Enrollment with course and student details
   */
  async getEnrollmentDetails(enrollmentId) {
    try {
      const enrollment = await this.model.findById(enrollmentId);
      
      if (!enrollment) {
        throw new NotFoundError(`Enrollment with ID ${enrollmentId} not found`);
      }

      // Get course offering details
      const courseOffering = await this.model.getCourseOffering(enrollmentId);

      // Get student details
      const student = await this.model.getStudent(enrollmentId);

      return {
        ...enrollment,
        course_offering: courseOffering,
        student: student
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all enrollments for a student
   * @param {number} studentId - Student ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of enrollments
   */
  async getEnrollmentsByStudent(studentId, options = {}) {
    try {
      // Check if student exists
      const [students] = await db.execute(
        'SELECT id FROM students WHERE id = ? AND deleted_at IS NULL',
        [studentId]
      );

      if (students.length === 0) {
        throw new NotFoundError(`Student with ID ${studentId} not found`);
      }

      return await this.model.getByStudent(studentId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollments with marks for a course offering
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Array>} Array of enrollments with marks
   */
  async getEnrollmentsWithMarks(courseOfferingId) {
    try {
      // Check if course offering exists
      const [offerings] = await db.execute(
        'SELECT id FROM course_offerings WHERE id = ? AND deleted_at IS NULL',
        [courseOfferingId]
      );

      if (offerings.length === 0) {
        throw new NotFoundError(`Course offering with ID ${courseOfferingId} not found`);
      }

      return await this.model.getWithMarks(courseOfferingId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check enrollment status
   * @param {number} courseOfferingId - Course offering ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Enrollment status
   */
  async checkEnrollmentStatus(courseOfferingId, studentId) {
    try {
      const enrollment = await this.model.getByOfferingAndStudent(courseOfferingId, studentId);
      
      if (!enrollment) {
        return {
          enrolled: false,
          status: null,
          enrollment: null
        };
      }

      return {
        enrolled: true,
        status: enrollment.status,
        enrollment: enrollment
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EnrollmentService;
