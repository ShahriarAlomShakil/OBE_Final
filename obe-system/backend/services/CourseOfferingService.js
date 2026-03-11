const BaseService = require('./BaseService');
const CourseOffering = require('../models/CourseOffering');
const Joi = require('joi');
const { ValidationError, NotFoundError, BusinessLogicError } = require('../utils/AppError');
const db = require('../config/database');

/**
 * Course Offering Service
 * Business logic for course offering management
 */
class CourseOfferingService extends BaseService {
  constructor() {
    super(CourseOffering, 'Course Offering');
    this.model = CourseOffering;
  }

  /**
   * Joi validation schema for course offering creation
   */
  get createValidationSchema() {
    return Joi.object({
      course_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Course ID must be a number',
          'number.positive': 'Course ID must be positive',
          'any.required': 'Course ID is required'
        }),
      semester_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Semester ID must be a number',
          'number.positive': 'Semester ID must be positive',
          'any.required': 'Semester ID is required'
        }),
      teacher_id: Joi.number().integer().positive().optional()
        .messages({
          'number.base': 'Teacher ID must be a number',
          'number.positive': 'Teacher ID must be positive'
        }),
      section: Joi.string().trim().uppercase().max(10).required()
        .messages({
          'string.empty': 'Section is required',
          'string.max': 'Section must not exceed 10 characters',
          'any.required': 'Section is required'
        }),
      max_students: Joi.number().integer().min(1).max(200).default(40)
        .messages({
          'number.base': 'Max students must be a number',
          'number.min': 'Max students must be at least 1',
          'number.max': 'Max students cannot exceed 200'
        }),
      classroom: Joi.string().trim().max(100).allow('', null)
        .messages({
          'string.max': 'Classroom must not exceed 100 characters'
        }),
      schedule: Joi.object().allow(null)
        .messages({
          'object.base': 'Schedule must be a valid JSON object'
        }),
      status: Joi.string().valid('planning', 'open', 'ongoing', 'closed', 'completed').default('planning')
        .messages({
          'any.only': 'Status must be one of: planning, open, ongoing, closed, completed'
        })
    });
  }

  /**
   * Joi validation schema for course offering update
   */
  get updateValidationSchema() {
    return Joi.object({
      course_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Course ID must be a number',
          'number.positive': 'Course ID must be positive'
        }),
      semester_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Semester ID must be a number',
          'number.positive': 'Semester ID must be positive'
        }),
      teacher_id: Joi.number().integer().positive().allow(null)
        .messages({
          'number.base': 'Teacher ID must be a number',
          'number.positive': 'Teacher ID must be positive'
        }),
      section: Joi.string().trim().uppercase().max(10)
        .messages({
          'string.max': 'Section must not exceed 10 characters'
        }),
      max_students: Joi.number().integer().min(1).max(200)
        .messages({
          'number.base': 'Max students must be a number',
          'number.min': 'Max students must be at least 1',
          'number.max': 'Max students cannot exceed 200'
        }),
      classroom: Joi.string().trim().max(100).allow('', null)
        .messages({
          'string.max': 'Classroom must not exceed 100 characters'
        }),
      schedule: Joi.object().allow(null)
        .messages({
          'object.base': 'Schedule must be a valid JSON object'
        }),
      status: Joi.string().valid('planning', 'open', 'ongoing', 'closed', 'completed')
        .messages({
          'any.only': 'Status must be one of: planning, open, ongoing, closed, completed'
        })
    }).min(1);
  }

  /**
   * Before create hook - validate uniqueness and dependencies
   * @param {Object} data - Course offering data
   * @returns {Promise<Object>} - Validated data
   */
  async beforeCreate(data) {
    // Validate that course exists
    const [courseRows] = await db.execute(
      'SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL',
      [data.course_id]
    );
    if (courseRows.length === 0) {
      throw new NotFoundError('Course not found');
    }

    // Validate that semester exists
    const [semesterRows] = await db.execute(
      'SELECT id FROM semesters WHERE id = ? AND deleted_at IS NULL',
      [data.semester_id]
    );
    if (semesterRows.length === 0) {
      throw new NotFoundError('Semester not found');
    }

    // Validate teacher if provided
    if (data.teacher_id) {
      const [teacherRows] = await db.execute(
        'SELECT id FROM teachers WHERE id = ? AND deleted_at IS NULL',
        [data.teacher_id]
      );
      if (teacherRows.length === 0) {
        throw new NotFoundError('Teacher not found');
      }
    }

    // Check if offering already exists for this course, semester, and section
    const [existingRows] = await db.execute(
      `SELECT id FROM course_offerings 
       WHERE course_id = ? AND semester_id = ? AND section = ? AND deleted_at IS NULL`,
      [data.course_id, data.semester_id, data.section]
    );
    if (existingRows.length > 0) {
      throw new BusinessLogicError(
        'A course offering already exists for this course, semester, and section'
      );
    }

    // Initialize enrolled_count to 0
    data.enrolled_count = 0;

    return data;
  }

  /**
   * After create hook - assign teacher if provided
   * @param {Object} data - Original data
   * @param {Object} result - Created record
   * @returns {Promise<Object>} - Result with teacher assignment
   */
  async afterCreate(data, result) {
    // If teacher_id was provided, assign the teacher as instructor
    if (data.teacher_id) {
      await this.model.assignTeacher(result.id, data.teacher_id, 'instructor');
    }
    return result;
  }

  /**
   * Before update hook - validate dependencies and business rules
   * @param {number} id - Record ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Validated data
   */
  async beforeUpdate(id, data) {
    // Validate course if provided
    if (data.course_id) {
      const [courseRows] = await db.execute(
        'SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL',
        [data.course_id]
      );
      if (courseRows.length === 0) {
        throw new NotFoundError('Course not found');
      }
    }

    // Validate semester if provided
    if (data.semester_id) {
      const [semesterRows] = await db.execute(
        'SELECT id FROM semesters WHERE id = ? AND deleted_at IS NULL',
        [data.semester_id]
      );
      if (semesterRows.length === 0) {
        throw new NotFoundError('Semester not found');
      }
    }

    // Validate teacher if provided
    if (data.teacher_id) {
      const [teacherRows] = await db.execute(
        'SELECT id FROM teachers WHERE id = ? AND deleted_at IS NULL',
        [data.teacher_id]
      );
      if (teacherRows.length === 0) {
        throw new NotFoundError('Teacher not found');
      }
    }

    // If max_students is being reduced, check if it's less than current enrollment
    if (data.max_students) {
      const [offeringRows] = await db.execute(
        'SELECT enrolled_count FROM course_offerings WHERE id = ?',
        [id]
      );
      if (offeringRows.length > 0 && data.max_students < offeringRows[0].enrolled_count) {
        throw new BusinessLogicError(
          `Cannot reduce max students to ${data.max_students}. Current enrollment is ${offeringRows[0].enrolled_count}`
        );
      }
    }

    // Check uniqueness if course_id, semester_id, or section is being changed
    if (data.course_id || data.semester_id || data.section) {
      const [currentRows] = await db.execute(
        'SELECT course_id, semester_id, section FROM course_offerings WHERE id = ?',
        [id]
      );
      
      if (currentRows.length > 0) {
        const current = currentRows[0];
        const checkCourseId = data.course_id || current.course_id;
        const checkSemesterId = data.semester_id || current.semester_id;
        const checkSection = data.section || current.section;

        const [existingRows] = await db.execute(
          `SELECT id FROM course_offerings 
           WHERE course_id = ? AND semester_id = ? AND section = ? 
           AND id != ? AND deleted_at IS NULL`,
          [checkCourseId, checkSemesterId, checkSection, id]
        );

        if (existingRows.length > 0) {
          throw new BusinessLogicError(
            'Another course offering already exists for this course, semester, and section'
          );
        }
      }
    }

    return data;
  }

  /**
   * After update hook - update teacher assignment if changed
   * @param {number} id - Record ID
   * @param {Object} data - Original data
   * @param {Object} result - Updated record
   * @returns {Promise<Object>} - Result
   */
  async afterUpdate(id, data, result) {
    // If teacher_id was updated, reassign the primary instructor
    if (data.teacher_id !== undefined) {
      if (data.teacher_id === null) {
        // Remove all instructors
        const teachers = await this.model.getTeachers(id);
        for (const teacher of teachers.filter(t => t.teaching_role === 'instructor')) {
          await this.model.removeTeacher(id, teacher.id);
        }
      } else {
        // Update to new teacher
        await this.model.assignTeacher(id, data.teacher_id, 'instructor');
      }
    }
    return result;
  }

  /**
   * Get offering with course details
   * @param {number} id - Offering ID
   * @returns {Promise<Object>} - Offering with course
   */
  async getWithCourse(id) {
    const offering = await this.findById(id);
    if (!offering) {
      throw new NotFoundError(`${this.resourceName} not found`);
    }

    offering.course = await this.model.getCourse(id);
    return offering;
  }

  /**
   * Get offering with semester details
   * @param {number} id - Offering ID
   * @returns {Promise<Object>} - Offering with semester
   */
  async getWithSemester(id) {
    const offering = await this.findById(id);
    if (!offering) {
      throw new NotFoundError(`${this.resourceName} not found`);
    }

    offering.semester = await this.model.getSemester(id);
    return offering;
  }

  /**
   * Get offering with all relationships
   * @param {number} id - Offering ID
   * @returns {Promise<Object>} - Offering with all relations
   */
  async getWithRelations(id) {
    const offering = await this.model.findByIdWithRelations(id);
    if (!offering) {
      throw new NotFoundError(`${this.resourceName} not found`);
    }
    return offering;
  }

  /**
   * Get enrolled students for an offering
   * @param {number} id - Offering ID
   * @returns {Promise<Array>} - Array of students
   */
  async getStudents(id) {
    await this.findById(id); // Verify offering exists
    return await this.model.getEnrollments(id);
  }

  /**
   * Get assessment components for an offering
   * @param {number} id - Offering ID
   * @returns {Promise<Array>} - Array of assessments
   */
  async getAssessments(id) {
    await this.findById(id); // Verify offering exists
    return await this.model.getAssessments(id);
  }

  /**
   * Get CLO attainment summary for an offering
   * @param {number} id - Offering ID
   * @returns {Promise<Array>} - CLO attainment data
   */
  async getCLOAttainment(id) {
    await this.findById(id); // Verify offering exists
    return await this.model.getCLOAttainmentSummary(id);
  }

  /**
   * Get offerings by semester
   * @param {number} semesterId - Semester ID
   * @returns {Promise<Array>} - Array of offerings
   */
  async getBySemester(semesterId) {
    return await this.model.getBySemesterId(semesterId);
  }

  /**
   * Get offerings by course
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} - Array of offerings
   */
  async getByCourse(courseId) {
    return await this.model.getByCourseId(courseId);
  }

  /**
   * Get active offerings
   * @returns {Promise<Array>} - Array of active offerings
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Assign teacher to offering
   * @param {number} offeringId - Offering ID
   * @param {number} teacherId - Teacher ID
   * @param {string} role - Teaching role
   * @returns {Promise<Object>} - Assignment result
   */
  async assignTeacher(offeringId, teacherId, role = 'instructor') {
    // Validate offering exists
    await this.findById(offeringId);

    // Validate teacher exists
    const [teacherRows] = await db.execute(
      'SELECT id FROM teachers WHERE id = ? AND deleted_at IS NULL',
      [teacherId]
    );
    if (teacherRows.length === 0) {
      throw new NotFoundError('Teacher not found');
    }

    // Validate role
    const validRoles = ['instructor', 'co_instructor', 'lab_instructor', 'teaching_assistant'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid teaching role', [
        { field: 'role', message: `Role must be one of: ${validRoles.join(', ')}` }
      ]);
    }

    return await this.model.assignTeacher(offeringId, teacherId, role);
  }

  /**
   * Remove teacher from offering
   * @param {number} offeringId - Offering ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<boolean>} - Success status
   */
  async removeTeacher(offeringId, teacherId) {
    await this.findById(offeringId); // Verify offering exists
    
    const result = await this.model.removeTeacher(offeringId, teacherId);
    if (!result) {
      throw new NotFoundError('Teacher assignment not found');
    }
    
    return result;
  }

  /**
   * Get offering statistics
   * @param {number} id - Offering ID
   * @returns {Promise<Object>} - Statistics
   */
  async getStatistics(id) {
    await this.findById(id); // Verify offering exists
    return await this.model.getStatistics(id);
  }

  /**
   * Update enrollment count
   * @param {number} id - Offering ID
   * @returns {Promise<number>} - Updated count
   */
  async updateEnrollmentCount(id) {
    await this.findById(id); // Verify offering exists
    return await this.model.updateEnrollmentCount(id);
  }

  /**
   * Check if offering has capacity
   * @param {number} id - Offering ID
   * @returns {Promise<Object>} - Capacity info
   */
  async checkCapacity(id) {
    const offering = await this.findById(id);
    const hasCapacity = await this.model.hasCapacity(id);
    
    return {
      has_capacity: hasCapacity,
      max_students: offering.max_students,
      enrolled_count: offering.enrolled_count,
      available_seats: offering.max_students - offering.enrolled_count
    };
  }

  /**
   * Search course offerings
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} - Paginated results
   */
  async search(filters = {}) {
    const { 
      course_code, 
      semester_id, 
      status, 
      section,
      page = 1, 
      limit = 10 
    } = filters;

    let where = {};
    let join = {};

    if (semester_id) {
      where.semester_id = semester_id;
    }

    if (status) {
      where.status = status;
    }

    if (section) {
      where.section = section;
    }

    // If searching by course code, we need a custom query
    if (course_code) {
      const [rows] = await db.execute(
        `SELECT co.*, c.course_code as course_code, c.course_title as course_title
         FROM course_offerings co
         INNER JOIN courses c ON co.course_id = c.id
         WHERE c.course_code LIKE ? AND co.deleted_at IS NULL
         ORDER BY c.course_code, co.section
         LIMIT ? OFFSET ?`,
        [`%${course_code}%`, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
      );

      const [countRows] = await db.execute(
        `SELECT COUNT(*) as total
         FROM course_offerings co
         INNER JOIN courses c ON co.course_id = c.id
         WHERE c.course_code LIKE ? AND co.deleted_at IS NULL`,
        [`%${course_code}%`]
      );

      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countRows[0].total,
          pages: Math.ceil(countRows[0].total / parseInt(limit))
        }
      };
    }

    return await this.findAll({ page, limit, where });
  }
}

module.exports = CourseOfferingService;
