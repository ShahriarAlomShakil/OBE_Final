const BaseService = require('./BaseService');
const Department = require('../models/Department');
const Joi = require('joi');
const { ValidationError, NotFoundError } = require('../utils/AppError');

class DepartmentService extends BaseService {
  constructor() {
    super(Department);
  }

  /**
   * Joi validation schema for creating department
   */
  getCreateValidationSchema() {
    return Joi.object({
      faculty_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Faculty ID must be a number',
          'number.positive': 'Faculty ID must be positive',
          'any.required': 'Faculty ID is required'
        }),
      name: Joi.string().min(3).max(200).required()
        .messages({
          'string.min': 'Department name must be at least 3 characters',
          'string.max': 'Department name cannot exceed 200 characters',
          'any.required': 'Department name is required'
        }),
      short_name: Joi.string().min(2).max(50).required()
        .messages({
          'string.min': 'Short name must be at least 2 characters',
          'string.max': 'Short name cannot exceed 50 characters',
          'any.required': 'Short name is required'
        }),
      code: Joi.string().min(2).max(20).required()
        .messages({
          'string.min': 'Department code must be at least 2 characters',
          'string.max': 'Department code cannot exceed 20 characters',
          'any.required': 'Department code is required'
        }),
      description: Joi.string().max(1000).allow(null, '')
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      is_active: Joi.boolean().default(true)
    });
  }

  /**
   * Joi validation schema for updating department
   */
  getUpdateValidationSchema() {
    return Joi.object({
      faculty_id: Joi.number().integer().positive()
        .messages({
          'number.base': 'Faculty ID must be a number',
          'number.positive': 'Faculty ID must be positive'
        }),
      name: Joi.string().min(3).max(200)
        .messages({
          'string.min': 'Department name must be at least 3 characters',
          'string.max': 'Department name cannot exceed 200 characters'
        }),
      short_name: Joi.string().min(2).max(50)
        .messages({
          'string.min': 'Short name must be at least 2 characters',
          'string.max': 'Short name cannot exceed 50 characters'
        }),
      code: Joi.string().min(2).max(20)
        .messages({
          'string.min': 'Department code must be at least 2 characters',
          'string.max': 'Department code cannot exceed 20 characters'
        }),
      description: Joi.string().max(1000).allow(null, '')
        .messages({
          'string.max': 'Description cannot exceed 1000 characters'
        }),
      is_active: Joi.boolean()
    });
  }

  /**
   * Lifecycle hook: Before creating a department
   */
  async beforeCreate(data) {
    // Validate faculty exists
    const facultyExists = await this.model.validateFacultyExists(data.faculty_id);
    if (!facultyExists) {
      throw new ValidationError('Faculty not found');
    }

    // Check if short name already exists
    const existingByShortName = await this.model.findByShortName(data.short_name);
    if (existingByShortName) {
      throw new ValidationError('Department with this short name already exists');
    }

    // Check if code already exists
    const existingByCode = await this.model.findByCode(data.code);
    if (existingByCode) {
      throw new ValidationError('Department with this code already exists');
    }

    return data;
  }

  /**
   * Lifecycle hook: Before updating a department
   */
  async beforeUpdate(id, data) {
    // If faculty_id is being updated, validate it exists
    if (data.faculty_id) {
      const facultyExists = await this.model.validateFacultyExists(data.faculty_id);
      if (!facultyExists) {
        throw new ValidationError('Faculty not found');
      }
    }

    // Check if short name already exists (excluding current department)
    if (data.short_name) {
      const existingByShortName = await this.model.findByShortName(data.short_name);
      if (existingByShortName && existingByShortName.id !== id) {
        throw new ValidationError('Department with this short name already exists');
      }
    }

    // Check if code already exists (excluding current department)
    if (data.code) {
      const existingByCode = await this.model.findByCode(data.code);
      if (existingByCode && existingByCode.id !== id) {
        throw new ValidationError('Department with this code already exists');
      }
    }

    return data;
  }

  /**
   * Get department with faculty relationship
   * @param {number} id - Department ID
   * @returns {Promise<Object>} Department with faculty
   */
  async getWithFaculty(id) {
    const department = await this.model.findByIdWithFaculty(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return department;
  }

  /**
   * Get department with all relationships (faculty, courses, teachers)
   * @param {number} id - Department ID
   * @returns {Promise<Object>} Department with all relationships
   */
  async getWithRelations(id) {
    const department = await this.model.findByIdWithRelations(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    return department;
  }

  /**
   * Get all active departments
   * @returns {Promise<Array>} Array of active departments
   */
  async getActive() {
    return await this.model.getActive();
  }

  /**
   * Search departments by name, short name, or code
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching departments
   */
  async search(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new ValidationError('Search term is required');
    }
    return await this.model.search(searchTerm);
  }

  /**
   * Get departments by faculty ID
   * @param {number} facultyId - Faculty ID
   * @returns {Promise<Array>} Array of departments
   */
  async getByFacultyId(facultyId) {
    // Validate faculty exists
    const facultyExists = await this.model.validateFacultyExists(facultyId);
    if (!facultyExists) {
      throw new NotFoundError('Faculty not found');
    }
    return await this.model.getByFacultyId(facultyId);
  }

  /**
   * Toggle department active status
   * @param {number} id - Department ID
   * @returns {Promise<Object>} Updated department
   */
  async toggleStatus(id) {
    const department = await this.getById(id);
    const newStatus = !department.is_active;
    return await this.update(id, { is_active: newStatus });
  }

  /**
   * Get department statistics (courses, teachers, students count)
   * @param {number} id - Department ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics(id) {
    const department = await this.getById(id);
    
    const [coursesCount, teachersCount, studentsCount] = await Promise.all([
      this.model.countCourses(id),
      this.model.countTeachers(id),
      this.model.countStudents(id)
    ]);

    return {
      department: {
        id: department.id,
        name: department.name,
        short_name: department.short_name,
        code: department.code
      },
      statistics: {
        courses: coursesCount,
        teachers: teachersCount,
        students: studentsCount
      }
    };
  }

  /**
   * Get courses for a department
   * @param {number} id - Department ID
   * @returns {Promise<Array>} Array of courses
   */
  async getCourses(id) {
    // Ensure department exists
    await this.getById(id);
    return await this.model.getCourses(id);
  }

  /**
   * Get teachers for a department
   * @param {number} id - Department ID
   * @returns {Promise<Array>} Array of teachers
   */
  async getTeachers(id) {
    // Ensure department exists
    await this.getById(id);
    return await this.model.getTeachers(id);
  }
}

module.exports = new DepartmentService();
