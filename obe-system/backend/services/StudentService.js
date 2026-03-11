const BaseService = require('./BaseService');
const Student = require('../models/Student');
const Joi = require('joi');
const { ValidationError } = require('../utils/AppError');

/**
 * StudentService
 * Business logic for student management
 */
class StudentService extends BaseService {
  constructor() {
    super(Student);
  }

  /**
   * Joi validation schema for creating a student
   */
  getCreateValidationSchema() {
    return Joi.object({
      user_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'User ID must be a number',
          'number.positive': 'User ID must be positive',
          'any.required': 'User ID is required'
        }),
      student_id: Joi.string().trim().min(3).max(50).required()
        .messages({
          'string.empty': 'Student ID (roll number) is required',
          'string.min': 'Student ID must be at least 3 characters',
          'string.max': 'Student ID cannot exceed 50 characters',
          'any.required': 'Student ID is required'
        }),
      department_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Department ID must be a number',
          'number.positive': 'Department ID must be positive',
          'any.required': 'Department ID is required'
        }),
      degree_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive',
          'any.required': 'Degree ID is required'
        }),
      batch: Joi.string().pattern(/^\d{4}$/).required()
        .messages({
          'string.pattern.base': 'Batch must be a 4-digit year (e.g., 2023)',
          'any.required': 'Batch is required'
        }),
      section: Joi.string().trim().max(10).allow(null, '')
        .messages({
          'string.max': 'Section cannot exceed 10 characters'
        }),
      admission_date: Joi.date().max('now').required()
        .messages({
          'date.base': 'Admission date must be a valid date',
          'date.max': 'Admission date cannot be in the future',
          'any.required': 'Admission date is required'
        }),
      cgpa: Joi.number().min(0).max(4).precision(2).allow(null)
        .messages({
          'number.min': 'CGPA cannot be negative',
          'number.max': 'CGPA cannot exceed 4.0'
        }),
      credits_completed: Joi.number().integer().min(0).allow(null)
        .messages({
          'number.min': 'Credits completed cannot be negative'
        })
    });
  }

  /**
   * Joi validation schema for updating a student
   */
  getUpdateValidationSchema() {
    return Joi.object({
      student_id: Joi.string().trim().min(3).max(50)
        .messages({
          'string.min': 'Student ID must be at least 3 characters',
          'string.max': 'Student ID cannot exceed 50 characters'
        }),
      department_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Department ID must be a number',
          'number.positive': 'Department ID must be positive'
        }),
      degree_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Degree ID must be a number',
          'number.positive': 'Degree ID must be positive'
        }),
      batch: Joi.string().pattern(/^\d{4}$/)
        .messages({
          'string.pattern.base': 'Batch must be a 4-digit year (e.g., 2023)'
        }),
      section: Joi.string().trim().max(10).allow(null, '')
        .messages({
          'string.max': 'Section cannot exceed 10 characters'
        }),
      admission_date: Joi.date().max('now')
        .messages({
          'date.base': 'Admission date must be a valid date',
          'date.max': 'Admission date cannot be in the future'
        }),
      cgpa: Joi.number().min(0).max(4).precision(2).allow(null)
        .messages({
          'number.min': 'CGPA cannot be negative',
          'number.max': 'CGPA cannot exceed 4.0'
        }),
      credits_completed: Joi.number().integer().min(0).allow(null)
        .messages({
          'number.min': 'Credits completed cannot be negative'
        })
    }).min(1);
  }

  /**
   * Lifecycle hook: Before creating a student
   */
  async beforeCreate(data) {
    // Validate user exists and has student role
    await this.model.validateUserExists(data.user_id);
    
    // Validate department exists
    await this.model.validateDepartmentExists(data.department_id);
    
    // Validate degree exists
    await this.model.validateDegreeExists(data.degree_id);
    
    // Check if student_id is unique
    const existing = await this.model.findByStudentId(data.student_id);
    if (existing) {
      throw new ValidationError('Student ID (roll number) already exists');
    }
    
    // Check if user already has a student profile
    const existingUser = await this.model.findByUserId(data.user_id);
    if (existingUser) {
      throw new ValidationError('User already has a student profile');
    }
    
    // Validate admission date
    if (data.admission_date) {
      this.model.validateAdmissionDate(data.admission_date);
    }
    
    return data;
  }

  /**
   * Lifecycle hook: Before updating a student
   */
  async beforeUpdate(id, data) {
    // If updating student_id, check uniqueness
    if (data.student_id) {
      const existing = await this.model.findByStudentId(data.student_id);
      if (existing && existing.id !== parseInt(id)) {
        throw new ValidationError('Student ID (roll number) already exists');
      }
    }
    
    // Validate department if being updated
    if (data.department_id) {
      await this.model.validateDepartmentExists(data.department_id);
    }
    
    // Validate degree if being updated
    if (data.degree_id) {
      await this.model.validateDegreeExists(data.degree_id);
    }
    
    // Validate admission date if being updated
    if (data.admission_date) {
      this.model.validateAdmissionDate(data.admission_date);
    }
    
    return data;
  }

  /**
   * Get student with user and academic info
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Student with relations
   */
  async getWithRelations(id) {
    return await this.model.findByIdWithRelations(id);
  }

  /**
   * Get student with user info
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Student with user
   */
  async getWithUser(id) {
    const student = await this.getById(id);
    if (!student) return null;
    
    const user = await this.model.getUser(id);
    return {
      ...student,
      user
    };
  }

  /**
   * Get student with department info
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Student with department
   */
  async getWithDepartment(id) {
    const student = await this.getById(id);
    if (!student) return null;
    
    const department = await this.model.getDepartment(id);
    return {
      ...student,
      department
    };
  }

  /**
   * Get student with degree info
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Student with degree
   */
  async getWithDegree(id) {
    const student = await this.getById(id);
    if (!student) return null;
    
    const degree = await this.model.getDegree(id);
    return {
      ...student,
      degree
    };
  }

  /**
   * Get all course enrollments for a student
   * @param {number} id - Student ID
   * @returns {Promise<Array>} Array of enrollments
   */
  async getEnrollments(id) {
    await this.getById(id); // Ensure student exists
    return await this.model.getEnrollments(id);
  }

  /**
   * Get all results/marks for a student
   * @param {number} id - Student ID
   * @param {number} courseOfferingId - Optional course offering filter
   * @returns {Promise<Array>} Array of marks
   */
  async getResults(id, courseOfferingId = null) {
    await this.getById(id); // Ensure student exists
    return await this.model.getResults(id, courseOfferingId);
  }

  /**
   * Get CLO attainments for a student
   * @param {number} id - Student ID
   * @param {number} courseOfferingId - Optional course offering filter
   * @returns {Promise<Array>} Array of CLO attainments
   */
  async getCLOAttainments(id, courseOfferingId = null) {
    await this.getById(id); // Ensure student exists
    return await this.model.getCLOAttainments(id, courseOfferingId);
  }

  /**
   * Get PLO attainments for a student
   * @param {number} id - Student ID
   * @returns {Promise<Array>} Array of PLO attainments
   */
  async getPLOAttainments(id) {
    await this.getById(id); // Ensure student exists
    return await this.model.getPLOAttainments(id);
  }

  /**
   * Get all active students
   * @returns {Promise<Array>} Array of active students
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Get student statistics (total count, by status)
   * @returns {Promise<Object>} Student statistics
   */
  async getStats() {
    return await this.model.getStats();
  }

  /**
   * Search students
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching students
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new ValidationError('Search term must be at least 2 characters');
    }
    return await this.model.search(searchTerm.trim());
  }

  /**
   * Get students by department
   * @param {number} departmentId - Department ID
   * @returns {Promise<Array>} Students in department
   */
  async getByDepartmentId(departmentId) {
    return await this.model.getByDepartmentId(departmentId);
  }

  /**
   * Get students by degree
   * @param {number} degreeId - Degree ID
   * @returns {Promise<Array>} Students in degree
   */
  async getByDegreeId(degreeId) {
    return await this.model.getByDegreeId(degreeId);
  }

  /**
   * Get students by batch
   * @param {string} batch - Batch year
   * @param {number} departmentId - Optional department filter
   * @returns {Promise<Array>} Students in batch
   */
  async getByBatch(batch, departmentId = null) {
    return await this.model.getByBatch(batch, departmentId);
  }

  /**
   * Get students by section
   * @param {string} section - Section
   * @param {string} batch - Batch year
   * @param {number} departmentId - Optional department filter
   * @returns {Promise<Array>} Students in section
   */
  async getBySection(section, batch, departmentId = null) {
    return await this.model.getBySection(section, batch, departmentId);
  }

  /**
   * Get student by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Student record
   */
  async getByUserId(userId) {
    return await this.model.findByUserId(userId);
  }

  /**
   * Get student by student ID (roll number)
   * @param {string} studentId - Student roll number
   * @returns {Promise<Object|null>} Student record
   */
  async getByStudentId(studentId) {
    return await this.model.findByStudentId(studentId);
  }

  /**
   * Get statistics for a student
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Student statistics
   */
  async getStatistics(id) {
    await this.getById(id); // Ensure student exists
    return await this.model.getStatistics(id);
  }

  /**
   * Update student CGPA
   * @param {number} id - Student ID
   * @param {number} cgpa - New CGPA value
   * @returns {Promise<Object>} Updated student
   */
  async updateCGPA(id, cgpa) {
    if (cgpa < 0 || cgpa > 4) {
      throw new ValidationError('CGPA must be between 0 and 4.0');
    }
    return await this.update(id, { cgpa });
  }

  /**
   * Update student credits completed
   * @param {number} id - Student ID
   * @param {number} credits - Credits completed
   * @returns {Promise<Object>} Updated student
   */
  async updateCreditsCompleted(id, credits) {
    if (credits < 0) {
      throw new ValidationError('Credits cannot be negative');
    }
    return await this.update(id, { credits_completed: credits });
  }
}

module.exports = new StudentService();
